import { prisma } from '@/lib/prisma';

export class AuthService {
  async syncUser(cognitoId: string, email: string, apiKey: string) {
    // Validate API key (you should implement proper API key validation)
    if (!this.validateApiKey(apiKey)) {
      throw new Error('Invalid API key');
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
      include: { identityProviders: true }
    });

    if (user) {
      // Check if Cognito identity provider already exists
      const cognitoProvider = user.identityProviders.find(
        provider => provider.provider === 'cognito' && provider.providerId === cognitoId
      );

      if (!cognitoProvider) {
        // Add Cognito identity provider
        await prisma.userIdentityProvider.create({
          data: {
            provider: 'cognito',
            providerId: cognitoId,
            userId: user.id,
          }
        });
      }
    } else {
      // Create new user with Cognito identity provider
      user = await prisma.user.create({
        data: {
          email,
          identityProviders: {
            create: {
              provider: 'cognito',
              providerId: cognitoId,
            }
          }
        },
        include: { identityProviders: true }
      });
    }

    return user;
  }

  private validateApiKey(apiKey: string): boolean {
    // Implement your API key validation logic here
    // For now, just check if it exists and matches expected format
    const expectedApiKey = process.env.LAMBDA_TRIGGER_API_TOKEN;
    return apiKey === expectedApiKey;
  }
}