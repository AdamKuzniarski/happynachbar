export const TOAST_MESSAGES = {
  auth: {
    loginFailed: "Login fehlgeschlagen. Bitte prüfe deine Daten.",
    loginSuccess: "Willkommen zurück!",
    registerEmailInUse: "Diese E-Mail ist bereits registriert.",
    reloginRequired: "Bitte neu einloggen.",
  },
  activity: {
    created: "Aktivität erstellt.",
    saved: "Aktivität gespeichert.",
    deleted: "Aktivität gelöscht.",
    notOwner:
      "Du kannst nur Aktivitäten bearbeiten/löschen, die du auch erstellt hast",
  },
} as const;
