import { AdminTabs } from "@/components/admin/admin-tabs";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { Footer } from "@/components/layout/footer";

export default function AdminDashboardPage() {
  return (
    <main className="mx-auto w-full max-w-[1160px] px-5 pb-8 font-outfit text-palette-slate-50 sm:px-8">
      <section aria-labelledby="admin-dashboard-title" className="pt-3 sm:pt-5">
        <AdminTabs active="dashboard" />

        <div id="admin-dashboard-title">
          <AdminDashboard />
        </div>
      </section>

      <div className="pt-16 sm:pt-20">
        <Footer />
      </div>
    </main>
  );
}
