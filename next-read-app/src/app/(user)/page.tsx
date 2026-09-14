import { AppNav } from "@/components/layout/app-nav";
import { BookCategory } from "@/components/home/book-category";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/layout/hero-section";
import { PopularAuthors } from "@/components/home/popular-authors";
import { RecommendedForYou } from "@/components/home/recommended-for-you";

// Catalog data comes from the staging API and must be resolved at request time.
// This prevents a temporary backend/DNS outage from breaking the Next.js build.
export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams?: Promise<{
    recommendPage?: string | string[];
  }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;
  const recommendPageParam = Array.isArray(resolvedSearchParams?.recommendPage)
    ? resolvedSearchParams.recommendPage[0]
    : resolvedSearchParams?.recommendPage;
  const parsedRecommendPage = Number(recommendPageParam);
  const recommendPage =
    Number.isInteger(parsedRecommendPage) && parsedRecommendPage > 0
      ? parsedRecommendPage
      : 1;

  return (
    <div className="min-h-screen font-outfit text-foreground">
      <div className="mx-auto w-full max-w-[1920px] px-8 py-5">
        <AppNav />
      </div>

      <main className="mx-auto flex w-full max-w-[1920px] flex-col items-start px-8 pb-16 pt-0">
        <HeroSection />
        <BookCategory />
        <RecommendedForYou page={recommendPage} />
        <PopularAuthors />
        <Footer />
      </main>
    </div>
  );
}
