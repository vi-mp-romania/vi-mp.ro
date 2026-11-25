/** Turns a caught value into the text shown to the user. */

/** The message of an Error (ApiError messages are written for users), or the value as text. */
export function errorMessage(failure: unknown): string {
  return failure instanceof Error ? failure.message : String(failure);
}
