"use server";

import { revalidatePath } from "next/cache";
import { subscribeToNewsletter } from "@/lib/repo/admin";
import type { ActionState } from "@/lib/actions/state";

/** Footer newsletter sign-up. Open to shoppers, so no permission check. */
export async function subscribeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const result = await subscribeToNewsletter(String(formData.get("email") ?? ""));
  if (!result.ok) return { error: result.error, ok: null };

  revalidatePath("/", "layout");
  return { error: null, ok: "You're on the list — look out for new arrivals and offers." };
}
