"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Original decorative prose, not an excerpt from the book or its author.
const pageParagraphs = [
  [
    "Morning light falls between the window and the wooden desk. There, a book waits to be opened, holding a journey that has never begun.",
    "She sits down slowly and turns the first page. Outside, the city begins to wake. But in that small room, time moves more gently, following every word she reads.",
    "Sometimes a small step carries us somewhere far away. So does a sentence: simple at first, then lingering long in memory.",
  ],
  [
    "The path curved past the garden. The leaves moved slowly, as if trading stories about last night's rain.",
    "He stopped beneath a tree and opened his notebook. There was so much he wanted to keep: the color of the sky, the sound of footsteps, and a brief conversation that made the day feel different.",
    "Not every question needs an answer right away. Some are better carried along, until one day we find a new way to understand them.",
  ],
  [
    "As evening approached, the light turned golden. Shadows stretched across the floor, while the pages already read piled up on the left.",
    "She smiled at a sentence, then read it once more. The same words could feel different when we take the time to truly listen to them.",
    "The journey isn't over. There are still doors unopened and stories not yet found. With a calm heart, she turns to the next page.",
  ],
];

// The entire card drives the cover, including its stretched title link.
export function BookHoverCard({
  children,
  className,
  as = "div",
  unstyled = false,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li" | "section";
  unstyled?: boolean;
}) {
  const reduced = useReducedMotion();
  const [focused, setFocused] = useState(false);
  const Container = motion[as];
  return (
    <Container
      className={cn(!unstyled && "flex flex-col border", className)}
      initial="closed"
      animate={focused && !reduced ? "open" : "closed"}
      whileHover={reduced ? "closed" : "open"}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      {children}
    </Container>
  );
}

export function AnimatedBook({
  title,
  author,
  coverUrl,
  coverClassName,
  compact = false,
}: {
  title: string;
  author?: string;
  coverUrl?: string;
  coverClassName: string;
  compact?: boolean;
}) {
  const [failedUrl, setFailedUrl] = useState<string>();
  return (
    <div
      className="relative aspect-[2/3] w-full px-[4%] py-[2%]"
      style={{ perspective: 1000, containerType: "inline-size" }}
    >
      <motion.div
        className="absolute inset-x-[4%] inset-y-[4%]"
        style={{ transformStyle: "preserve-3d" }}
        // One shared progress value keeps pages behind the cover, even when
        // hover reverses mid-animation. Independent springs can cross over.
        variants={{
          closed: { "--book-open": 0, rotateY: -5, rotateZ: 0, y: 0 },
          open: { "--book-open": 1, rotateY: -7, rotateZ: -1, y: -3 },
        }}
        transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
      >
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 shadow-xl",
            compact
              ? "translate-x-[2px] translate-y-px rounded-r-[2px]"
              : "translate-x-2 translate-y-1 rounded-r-lg",
            coverClassName,
          )}
        />
        <div
          aria-hidden="true"
          className={cn(
            "absolute right-0 border border-stone-300",
            compact
              ? "inset-y-px left-px translate-x-[2px] rounded-r-[2px]"
              : "inset-y-1 left-1 translate-x-1.5 rounded-r-md",
          )}
          style={{
            background:
              "repeating-linear-gradient(to bottom, #f5f0e5 0px, #f5f0e5 2px, #d6cdbb 3px)",
          }}
        />
        {[0, 1, 2].map((page) => (
          <div
            key={page}
            aria-hidden="true"
            className={cn(
              "absolute right-0 origin-left border border-stone-300 bg-[#fffaf0] shadow-sm",
              compact
                ? "inset-y-px left-px rounded-r-[2px]"
                : "inset-y-1 left-1 rounded-r-md",
            )}
            style={{
              containerType: "inline-size",
              backfaceVisibility: "hidden",
              transform: `translateZ(${(page + 1) * (compact ? 0.35 : 1)}px) rotateY(calc(var(--book-open, 0) * ${-(page + 1) * 2}deg))`,
            }}
          >
            <div className="pointer-events-none absolute inset-x-[11%] inset-y-[7%] flex select-none flex-col overflow-hidden font-serif text-[#514637]">
              <div className="truncate border-b border-[#b9aa91]/50 pb-[4%] text-center text-[3.2cqw] uppercase tracking-[0.12em]">
                Illustration page
              </div>
              <div className="py-[7%] text-center">
                <div className="text-[3.5cqw] tracking-[0.18em]">
                  CHAPTER {page + 1}
                </div>
                <div className="mt-[3%] text-[5.5cqw] leading-tight italic">
                  {["A Beginning", "Along the Journey", "The Next Page"][page]}
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-hidden text-justify text-[3.8cqw] leading-[1.65]">
                {pageParagraphs[page].map((paragraph, index) => (
                  <p
                    key={index}
                    className={cn("mb-[5%]", index > 0 && "indent-[8%]")}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="pt-[5%] text-center text-[3.5cqw]">
                {page + 1}
              </div>
            </div>
          </div>
        ))}
        <div
          className={cn(
            "absolute inset-0 origin-left overflow-hidden shadow-[4px_7px_16px_#0005]",
            compact
              ? "rounded-l-[1px] rounded-r-[2px]"
              : "rounded-l-sm rounded-r-lg",
            coverClassName,
          )}
          style={{
            backfaceVisibility: "hidden",
            transform: `translateZ(${compact ? 1.4 : 4}px) rotateY(calc(var(--book-open, 0) * -48deg))`,
          }}
        >
          {coverUrl && failedUrl !== coverUrl ? (
            <Image
              src={coverUrl}
              alt={`Cover ${title}`}
              fill
              unoptimized
              sizes="(min-width: 1024px) 270px, 50vw"
              className="object-cover"
              onError={() => setFailedUrl(coverUrl)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-between p-[12%] text-center text-white">
              <span aria-hidden="true" className="h-px w-2/3 bg-white/50" />
              <span className="font-serif text-[10cqw] font-bold leading-tight">
                {title}
              </span>
              <span className="text-[5cqw] tracking-wide">{author}</span>
              <span aria-hidden="true" className="h-px w-2/3 bg-white/50" />
            </div>
          )}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-[8%] border-r border-black/20 bg-gradient-to-r from-black/40 via-white/15 to-black/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-r-lg ring-1 ring-inset ring-white/20"
          />
        </div>
      </motion.div>
    </div>
  );
}
