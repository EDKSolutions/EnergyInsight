import React, { Suspense } from "react";
import SignInForm from '@/components/auth/SignInForm'

export default function SignIn() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
