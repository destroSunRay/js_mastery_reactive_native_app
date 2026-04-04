export const NODE_ENV: string = process.env.EXPO_NODE_ENV || "development";

export const API_URL: string =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

export const APP_NAME: string =
  process.env.EXPO_PUBLIC_APPLICATION_NAME || "Pennylogs";

export const APP_DESCRIPTION: string =
  process.env.EXPO_PUBLIC_APPLICATION_DESCRIPTION ||
  "Finance made simple with Pennylogs";

export const FRONTEND_URL: string =
  process.env.EXPO_PUBLIC_FRONTEND_URL || "http://localhost:5173";

// PostHog configuration
export const POSTHOG_KEY: string = process.env.EXPO_PUBLIC_POSTHOG_KEY || "";

export const POSTHOG_HOST: string =
  process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
