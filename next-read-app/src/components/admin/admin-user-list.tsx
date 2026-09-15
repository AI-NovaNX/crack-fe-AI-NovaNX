"use client";

import { useEffect, useState } from "react";

import { getAvatarSrc, getInitials } from "@/lib/avatar";
import { normalizeRole } from "@/lib/roles";

type AdminUser = {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  avatar: string | null;
  role: string;
  createdAt: string;
};

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type UsersResponse = {
  data: AdminUser[];
  meta: PaginationMeta;
};

const PAGE_SIZE = 10;
const avatarGradients = [
  "from-cyan-400 to-blue-500",
  "from-fuchsia-400 to-violet-600",
  "from-blue-400 to-indigo-600",
  "from-teal-300 to-cyan-600",
  "from-indigo-500 to-violet-600",
];

function formatJoinedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function AdminUserList() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadUsers() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `/api/admin/users?page=${page}&limit=${PAGE_SIZE}`,
          { cache: "no-store", signal: controller.signal },
        );
        const body = (await response.json().catch(() => null)) as
          | UsersResponse
          | { message?: string }
          | null;
        if (!response.ok) {
          throw new Error(
            body && "message" in body && body.message
              ? body.message
              : "User list belum dapat dimuat.",
          );
        }
        const result = body as UsersResponse;
        setUsers(Array.isArray(result.data) ? result.data : []);
        setMeta(result.meta);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setUsers([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "User list belum dapat dimuat.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadUsers();
    return () => controller.abort();
  }, [attempt, page]);

  return (
    <>
      <p className="font-mono text-[9px] font-semibold tracking-[0.28em] text-palette-cyan-300 uppercase">
        Administration / Users
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <h1
          id="user-list-title"
          className="text-2xl font-extrabold tracking-tight sm:text-3xl"
        >
          User List
        </h1>
        <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 font-mono text-[8px] font-semibold tracking-[0.2em] text-palette-cyan-300 uppercase shadow-[0_0_24px_rgba(34,211,238,0.08)]">
          {loading ? "Loading Users" : `${meta.total} Registered Users`}
        </span>
      </div>

      <div className="mt-7 overflow-hidden rounded-[28px] border border-palette-indigo-300-20 bg-gray-200 shadow-[0_28px_70px_-32px_rgba(0,0,0,0.6)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-left">
            <caption className="sr-only">
              Daftar pengguna NexRead yang terdaftar
            </caption>
            <thead className="bg-white/5 font-mono text-[9px] tracking-[0.2em] text-palette-slate-400 uppercase">
              <tr>
                <th scope="col" className="px-7 py-5 font-medium">User</th>
                <th scope="col" className="px-5 py-5 font-medium">Email</th>
                <th scope="col" className="px-5 py-5 font-medium">Phone</th>
                <th scope="col" className="px-5 py-5 font-medium">Joined</th>
                <th scope="col" className="px-7 py-5 text-right font-medium">Role</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {loading ? (
                Array.from({ length: 5 }, (_, index) => (
                  <tr key={index} className="border-t border-palette-indigo-300-20">
                    <td colSpan={5} className="px-7 py-5">
                      <div className="h-10 animate-pulse rounded-xl bg-white/5" />
                    </td>
                  </tr>
                ))
              ) : error ? (
                <tr className="border-t border-palette-indigo-300-20">
                  <td colSpan={5} className="px-7 py-14 text-center text-red-300">
                    <p>{error}</p>
                    <button
                      type="button"
                      onClick={() => setAttempt((value) => value + 1)}
                      className="mt-4 rounded-full border border-red-300/30 bg-red-400/10 px-4 py-2 text-xs font-bold transition hover:bg-red-400/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300"
                    >
                      Try again
                    </button>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr className="border-t border-palette-indigo-300-20">
                  <td colSpan={5} className="px-7 py-14 text-center text-palette-slate-400">
                    Belum ada pengguna terdaftar.
                  </td>
                </tr>
              ) : (
                users.map((user, index) => {
                  const avatarSrc = getAvatarSrc(user.avatar);
                  return (
                    <tr key={user.id} className="border-t border-palette-indigo-300-20 transition-colors hover:bg-white/[0.035]">
                      <th scope="row" className="px-7 py-5 font-extrabold whitespace-nowrap">
                        <span className="flex items-center gap-3">
                          <span className={`flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${avatarGradients[index % avatarGradients.length]} text-[10px] font-extrabold text-white shadow-lg`}>
                            {avatarSrc ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
                            ) : getInitials(user.fullName)}
                          </span>
                          {user.fullName}
                        </span>
                      </th>
                      <td className="px-5 py-5 text-palette-slate-400">{user.email}</td>
                      <td className="px-5 py-5 whitespace-nowrap text-palette-slate-400">{user.phoneNumber || "—"}</td>
                      <td className="px-5 py-5 whitespace-nowrap text-palette-slate-400">{formatJoinedDate(user.createdAt)}</td>
                      <td className="px-7 py-5 text-right">
                        <span className="inline-flex rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-[9px] font-extrabold text-violet-200 capitalize">
                          {normalizeRole(user.role)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && !error && meta.totalPages > 1 && (
        <nav aria-label="User list pagination" className="mt-5 flex items-center justify-end gap-3 text-xs">
          <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="pagination-button disabled:cursor-not-allowed disabled:opacity-40">
            Previous
          </button>
          <span className="text-palette-slate-400">Page {meta.page} of {meta.totalPages}</span>
          <button type="button" disabled={page >= meta.totalPages} onClick={() => setPage((value) => value + 1)} className="pagination-button disabled:cursor-not-allowed disabled:opacity-40">
            Next
          </button>
        </nav>
      )}
    </>
  );
}
