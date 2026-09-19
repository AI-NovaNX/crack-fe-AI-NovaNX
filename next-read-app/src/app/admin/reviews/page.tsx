import { AdminReviewList } from "@/components/admin/admin-review-list";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { Footer } from "@/components/layout/footer";

export default function AdminReviewsPage() {
  return (
    <main className="mx-auto w-full max-w-[1160px] px-5 pb-8 font-outfit text-palette-slate-50 sm:px-8">
      <section className="pt-5">
        <AdminTabs active="reviews" />
        <AdminReviewList />
      </section>
      <div className="pt-16 sm:pt-20">
        <Footer />
      </div>
    </main>
  );
}
