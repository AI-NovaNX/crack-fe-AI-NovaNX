import type { Route } from "next";

export type NavigationItem = {
  label: string;
  href: Route;
};

export type NavigationUser = {
  name: string;
  initials: string;
  role?: string;
  avatar?: string | null;
};

export type UserNavProps = {
  className?: string;
  cartCount?: number;
  searchPlaceholder?: string;
  user?: NavigationUser;
  items?: NavigationItem[];
  actionHref?: Route;
  actionLabel?: string;
};
