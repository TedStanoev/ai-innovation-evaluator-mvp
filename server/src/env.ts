import "dotenv/config";

const REQUIRED_SERVER_ENV_KEYS = [
  "PORT",
  "API_URL",
  "CLIENT_ORIGIN",
  "GEMINI_API_KEY",
  "GOOGLE_GENAI_API_KEY",
  "ENABLE_FIRESTORE",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_API_KEY",
  "FIREBASE_AUTH_DOMAIN",
  "FIREBASE_STORAGE_BUCKET",
  "FIREBASE_MESSAGING_SENDER_ID",
  "FIREBASE_APP_ID",
] as const;

export type ServerEnvKey = (typeof REQUIRED_SERVER_ENV_KEYS)[number];

export interface ServerEnv {
  PORT: number;
  API_URL: string;
  CLIENT_ORIGIN: string;
  GEMINI_API_KEY: string;
  GOOGLE_GENAI_API_KEY: string;
  ENABLE_FIRESTORE: boolean;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_STORAGE_BUCKET: string;
  FIREBASE_MESSAGING_SENDER_ID: string;
  FIREBASE_APP_ID: string;
  FIREBASE_CLIENT_EMAIL?: string;
  FIREBASE_PRIVATE_KEY?: string;
  K_SERVICE?: string;
  GOOGLE_APPLICATION_CREDENTIALS?: string;
}

export function validateServerEnv(): {
  isValid: boolean;
  missingKeys: ServerEnvKey[];
  env: ServerEnv;
} {
  const missingKeys: ServerEnvKey[] = [];

  for (const key of REQUIRED_SERVER_ENV_KEYS) {
    const val = process.env[key];
    if (val === undefined || String(val).trim() === "") {
      missingKeys.push(key);
    }
  }

  if (missingKeys.length > 0) {
    console.error(
      `[EnvValidator][Server] Missing required environment variables in server/.env: ${missingKeys.join(
        ", "
      )}`
    );
  }

  return {
    isValid: missingKeys.length === 0,
    missingKeys,
    env: {
      PORT: Number(process.env.PORT),
      API_URL: process.env.API_URL ?? "",
      CLIENT_ORIGIN: process.env.CLIENT_ORIGIN ?? "",
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "",
      GOOGLE_GENAI_API_KEY: process.env.GOOGLE_GENAI_API_KEY ?? "",
      ENABLE_FIRESTORE: process.env.ENABLE_FIRESTORE === "true",
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ?? "",
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY ?? "",
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN ?? "",
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET ?? "",
      FIREBASE_MESSAGING_SENDER_ID:
        process.env.FIREBASE_MESSAGING_SENDER_ID ?? "",
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID ?? "",
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n"
      ),
      K_SERVICE: process.env.K_SERVICE,
      GOOGLE_APPLICATION_CREDENTIALS:
        process.env.GOOGLE_APPLICATION_CREDENTIALS,
    },
  };
}

export const serverEnvValidation = validateServerEnv();
export const serverEnv = serverEnvValidation.env;
