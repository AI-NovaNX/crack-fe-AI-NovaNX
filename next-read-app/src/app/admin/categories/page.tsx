import { AdminResourceManager } from "@/components/admin/admin-resource-manager";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { Footer } from "@/components/layout/footer";

export default function AdminCategoriesPage() {
  return (
    <main className="mx-auto w-full max-w-[1160px] px-5 pb-8 font-outfit text-palette-slate-50 sm:px-8">
      <section className="pt-5">
        <AdminTabs active="categories" />
        <AdminResourceManager
          resource="Categories"
          endpoint="/api/admin/categories"
          categoryFields
        />
      </section>
      <div className="pt-16 sm:pt-20">
        <Footer />
      </div>
    </main>
  );
}
