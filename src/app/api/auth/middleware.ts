import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

interface CognitoJwtPayload {
  sub: string;
  email?: string;
  aud: string;
  iss: string;
  token_use: string;
  auth_time: number;
  exp: number;
  iat: number;
}

const client = jwksClient({
  jwksUri: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
});

function getKey(header: jwt.JwtHeader, callback: (err: Error | null, key?: string) => void) {
  if (!header.kid) {
    callback(new Error('Token header missing kid'));
    return;
  }
  
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export async function verifyToken(token: string): Promise<CognitoJwtPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, {
      issuer: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID}`,
      audience: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID,
    }, (err: jwt.VerifyErrors | null, decoded: jwt.JwtPayload | string | undefined) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded as CognitoJwtPayload);
      }
    });
  });
}

export async function getUserFromRequest(request: NextRequest): Promise<{ userId: string; email?: string } | null> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = await verifyToken(token);

    const user = await prisma.userIdentityProvider.findFirst({
      where: {
        provider: 'cognito',
        providerId: decoded.sub,
      },
    });

    if (!user) {
      return null;
    }

    const userData = await prisma.user.findUnique({
      where: {
        id: user.userId,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!userData) {
      return null;
    }

    return {
      userId: userData.id,
      email: userData.email, 
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}
