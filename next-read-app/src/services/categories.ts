import { cache } from "react";
import { apiRequest } from "@/lib/api";
import type { Category } from "@/types/category";
import icon1 from "@/assets/icons/category/Icon-1.svg";
import icon2 from "@/assets/icons/category/Icon-2.svg";
import icon3 from "@/assets/icons/category/Icon-3.svg";
import icon4 from "@/assets/icons/category/Icon-4.svg";
import icon5 from "@/assets/icons/category/Icon-5.svg";
import icon6 from "@/assets/icons/category/Icon-6.svg";
const icons: Record<string, Category["icon"]> = {
  "/assets/icons/category/Icon-1.svg": icon1,
  "/assets/icons/category/Icon-2.svg": icon2,
  "/assets/icons/category/Icon-3.svg": icon3,
  "/assets/icons/category/Icon-4.svg": icon4,
  "/assets/icons/category/Icon-5.svg": icon5,
  "/assets/icons/category/Icon-6.svg": icon6,
};
type ApiCategory = Omit<Category, "icon" | "subtitle"> & {
  iconPath?: string | null;
  subtitle?: string | null;
};
export const getCategories = cache(async (): Promise<Category[]> => {
  const categories = await apiRequest<ApiCategory[]>(
    "/categories",
    {},
    { cacheCatalog: true },
  );
  return categories.map((category) => ({
    ...category,
    subtitle: category.subtitle ?? "",
    icon: icons[category.iconPath ?? ""] ?? icon5,
  }));
});
export async function getCategoryById(id: string) {
  return (await getCategories()).find((c) => c.id === id) ?? null;
}
export async function getCategoryBySlug(slug: string) {
  return (await getCategories()).find((c) => c.slug === slug) ?? null;
}
