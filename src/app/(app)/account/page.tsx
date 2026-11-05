import { requireUser } from "@/lib/auth";
import { PasswordForm } from "./password-form";

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <main className="mx-auto w-full max-w-md p-6">
      <h1 className="mb-1 text-lg font-semibold">Account</h1>
      <p className="mb-6 text-sm text-zinc-500">Signed in as <b>{user.username}</b></p>
      <PasswordForm />
    </main>
  );
}
