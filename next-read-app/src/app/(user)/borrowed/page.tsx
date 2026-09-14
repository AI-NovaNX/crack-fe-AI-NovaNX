import { AppNav } from "@/components/layout/app-nav";
import { Footer } from "@/components/layout/footer";
import { BorrowedList } from "@/components/shared/borrowed-list";

export default function BorrowedPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1160px] flex-col px-5 pt-7 pb-10 font-outfit text-palette-slate-50 sm:px-8">
      <AppNav />
      <div className="w-full flex-1 pt-6 sm:pt-7">
        <BorrowedList />
      </div>
      <div className="pt-12">
        <Footer />
      </div>
    </main>
  );
}
