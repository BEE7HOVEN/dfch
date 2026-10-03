"use client";

import { useActionState } from "react";
import { loginAction, type FormState } from "@/app/admin/actions";

const initialState: FormState = {};

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label
          htmlFor="password"
          className="block text-sm text-sub mb-2"
        >
          관리자 비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full px-4 py-3 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-forest/30"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 bg-forest text-white rounded-lg hover:bg-forest-deep transition-colors disabled:opacity-50"
      >
        {pending ? "확인 중..." : "로그인"}
      </button>
    </form>
  );
}
