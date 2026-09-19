"use client";

import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

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

type Resource = {
  id: string;
  name: string;
  slug?: string;
  subtitle?: string;
  booksCount?: number;
  rating?: number;
};
type ResourceResponse =
  | {
      data?: Resource[];
      meta?: { page?: number; total?: number; totalPages?: number };
    }
  | Resource[];

const PAGE_SIZE = 10;

function messageOf(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Permintaan belum dapat diproses.";
}

export function AdminResourceManager({
  resource,
  endpoint,
  categoryFields = false,
}: {
  resource: "Authors" | "Categories";
  endpoint: string;
  categoryFields?: boolean;
}) {
  const toast = useToast();
  const [items, setItems] = useState<Resource[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [deleting, setDeleting] = useState<Resource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
        });
        if (query.trim()) params.set("q", query.trim());
        const response = await fetch(`${endpoint}?${params}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const body = (await response.json().catch(() => null)) as
          | ResourceResponse
          | { message?: string }
          | null;
        if (!response.ok)
          throw new Error(
            body && "message" in body
              ? body.message
              : `Daftar ${resource.toLowerCase()} belum dapat dimuat.`,
          );
        const result = body as ResourceResponse;
        const data = Array.isArray(result) ? result : (result?.data ?? []);
        const responseMeta = Array.isArray(result) ? undefined : result?.meta;
        setItems(data);
        setMeta({
          total: responseMeta?.total ?? data.length,
          totalPages: Math.max(1, responseMeta?.totalPages ?? 1),
        });
      } catch (loadError) {
        if (!controller.signal.aborted) setError(messageOf(loadError));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [endpoint, page, query, refresh, resource]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    if (!name) return setError("Nama wajib diisi.");
    setSubmitting(true);
    try {
      const payload = {
        ...(editing ? { id: editing.id } : {}),
        name,
        ...(categoryFields
          ? {
              slug: String(form.get("slug") ?? "").trim(),
              subtitle: String(form.get("subtitle") ?? "").trim(),
            }
          : {}),
      };
      const response = await fetch(endpoint, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(body?.message || "Data belum dapat disimpan.");
      toast({
        title: `${resource.slice(0, -1)} berhasil ${editing ? "diperbarui" : "ditambahkan"}`,
        variant: "success",
      });
      setEditing(null);
      setRefresh((value) => value + 1);
    } catch (saveError) {
      setError(messageOf(saveError));
    } finally {
      setSubmitting(false);
    }
  }

  async function remove() {
    if (!deleting) return;
    setSubmitting(true);
    try {
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleting.id }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(body?.message || "Data belum dapat dihapus.");
      toast({
        title: `${resource.slice(0, -1)} berhasil dihapus`,
        variant: "success",
      });
      setDeleting(null);
      setRefresh((value) => value + 1);
    } catch (deleteError) {
      setDeleting(null);
      setError(messageOf(deleteError));
    } finally {
      setSubmitting(false);
    }
  }

  const singular = resource.slice(0, -1);
  return (
    <>
      <p className="font-mono text-[9px] font-semibold tracking-[0.28em] text-palette-cyan-300 uppercase">
        Administration / {resource}
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">
            Manage {resource}
          </h1>
          <p className="mt-1 text-sm text-palette-slate-400">
            {meta.total} registered {resource.toLowerCase()}
          </p>
        </div>
        <Button
          type="button"
          onClick={() =>
            setEditing({ id: "", name: "", slug: "", subtitle: "" })
          }
          className="bg-cyan-400 text-slate-950 hover:bg-cyan-300"
        >
          <Plus /> Add {singular}
        </Button>
      </div>
      <div className="mt-6 flex max-w-md items-center gap-2 rounded-lg border border-palette-indigo-300-20 bg-secondary px-3">
        <Search className="size-4 text-palette-slate-400" />
        <Input
          value={query}
          onChange={(event) => {
            setPage(1);
            setQuery(event.target.value);
          }}
          placeholder={`Search ${resource.toLowerCase()}...`}
          className="border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
      </div>
      <div className="mt-5 overflow-x-auto rounded-lg border border-palette-indigo-300-20 bg-card">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-secondary text-xs text-palette-slate-400">
            <tr>
              <th className="px-5 py-4">Name</th>
              {categoryFields && (
                <>
                  <th className="px-5 py-4">Slug</th>
                  <th className="px-5 py-4">Description</th>
                </>
              )}
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={categoryFields ? 4 : 2}
                  className="px-5 py-10 text-center text-palette-slate-400"
                >
                  Loading...
                </td>
              </tr>
            ) : items.length ? (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-palette-indigo-300-20"
                >
                  <td className="px-5 py-4 font-bold">{item.name}</td>
                  {categoryFields && (
                    <>
                      <td className="px-5 py-4 text-palette-slate-400">
                        {item.slug || "-"}
                      </td>
                      <td className="max-w-xs truncate px-5 py-4 text-palette-slate-400">
                        {item.subtitle || "-"}
                      </td>
                    </>
                  )}
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${item.name}`}
                        onClick={() => setEditing(item)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        aria-label={`Delete ${item.name}`}
                        onClick={() => setDeleting(item)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={categoryFields ? 4 : 2}
                  className="px-5 py-10 text-center text-palette-slate-400"
                >
                  Belum ada data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {meta.totalPages > 1 && (
        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((value) => value - 1)}
          >
            Previous
          </Button>
          <span className="px-2 py-2 text-sm text-palette-slate-400">
            Page {page}
          </span>
          <Button
            variant="outline"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((value) => value + 1)}
          >
            Next
          </Button>
        </div>
      )}
      <Dialog
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent className="border-palette-indigo-300-20 bg-card">
          <DialogTitle>
            {editing?.id ? `Edit ${singular}` : `Add ${singular}`}
          </DialogTitle>
          <DialogDescription className="mt-1 text-palette-slate-400">
            Simpan perubahan untuk memperbarui katalog.
          </DialogDescription>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <label className="block text-sm font-semibold">
              Name
              <Input
                name="name"
                defaultValue={editing?.name}
                className="mt-2"
                required
              />
            </label>
            {categoryFields && (
              <>
                <label className="block text-sm font-semibold">
                  Slug
                  <Input
                    name="slug"
                    defaultValue={editing?.slug}
                    className="mt-2"
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Description
                  <Input
                    name="subtitle"
                    defaultValue={editing?.subtitle}
                    className="mt-2"
                  />
                </label>
              </>
            )}
            <div className="flex justify-end gap-2">
              <DialogClose render={<Button variant="outline" type="button" />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Delete {singular}?</AlertDialogTitle>
          <AlertDialogDescription className="mt-2">
            This action cannot be undone. Books related to this data may prevent
            deletion.
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
                  onClick={remove}
                />
              }
            >
              {submitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog
        open={Boolean(error)}
        onOpenChange={(open) => !open && setError(null)}
      >
        <DialogContent className="border-red-400/40 bg-card">
          <DialogTitle>Action unavailable</DialogTitle>
          <DialogDescription className="mt-2 text-palette-slate-400">
            {error}
          </DialogDescription>
          <div className="mt-6 flex justify-end">
            <DialogClose render={<Button />}>Close</DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
