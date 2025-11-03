import { ThemeProvider } from "next-themes";

import { SignUpForm } from "./_components/sign-up-form";

const AuthenticationPage = () => {
  return (
    <ThemeProvider attribute="class" forcedTheme="light" enableSystem={false}>
      <div className="flex min-h-svh flex-col items-center justify-center bg-white p-6 md:p-10">
        <div className="w-full max-w-sm md:max-w-3xl">
          <SignUpForm />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default AuthenticationPage;
