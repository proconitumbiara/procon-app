import { SignUpForm } from "./_components/sign-up-form";

const AuthenticationPage = () => {
  return (
    <div className="bg-white flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <SignUpForm />
      </div>
    </div>
  );
}

export default AuthenticationPage;