"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="card space-y-4 p-6 shadow-sm">
      <div>
        <label className="label" htmlFor="username">Username</label>
        <input id="username" name="username" className="input" autoComplete="username" autoFocus required />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" className="input" autoComplete="current-password" required />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="btn-primary w-full py-2" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
