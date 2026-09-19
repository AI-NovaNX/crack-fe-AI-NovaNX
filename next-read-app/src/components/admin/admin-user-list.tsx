"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { getAvatarSrc, getInitials } from "@/lib/avatar";
import { normalizeRole } from "@/lib/roles";
import { useToast } from "@/components/providers/app-feedback-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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

export function AdminUserList({
  currentUserId,
}: {
  currentUserId?: number | null;
} = {}) {
  const toast = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deactivating, setDeactivating] = useState<AdminUser | null>(null);
  const [actionError, setActionError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUsers() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
        });
        if (query.trim()) params.set("q", query.trim());
        const response = await fetch(`/api/admin/users?${params}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const body = (await response.json().catch(() => null)) as
          | UsersResponse
          | { message?: string }
          | null;
        if (!response.ok) {
          throw new Error(
            body && "message" in body && body.message
              ? body.message
              : "User list could not be loaded.",
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
            : "User list could not be loaded.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadUsers();
    return () => controller.abort();
  }, [attempt, page, query]);

  async function deactivateUser() {
    if (!deactivating) return;
    const target = deactivating;
    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: target.id }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || "The member could not be deactivated.");
      }
      setUsers((current) => current.filter((user) => user.id !== target.id));
      setMeta((current) => ({
        ...current,
        total: Math.max(0, current.total - 1),
      }));
      toast({
        title: "Member deactivated successfully",
        description: target.fullName,
        variant: "success",
      });
    } catch (deactivateErr) {
      setActionError(
        deactivateErr instanceof Error
          ? deactivateErr.message
          : "The member could not be deactivated.",
      );
    } finally {
      setDeactivating(null);
      setSubmitting(false);
    }
  }

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

      <div className="mt-6 flex max-w-md items-center gap-2 rounded-lg border border-palette-indigo-300-20 bg-secondary px-3">
        <Search className="size-4 text-palette-slate-400" aria-hidden="true" />
        <Input
          value={query}
          onChange={(event) => {
            setPage(1);
            setQuery(event.target.value);
          }}
          placeholder="Search users..."
          className="border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="mt-7 overflow-hidden rounded-[28px] border border-palette-indigo-300-20 bg-gray-200 shadow-[0_28px_70px_-32px_rgba(0,0,0,0.6)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-left">
            <caption className="sr-only">
              List of registered NexRead users
            </caption>
            <thead className="bg-white/5 font-mono text-[9px] tracking-[0.2em] text-palette-slate-400 uppercase">
              <tr>
                <th scope="col" className="px-7 py-5 font-medium">
                  User
                </th>
                <th scope="col" className="px-5 py-5 font-medium">
                  Email
                </th>
                <th scope="col" className="px-5 py-5 font-medium">
                  Phone
                </th>
                <th scope="col" className="px-5 py-5 font-medium">
                  Joined
                </th>
                <th scope="col" className="px-5 py-5 font-medium">
                  Role
                </th>
                <th scope="col" className="px-7 py-5 text-right font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {loading ? (
                Array.from({ length: 5 }, (_, index) => (
                  <tr
                    key={index}
                    className="border-t border-palette-indigo-300-20"
                  >
                    <td colSpan={6} className="px-7 py-5">
                      <div className="h-10 animate-pulse rounded-xl bg-white/5" />
                    </td>
                  </tr>
                ))
              ) : error ? (
                <tr className="border-t border-palette-indigo-300-20">
                  <td
                    colSpan={6}
                    className="px-7 py-14 text-center text-red-300"
                  >
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
                  <td
                    colSpan={6}
                    className="px-7 py-14 text-center text-palette-slate-400"
                  >
                    No registered users yet.
                  </td>
                </tr>
              ) : (
                users.map((user, index) => {
                  const avatarSrc = getAvatarSrc(user.avatar);
                  return (
                    <tr
                      key={user.id}
                      className="border-t border-palette-indigo-300-20 transition-colors hover:bg-white/[0.035]"
                    >
                      <th
                        scope="row"
                        className="px-7 py-5 font-extrabold whitespace-nowrap"
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={`flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${avatarGradients[index % avatarGradients.length]} text-[10px] font-extrabold text-white shadow-lg`}
                          >
                            {avatarSrc ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={avatarSrc}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              getInitials(user.fullName)
                            )}
                          </span>
                          {user.fullName}
                        </span>
                      </th>
                      <td className="px-5 py-5 text-palette-slate-400">
                        {user.email}
                      </td>
                      <td className="px-5 py-5 whitespace-nowrap text-palette-slate-400">
                        {user.phoneNumber || "—"}
                      </td>
                      <td className="px-5 py-5 whitespace-nowrap text-palette-slate-400">
                        {formatJoinedDate(user.createdAt)}
                      </td>
                      <td className="px-5 py-5">
                        <span className="inline-flex rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-[9px] font-extrabold text-violet-200 capitalize">
                          {normalizeRole(user.role)}
                        </span>
                      </td>
                      <td className="px-7 py-5 text-right">
                        <button
                          type="button"
                          disabled={user.id === currentUserId}
                          onClick={() => setDeactivating(user)}
                          className="rounded-full border border-red-300/30 bg-red-400/10 px-4 py-2 text-[10px] font-bold text-red-300 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Deactivate Member
                        </button>
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
        <nav
          aria-label="User list pagination"
          className="mt-5 flex items-center justify-end gap-3 text-xs"
        >
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((value) => value - 1)}
            className="pagination-button disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-palette-slate-400">
            Page {meta.page} of {meta.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((value) => value + 1)}
            className="pagination-button disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </nav>
      )}

      <Dialog
        open={Boolean(error)}
        onOpenChange={(open) => !open && setError("")}
      >
        <DialogContent className="border-red-400/40 bg-card">
          <DialogTitle>Users unavailable</DialogTitle>
          <DialogDescription className="mt-2 text-palette-slate-400">
            {error}
          </DialogDescription>
          <div className="mt-6 flex justify-end gap-2">
            <DialogClose render={<Button variant="outline" />}>
              Close
            </DialogClose>
            <DialogClose
              render={
                <Button onClick={() => setAttempt((value) => value + 1)} />
              }
            >
              Try again
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deactivating)}
        onOpenChange={(open) => !open && setDeactivating(null)}
      >
        <AlertDialogContent>
          <AlertDialogTitle>
            Deactivate {deactivating?.fullName}?
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-2">
            This member will no longer be able to sign in or borrow books.
            This action cannot be undone.
          </AlertDialogDescription>
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialogCancel render={<Button variant="outline" />}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              render={
                <Button
                  variant="destructive"
                  disabled={submitting}
                  onClick={deactivateUser}
                />
              }
            >
              {submitting ? "Deactivating..." : "Deactivate Member"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={Boolean(actionError)}
        onOpenChange={(open) => !open && setActionError("")}
      >
        <DialogContent className="border-red-400/40 bg-card">
          <DialogTitle>Action unavailable</DialogTitle>
          <DialogDescription className="mt-2 text-palette-slate-400">
            {actionError}
          </DialogDescription>
          <div className="mt-6 flex justify-end">
            <DialogClose render={<Button />}>Close</DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
