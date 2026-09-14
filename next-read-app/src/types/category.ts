import type { StaticImageData } from "next/image";

export type Category = {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  icon: StaticImageData;
};
