export const AUTH_CHANGED_EVENT = "nexread-auth-changed";
export type SessionUser = {
  id: number;
  fullName: string;
  email: string;
  role: string;
  phoneNumber?: string | null;
  avatar?: string | null;
};
export async function submitAuth(
  action: "login" | "register" | "logout",
  values?: object,
) {
  let response: Response;
  try {
    response = await fetch(`/api/auth/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values ?? {}),
    });
  } catch {
    throw new Error(
      "Unable to connect to NexRead. Check your connection and try again.",
    );
  }
  const body = await response.json();
  if (!response.ok)
    throw new Error(getHttpErrorMessage(response.status, body.message));
  // Remove credentials left behind by the old mock login flow.
  for (const key of ["registeredUser", "isLoggedIn", "currentUser"])
    localStorage.removeItem(key);
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  return body as { user?: SessionUser };
}
import { getHttpErrorMessage } from "@/lib/error-message";
