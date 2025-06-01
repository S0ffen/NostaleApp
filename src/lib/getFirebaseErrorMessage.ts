export function getFirebaseErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as any).code === "string"
  ) {
    const code = (error as any).code;

    switch (code) {
      case "auth/invalid-email":
        return "Nieprawidłowy adres e-mail.";
      case "auth/user-not-found":
        return "Użytkownik nie istnieje.";
      case "auth/wrong-password":
        return "Nieprawidłowe hasło.";
      case "auth/too-many-requests":
        return "Zbyt wiele prób logowania. Spróbuj później.";
      case "auth/invalid-credential":
      case "INVALID_LOGIN_CREDENTIALS":
        return "Nieprawidłowy login lub hasło.";
    }
  }

  return "Wystąpił nieznany błąd.";
}
