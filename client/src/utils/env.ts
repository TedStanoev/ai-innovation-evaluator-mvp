const REQUIRED_CLIENT_ENV_KEYS = [
  "VITE_API_BASE_URL",
  "VITE_ENABLE_FIREBASE",
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
] as const;

export type ClientEnvKey = (typeof REQUIRED_CLIENT_ENV_KEYS)[number];

export interface ClientEnv {
  VITE_API_BASE_URL: string;
  VITE_ENABLE_FIREBASE: boolean;
  VITE_FIREBASE_API_KEY: string;
  VITE_FIREBASE_AUTH_DOMAIN: string;
  VITE_FIREBASE_PROJECT_ID: string;
  VITE_FIREBASE_STORAGE_BUCKET: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  VITE_FIREBASE_APP_ID: string;
}

export function validateClientEnv(): {
  isValid: boolean;
  missingKeys: ClientEnvKey[];
  env: ClientEnv;
} {
  const rawEnv = import.meta.env as Record<string, string | undefined>;
  const missingKeys: ClientEnvKey[] = [];

  for (const key of REQUIRED_CLIENT_ENV_KEYS) {
    const val = rawEnv[key];
    if (val === undefined || String(val).trim() === "") {
      missingKeys.push(key);
    }
  }

  if (missingKeys.length > 0) {
    console.error(
      `[EnvValidator][Client] Missing required environment variables in client/.env: ${missingKeys.join(
        ", "
      )}`
    );
  }

  return {
    isValid: missingKeys.length === 0,
    missingKeys,
    env: {
      VITE_API_BASE_URL: rawEnv.VITE_API_BASE_URL ?? "",
      VITE_ENABLE_FIREBASE: rawEnv.VITE_ENABLE_FIREBASE === "true",
      VITE_FIREBASE_API_KEY: rawEnv.VITE_FIREBASE_API_KEY ?? "",
      VITE_FIREBASE_AUTH_DOMAIN: rawEnv.VITE_FIREBASE_AUTH_DOMAIN ?? "",
      VITE_FIREBASE_PROJECT_ID: rawEnv.VITE_FIREBASE_PROJECT_ID ?? "",
      VITE_FIREBASE_STORAGE_BUCKET: rawEnv.VITE_FIREBASE_STORAGE_BUCKET ?? "",
      VITE_FIREBASE_MESSAGING_SENDER_ID:
        rawEnv.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
      VITE_FIREBASE_APP_ID: rawEnv.VITE_FIREBASE_APP_ID ?? "",
    },
  };
}

export const clientEnvValidation = validateClientEnv();
export const clientEnv = clientEnvValidation.env;
