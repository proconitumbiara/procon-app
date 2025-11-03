import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import LoginForm from "./_components/login-form";

const AuthenticationPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect("/atendimento");
  }

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
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default AuthenticationPage;
