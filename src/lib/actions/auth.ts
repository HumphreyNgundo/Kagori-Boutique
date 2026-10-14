"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signIn, signOut } from "@/lib/auth/session";
import { homeFor } from "@/lib/auth/rbac";

export interface LoginState {
  error: string | null;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const result = await signIn(email, password);
  if (!result.ok) return { error: result.error };

  revalidatePath("/", "layout");
  redirect(homeFor(result.user.role));
}

export async function logoutAction() {
  await signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
