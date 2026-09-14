export type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  rating: number;
  coverUrl?: string;
  coverClassName: string;
  availableCopies?: number;
  isAvailable?: boolean;
};
