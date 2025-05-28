export function getFirebaseErrorMessage(error: any): string {
  const raw = error?.code || error?.error?.message || error?.message || "";

  console.log("kod błędu (surowy):", raw);

  if (typeof raw === "string") {
    if (raw.includes("auth/invalid-email"))
      return "Nieprawidłowy adres e-mail.";
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
  }

  return `Błąd logowania: ${raw || "nieznany"}`;
}
