import Image from "next/image";

import { SignUpForm } from "./_components/sign-up-form";

const AuthenticationPage = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-white">
      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <Image
          src="/Logo.svg"
          alt="Procon Logo"
          width={400}
          height={0}
          priority
        />
        <div className="h-auto w-full max-w-md rounded-md">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
};

export default AuthenticationPage;
