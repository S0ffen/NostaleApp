export function getFirebaseErrorMessage(error: unknown): string {
  type FirebaseErrorLike = {
    code?: string;
    message?: string;
    error?: {
      message?: string;
    };
  };

  const firebaseError = error as FirebaseErrorLike;

  const raw =
    firebaseError.code ||
    firebaseError.error?.message ||
    firebaseError.message ||
    (typeof error === "string" ? error : "");

  console.error("kod błędu (surowy):", raw);

  if (raw.includes("auth/invalid-email")) return "Nieprawidłowy adres e-mail.";
  if (raw.includes("auth/user-not-found")) return "Użytkownik nie istnieje.";
  if (raw.includes("auth/wrong-password")) return "Nieprawidłowe hasło.";
  if (
    raw.includes("auth/too-many-requests") ||
    raw.includes("TOO_MANY_ATTEMPTS_TRY_LATER")
  )
    return "Zbyt wiele prób logowania. Spróbuj później.";
  if (
    raw.includes("auth/invalid-credential") ||
    raw.includes("INVALID_LOGIN_CREDENTIALS")
  )
    return "Nieprawidłowy login lub hasło.";

  return `Błąd logowania: ${raw || "nieznany"}`;
}
