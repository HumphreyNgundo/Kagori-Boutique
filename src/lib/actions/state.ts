/** Shared shape for server-action results surfaced with useActionState. */
export interface ActionState {
  error: string | null;
  ok: string | null;
}

export const IDLE: ActionState = { error: null, ok: null };
