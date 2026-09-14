import { AppNav } from "@/components/layout/app-nav";
import { Footer } from "@/components/layout/footer";
import { CartContent } from "@/components/shared/cart-content";

export default function CartPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1160px] flex-col px-5 pt-7 pb-10 font-outfit text-palette-slate-50 sm:px-8">
      <AppNav />
      <div className="w-full flex-1 py-5 sm:py-6">
        <h1 className="mb-4 text-2xl font-extrabold sm:mb-5">My Cart</h1>
        <CartContent />
      </div>
      <Footer />
    </main>
  );
}
