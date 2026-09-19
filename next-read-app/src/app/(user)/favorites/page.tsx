import { AppNav } from "@/components/layout/app-nav";
import { Footer } from "@/components/layout/footer";
import { FavoritesList } from "@/components/shared/favorites-list";

export default function FavoritesPage() {
  return <main className="mx-auto flex min-h-screen max-w-[1160px] flex-col px-5 py-7 font-outfit text-palette-slate-50 sm:px-8"><AppNav /><section className="flex-1 py-9"><h1 className="text-3xl font-extrabold sm:text-4xl">My Favorites</h1><p className="mt-3 text-sm text-palette-slate-400">Your favorite books to read again.</p><FavoritesList /></section><Footer /></main>;
}
