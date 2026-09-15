import { AdminLoanList } from "@/components/admin/admin-loan-list";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { Footer } from "@/components/layout/footer";

export default function AdminLoansPage() {
  return (
    <main className="mx-auto w-full max-w-[1160px] px-5 pb-8 font-outfit text-palette-slate-50 sm:px-8">
      <section aria-labelledby="borrowed-list-title" className="pt-3 sm:pt-5">
        <AdminTabs active="loans" />
        <AdminLoanList />
      </section>

      <div className="pt-16 sm:pt-20">
        <Footer />
      </div>
    </main>
  );
}
