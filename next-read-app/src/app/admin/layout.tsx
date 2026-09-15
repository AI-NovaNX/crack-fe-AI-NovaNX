import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { RouteLayoutProps } from "@/types/layout";
import { AdminHeader } from "@/components/admin/admin-header";
import { pageBackgroundClassName } from "@/lib/page-background";
import { getInitials } from "@/lib/avatar";
import type { SessionUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";

const ADMIN_USER_HEADER = "x-nexread-admin-user";

export default async function AdminLayout({ children }: RouteLayoutProps) {
  const encodedUser = (await headers()).get(ADMIN_USER_HEADER);
  let user: SessionUser | null = null;

  try {
    user = encodedUser
      ? (JSON.parse(decodeURIComponent(encodedUser)) as SessionUser)
      : null;
  } catch {
    user = null;
  }

  if (!user) redirect("/login");
  if (!isAdminRole(user.role)) redirect("/");

  return (
    <div className={pageBackgroundClassName}>
      <div className="mx-auto w-full max-w-[1160px] px-5 py-5 sm:px-8">
        <AdminHeader
          user={{
            name: user.fullName,
            initials: getInitials(user.fullName),
            avatar: user.avatar,
          }}
        />
      </div>
      {children}
    </div>
  );
}
