import { headers } from "next/headers";

import { AdminTabs } from "@/components/admin/admin-tabs";
import { AdminUserList } from "@/components/admin/admin-user-list";
import { Footer } from "@/components/layout/footer";
import type { SessionUser } from "@/lib/auth";

const ADMIN_USER_HEADER = "x-nexread-admin-user";

export default async function AdminUsersPage() {
  const encodedUser = (await headers()).get(ADMIN_USER_HEADER);
  let currentUserId: number | null = null;
  try {
    currentUserId = encodedUser
      ? (JSON.parse(decodeURIComponent(encodedUser)) as SessionUser).id
      : null;
  } catch {
    currentUserId = null;
  }

  return (
    <main className="mx-auto w-full max-w-[1160px] px-5 pb-8 font-outfit text-palette-slate-50 sm:px-8">
      <section aria-labelledby="user-list-title" className="pt-3 sm:pt-5">
        <AdminTabs active="users" />
        <AdminUserList currentUserId={currentUserId} />
      </section>

      <div className="pt-16 sm:pt-20">
        <Footer />
      </div>
    </main>
  );
}
