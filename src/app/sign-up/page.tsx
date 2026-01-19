import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import { SignUpForm } from "./_components/sign-up-form";

const AuthenticationPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect("/atendimento");
  }

  return (
    <div
      className="relative flex h-screen w-full flex-col items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/CapaAuthentication.png')",
      }}
    >
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[#003173]/20 backdrop-blur-sm">
        <Image
          src="/Logo.svg"
          alt="Procon Logo"
          width={300}
          height={0}
          priority
          className="absolute top-4 left-4 z-10"
        />
        <div className="h-auto w-full max-w-md rounded-md">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
};

export default AuthenticationPage;
