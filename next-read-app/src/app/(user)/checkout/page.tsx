import { AppNav } from "@/components/layout/app-nav";
import { Footer } from "@/components/layout/footer";
import { CheckoutContent } from "@/components/shared/checkout-content";

export default function CheckoutPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[1280px] flex-col px-3 py-4 font-outfit text-palette-slate-50 sm:px-8 sm:py-6">
      <AppNav />
      <div className="mx-auto w-full max-w-[1080px] flex-1 pt-6 pb-10 sm:pt-12 sm:pb-16">
        <h1 className="mb-4 text-2xl font-extrabold sm:mb-6 sm:text-4xl">
          Checkout
        </h1>
        <CheckoutContent />
      </div>
      <Footer />
    </main>
  );
}
