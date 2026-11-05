"use client";

import { useActionState } from "react";
import { changePassword } from "@/actions/auth";

export function PasswordForm() {
  const [msg, action, pending] = useActionState(changePassword, null);
  return (
    <form action={action} className="card space-y-4 p-5">
      <h2 className="font-medium">Change password</h2>
      <div>
        <label className="label">Current password</label>
        <input name="current" type="password" className="input" autoComplete="current-password" required />
      </div>
      <div>
        <label className="label">New password</label>
        <input name="next" type="password" className="input" autoComplete="new-password" minLength={6} required />
      </div>
      {msg && <p className={msg.startsWith("✓") ? "text-sm text-emerald-600" : "text-sm text-red-600"}>{msg}</p>}
      <button className="btn-primary" disabled={pending}>{pending ? "Saving…" : "Change password"}</button>
    </form>
  );
}
