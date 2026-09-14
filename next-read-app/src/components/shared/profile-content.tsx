"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AUTH_CHANGED_EVENT, type SessionUser } from "@/lib/auth";
import { useToast } from "@/components/providers/app-feedback-provider";

export function ProfileContent() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "login" | "error">("loading");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const pending = useRef(false);
  const toast = useToast();

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store", signal: controller.signal });
        const body = await response.json();
        if (controller.signal.aborted) return;
        if (response.status === 401) { setStatus("login"); return; }
        if (!response.ok) throw new Error(body.message || "Profil belum dapat dimuat.");
        setUser(body.user);
        setFullName(body.user.fullName);
        setEmail(body.user.email);
        setStatus("ready");
      } catch (error) {
        if (controller.signal.aborted) return;
        setError(error instanceof Error ? error.message : "Periksa koneksi Anda.");
        setStatus("error");
      }
    }
    void load();
    return () => controller.abort();
  }, [attempt]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: fullName.trim(), email: email.trim() }),
      });
      const body = await response.json();
      if (response.status === 401) { setStatus("login"); return; }
      if (!response.ok) throw new Error(response.status === 409 ? "Email sudah digunakan oleh akun lain." : body.message || "Profil belum dapat diperbarui.");
      setUser(body.user);
      setFullName(body.user.fullName);
      setEmail(body.user.email);
      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
      toast({ title: "Profil berhasil diperbarui", variant: "success" });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Periksa koneksi Anda lalu coba kembali.");
    } finally {
      pending.current = false;
      setSaving(false);
    }
  }

  const initials = user?.fullName.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "U";
  const fieldClass = "min-w-0 w-full rounded-full border border-transparent bg-secondary px-4 py-2.5 text-sm font-semibold text-foreground outline-none focus-visible:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400/25 sm:text-right disabled:opacity-50";
  return (
    <section aria-labelledby="profile-title" className="mt-8 max-w-[720px]">
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-300">Reader identity</p>
      <h1 id="profile-title" className="mt-2 text-2xl font-extrabold text-foreground sm:text-3xl">Profile</h1>
      <div className="mt-6 rounded-[28px] border border-border bg-card p-5 shadow-[0_20px_45px_-25px_#0008] sm:p-7">
        {status === "loading" ? <p role="status" className="animate-pulse py-12 text-center text-sm text-palette-slate-400">Memuat profil…</p> :
          status === "login" ? <p className="py-8 text-center text-sm">Silakan <Link href="/login" className="font-bold text-skyblue underline">login</Link> untuk memperbarui profil.</p> :
          status === "error" ? <div role="alert" className="py-8 text-center text-sm"><p>{error}</p><button type="button" onClick={() => { setStatus("loading"); setError(""); setAttempt(value => value + 1); }} className="mt-4 rounded-full bg-secondary px-5 py-2 font-bold">Coba lagi</button></div> : <>
            <div className="flex items-center gap-4 border-b border-border pb-6">
              <span aria-hidden="true" className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 text-lg font-extrabold text-white shadow-[0_6px_20px_#22d3ee30]">{initials}</span>
              <div className="min-w-0"><h2 className="break-words font-extrabold text-foreground">{user?.fullName}</h2><p className="mt-1 text-xs text-palette-slate-400">NexRead member</p></div>
            </div>
            <form onSubmit={submit} className="mt-2" aria-busy={saving}>
              <fieldset disabled={saving}>
                <div className="grid items-center gap-2 border-b border-border py-4 sm:grid-cols-[150px_minmax(0,1fr)]"><label htmlFor="profile-name" className="text-xs text-palette-slate-400">Name</label><input id="profile-name" name="fullName" autoComplete="name" required value={fullName} onChange={event => setFullName(event.target.value)} className={fieldClass} /></div>
                <div className="grid items-center gap-2 border-b border-border py-4 sm:grid-cols-[150px_minmax(0,1fr)]"><label htmlFor="profile-email" className="text-xs text-palette-slate-400">Email</label><input id="profile-email" name="email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} className={fieldClass} /></div>
                <div className="grid items-center gap-2 py-4 sm:grid-cols-[150px_minmax(0,1fr)]"><label htmlFor="profile-phone" className="text-xs text-palette-slate-400">Nomor Handphone</label><div><input id="profile-phone" type="tel" disabled placeholder="Belum tersedia" aria-describedby="profile-phone-help" className={fieldClass} /><p id="profile-phone-help" className="mt-2 text-[11px] text-palette-slate-400 sm:text-right">Pembaruan nomor handphone belum tersedia.</p></div></div>
              </fieldset>
              {error && <p role="alert" className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
              <button type="submit" disabled={saving || !fullName.trim() || (fullName.trim() === user?.fullName && email.trim() === user?.email)} className="mt-2 w-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 px-6 py-3 text-sm font-extrabold text-white shadow-[0_6px_20px_#22d3ee25] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Menyimpan…" : "Update Profile"}</button>
            </form>
          </>}
      </div>
    </section>
  );
}
