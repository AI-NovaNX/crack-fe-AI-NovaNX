import type { RouteLayoutProps } from "@/types/layout";
import { pageBackgroundClassName } from "@/lib/page-background";
import { FavoritesProvider } from "@/components/providers/favorites-provider";
import { CartProvider } from "@/components/providers/cart-provider";

export default function UserLayout({ children }: RouteLayoutProps) {
  return <CartProvider><FavoritesProvider><div className={pageBackgroundClassName}>{children}</div></FavoritesProvider></CartProvider>;
}
