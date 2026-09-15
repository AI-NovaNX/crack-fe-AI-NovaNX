"use client";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type HeaderSearchProps = {
  placeholder?: string;
};

const SEARCH_DEBOUNCE_MS = 400;

export function HeaderSearch(props: HeaderSearchProps) {
  return (
    <Suspense
      fallback={
        <div className="h-8 w-full min-w-0 flex-1 basis-full sm:h-14 sm:basis-[280px]" />
      }
    >
      <SearchForm {...props} />
    </Suspense>
  );
}

function SearchForm({
  placeholder = "Search book, author, ISBN...",
}: HeaderSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(params.get("search") ?? "");
  const [isSearching, startSearchTransition] = useTransition();
  const location = `${pathname}?${params}`;
  const [previousLocation, setPreviousLocation] = useState(location);
  // Sync navigation without remounting the input or losing keyboard focus.
  if (previousLocation !== location) {
    setPreviousLocation(location);
    setSearchQuery(params.get("search") ?? "");
  }
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const composing = useRef(false);

  const cancelPendingSearch = () => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  };

  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [location],
  );

  const search = (value: string, immediate = false) => {
    cancelPendingSearch();
    const nextParams = new URLSearchParams(
      pathname === "/book-list" ? params.toString() : "",
    );
    const query = value.trim();
    if (query) nextParams.set("search", query);
    else nextParams.delete("search");
    nextParams.delete("page");
    const suffix = nextParams.toString();
    const href = `/book-list${suffix ? `?${suffix}` : ""}`;
    const current = `${pathname}${params.size ? `?${params}` : ""}`;
    if (href === current) return;
    // Automatic search replaces history so Back does not visit every typing pause.
    startSearchTransition(() => {
      if (immediate || pathname !== "/book-list")
        router.push(href, { scroll: false });
      else router.replace(href, { scroll: false });
    });
  };

  const scheduleSearch = (value: string) => {
    cancelPendingSearch();
    if (!composing.current)
      timer.current = setTimeout(() => search(value), SEARCH_DEBOUNCE_MS);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!composing.current) search(searchQuery, true);
  };

  return (
    <form
      role="search"
      aria-busy={isSearching}
      onSubmit={handleSubmit}
      className="relative z-10 box-border flex h-8 w-full min-w-0 flex-1 basis-full items-center gap-1 rounded-full border-[0.9px] border-solid border-palette-indigo-300-20 bg-secondary px-2 py-0 text-palette-slate-400 shadow-[inset_0_0_0_1px_rgba(255,_255,_255,_0.04)] backdrop-blur-xl sm:h-14 sm:basis-[280px] sm:gap-3 sm:rounded-num-30504000 sm:px-5"
    >
      <Search
        className="relative size-3 shrink-0 text-skyblue sm:h-5 sm:w-5"
        aria-hidden="true"
      />
      <span className="sr-only">Search books</span>
      <Input
        type="search"
        aria-label="Search books"
        value={searchQuery}
        onChange={(event) => {
          setSearchQuery(event.target.value);
          scheduleSearch(event.target.value);
        }}
        onCompositionStart={() => {
          composing.current = true;
          cancelPendingSearch();
        }}
        onCompositionEnd={(event) => {
          composing.current = false;
          scheduleSearch(event.currentTarget.value);
        }}
        placeholder={placeholder}
        className="header-search-input relative h-full min-w-0 flex-1 border-0 bg-transparent px-0 py-0 text-[8px] leading-5 font-medium text-palette-slate-50 shadow-none outline-none placeholder:text-palette-slate-400 focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent sm:text-base"
      />
      <Button
        type="submit"
        variant="outline"
        aria-label="Search"
        className="hidden h-10 rounded-full border-[0.9px] border-palette-indigo-300-20 bg-secondary px-5 text-sm leading-5 font-extrabold text-palette-slate-50 shadow-[inset_0_0_0_1px_rgba(255,_255,_255,_0.04)] outline outline-1 outline-palette-indigo-300-20 transition-colors hover:!border-palette-cyan-300 hover:bg-accent hover:text-palette-cyan-300 hover:outline-palette-cyan-300 focus-visible:!border-palette-cyan-300 focus-visible:text-palette-cyan-300 focus-visible:outline-palette-cyan-300 focus-visible:ring-palette-cyan-300/30 active:!border-palette-cyan-300 active:text-palette-cyan-300 active:outline-palette-cyan-300 sm:inline-flex"
      >
        {isSearching ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            Searching...
          </>
        ) : (
          "Search"
        )}
      </Button>
      <span className="sr-only" aria-live="polite">
        {isSearching ? "Searching books" : ""}
      </span>
    </form>
  );
}
