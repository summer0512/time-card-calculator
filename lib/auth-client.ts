"use client";
import { beginLogin, failLogin, type AnalyticsContext } from "./analytics";
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient();

export async function signInWithGoogle(callbackURL: string, context: AnalyticsContext, entryPoint: "header" | "mobile_menu" | "my_time_cards" | "save" | "share") {
  beginLogin(context, entryPoint);
  try {
    const result = await authClient.signIn.social({ provider: "google", callbackURL });
    if (result.error) failLogin(context, entryPoint);
    return result;
  } catch (error) {
    failLogin(context, entryPoint);
    throw error;
  }
}
