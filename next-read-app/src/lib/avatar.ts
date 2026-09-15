import { API_BASE_URL } from "@/lib/api";

export const DEFAULT_AVATAR_SRC = "/assets/images/user-avatar.svg";

export function getInitials(name?: string | null) {
  return (
    name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"
  );
}

export function getAvatarSrc(avatar?: string | null) {
  if (!avatar) return null;
  if (/^(blob:|data:|https?:\/\/)/.test(avatar)) return avatar;
  if (avatar.startsWith("/assets/") || avatar.startsWith("/images/"))
    return avatar;
  if (avatar.startsWith("/")) {
    const apiOrigin = API_BASE_URL.replace(/\/api\/?$/, "");
    return apiOrigin ? `${apiOrigin}${avatar}` : avatar;
  }
  return avatar;
}
