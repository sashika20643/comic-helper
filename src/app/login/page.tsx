import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await getUser()) redirect("/");
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-indigo-600 text-2xl text-white">
            💥
          </div>
          <h1 className="text-xl font-semibold">Comic Helper</h1>
          <p className="text-sm text-zinc-500">Sign in to continue</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
