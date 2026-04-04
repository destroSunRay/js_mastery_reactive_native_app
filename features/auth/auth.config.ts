import { expoClient } from "@better-auth/expo/client";
import { stripeClient } from "@better-auth/stripe/client";
import {
  inferAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

import { API_BASE_URL } from "@/utils/axios";

console.log("API_BASE_URL:", API_BASE_URL);

// Create better-auth client
export const auth = createAuthClient({
  baseURL: `${API_BASE_URL}`,
  plugins: [
    organizationClient(),
    stripeClient({
      subscription: true,
    }),
    expoClient({
      storagePrefix: "js-mastery-auth",
      storage: SecureStore,
    }),
    inferAdditionalFields({
      user: {
        timezone: {
          type: "string",
          defaultValue: "EST",
        },
        locale: {
          type: "string",
          defaultValue: "en-US",
        },
        currency: {
          type: "string",
          defaultValue: "USD",
        },
        subscriptionTier: {
          type: "string",
          defaultValue: "free",
        },
        trialAllowed: {
          type: "boolean",
          defaultValue: true,
        },
        preferences: {
          type: "string", // JSON string
          defaultValue: JSON.stringify({
            theme: "system",
            notifications: {
              email: true,
              push: true,
              budgetAlerts: true,
              goalReminders: true,
            },
            privacy: {
              profileVisibility: "private",
              transactionVisibility: "private",
            },
          }),
        },
      },
    }),
  ],
});

export default auth;
