/**
 * Shared shape for `useActionState` form results.
 *
 * This lives outside the "use server" module on purpose: such a module may only
 * export async functions, so exporting a plain object like `initialFormState`
 * from it is a runtime error ("A 'use server' file can only export async
 * functions, found object").
 */
export interface FormState {
  status: "idle" | "success" | "error";
  message?: string;
  /** Field-level errors keyed by input name. */
  errors?: Record<string, string>;
}

export const initialFormState: FormState = { status: "idle" };
