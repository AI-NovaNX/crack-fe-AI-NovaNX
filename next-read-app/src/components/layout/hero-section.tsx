"use client";

import Image, { type StaticImageData } from "next/image";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

import bookDropIcon from "@/assets/icons/icon.svg";
import sourceImage from "@/assets/images/source-image.jpg";
import sourceImageTwo from "@/assets/images/source-image-2.jpg";
import sourceImageThree from "@/assets/images/source-image-3.jpg";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type HeroSlide = {
  image: StaticImageData;
  imageAlt: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  actionLabel: string;
  accentClassName: string;
};

const heroSlides: HeroSlide[] = [
  {
    image: sourceImage,
    imageAlt: "Curved bookshelves filled with colorful books",
    eyebrow: "Book drop",
    title: "New arrivals",
    subtitle: "120+ new collections",
    actionLabel: "Reserve",
    accentClassName: "bg-[linear-gradient(90deg,_#53eafd,_#a684ff,_#4ddeff)]",
  },
  {
    image: sourceImageTwo,
    imageAlt: "Library reading collection highlight",
    eyebrow: "Fresh picks",
    title: "Reader favorites",
    subtitle: "Curated weekly by NexRead",
    actionLabel: "Browse",
    accentClassName: "bg-[linear-gradient(90deg,_#4ddeff,_#55d6ff,_#7c5cff)]",
  },
  {
    image: sourceImageThree,
    imageAlt: "Featured library event: AI reading club",
    eyebrow: "LIBRARY EVENT",
    title: "AI reading club",
    subtitle: "Saturday, 07:00 PM",
    actionLabel: "Join",
    accentClassName: "bg-[linear-gradient(90deg,_#7c5cff,_#c45bff,_#4ddeff)]",
  },
];

export function HeroSection() {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const activeSlide = heroSlides[activeSlideIndex];

  return (
    <section className="relative h-[760px] w-full text-left font-menlo text-[12px] text-skyblue">
      <Card className="absolute top-[31.99px] left-0 right-[386px] h-[704px] min-h-[430px] overflow-hidden rounded-[36px] border-[0.9px] border-solid border-cornflowerblue bg-gray-800 p-0 py-0 shadow-[0px_25px_50px_-12px_rgba(5,_51,_69,_0.3)] ring-0">
        <div className="absolute inset-[0.91px]">
          <Image
            src={activeSlide.image}
            alt={activeSlide.imageAlt}
            fill
            priority={activeSlideIndex === 0}
            sizes="(min-width: 1280px) calc(100vw - 450px), 100vw"
            className="object-cover opacity-[0.8]"
          />
        </div>
        <div className="absolute inset-[0.91px] [background:linear-gradient(90deg,_rgba(7,_10,_26,_0.95),_rgba(7,_10,_26,_0.45)_50%,_rgba(0,_0,_0,_0))]" />
        <div className="absolute bottom-[0.91px] left-[0.91px] right-[0.91px] [background:linear-gradient(0deg,_rgba(7,_10,_26,_0.8),_rgba(0,_0,_0,_0))] h-36" />
        <div
          className={cn(
            "absolute top-[0.91px] left-[32.9px] right-[32.9px] rounded-num-30504000 h-1 shadow-[0_0_24px_rgba(77,_222,_255,_0.45)] transition-colors duration-300",
            activeSlide.accentClassName,
          )}
        />
        <div className="absolute top-[0.91px] left-[0.91px] right-[0.91px] h-[430px] flex flex-col items-start justify-between p-9 box-border gap-0 min-h-[430px]">
          <div className="w-[148.8px] rounded-num-30504000 bg-black/30 border-white/20 border-solid border-[0.9px] box-border flex items-center py-2 px-num-16 gap-2">
            <Image
              src={bookDropIcon}
              alt=""
              width={16}
              height={16}
              aria-hidden="true"
              className="h-4 w-4 relative shrink-0"
            />
            <div className="relative tracking-[2.88px] leading-4 uppercase shrink-0 text-[#4ddeff]">
              {activeSlide.eyebrow}
            </div>
          </div>
          <div className="w-full flex flex-col items-start max-w-[576px] text-[96px] text-white font-outfit">
            <div className="self-stretch flex flex-col items-start">
              <div className="relative leading-[91.2px] font-extrabold">
                {activeSlide.title}
              </div>
            </div>
            <div className="w-[576px] h-11 flex flex-col items-start pt-num-16 px-num-0 pb-num-0 box-border text-[20px] text-white/90">
              <div className="relative leading-7 font-semibold">
                {activeSlide.subtitle}
              </div>
            </div>
            <div className="self-stretch h-[72px] relative text-center text-[16px] text-gray-100">
              <Button
                type="button"
                className="absolute top-[23.99px] left-[0px] shadow-[0px_10px_15px_-3px_rgba(0,_211,_243,_0.25),_0px_4px_6px_-4px_rgba(0,_211,_243,_0.25)] rounded-num-30504000 bg-[#4ddeff] h-12 flex items-center py-3 px-6 box-border gap-2 text-[#06101c] hover:bg-[#8aebff]"
              >
                <b className="relative leading-6">{activeSlide.actionLabel}</b>
                <ChevronRight className="h-4 w-4 relative" aria-hidden="true" />
              </Button>
            </div>
          </div>
          <div className="self-stretch flex items-start justify-center gap-2">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                aria-label={`Show ${slide.title} slide`}
                aria-pressed={activeSlideIndex === index}
                onClick={() => setActiveSlideIndex(index)}
                className={cn(
                  "h-2 relative rounded-num-30504000 transition-all",
                  activeSlideIndex === index
                    ? "w-10 bg-[#4ddeff]"
                    : "w-2 bg-white/50 hover:bg-white/90",
                )}
              />
            ))}
          </div>
        </div>
      </Card>
      <Card className="absolute top-[25px] right-0 h-[704px] w-[360px] gap-0 rounded-[40px] border-[1px] border-[#5f5d91]/70 bg-card px-8 py-8 font-outfit text-palette-slate-400 shadow-[0px_30px_90px_rgba(6,_10,_28,_0.42)] ring-0">
        <div
          className="flex w-fit gap-[7px] text-[20px] leading-6 font-extrabold uppercase"
          aria-label="NEXRANK"
        >
          {[
            ["N", "#53EAFD"],
            ["E", "#57D8FE"],
            ["X", "#51A2FF"],
            ["R", "#6F92FF"],
            ["A", "#9680FF"],
            ["N", "#C570FF"],
            ["K", "#ED6AFF"],
          ].map(([letter, color]) => (
            <span
              key={`${letter}-${color}`}
              style={{ color }}
              aria-hidden="true"
            >
              {letter}
            </span>
          ))}
        </div>

        <h2 className="pt-5 text-[32px] leading-10 font-extrabold text-palette-slate-50">
          Book Explorer
        </h2>

        <Card className="relative mt-6 h-[176px] w-full gap-0 rounded-[28px] border-0 bg-[linear-gradient(135deg,_#4ddeff_0%,_#2d8eff_48%,_#7659ff_100%)] p-6 py-5 text-white shadow-[0px_20px_55px_rgba(77,_222,_255,_0.2)] ring-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] leading-5 font-extrabold text-[#06101c]">
                Level 7
              </p>
              <p className="pt-2 text-[40px] leading-[40px] font-extrabold">
                840
              </p>
              <p className="text-[34px] leading-[34px] font-extrabold">XP</p>
            </div>

            <div className="mt-9 flex size-16 items-center justify-center rounded-[20px] bg-white/20 text-[24px]">
              ⚡
            </div>
          </div>

          <div
            className="absolute right-6 bottom-8 left-6 z-10 h-[9px] overflow-hidden rounded-full bg-white/35"
            role="progressbar"
            aria-label="Reading level progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={76}
          >
            <div className="h-full w-[76%] rounded-full bg-white shadow-[0_0_12px_rgba(255,_255,_255,_0.55)]" />
          </div>

          <p className="absolute right-6 bottom-3 left-6 text-[11px] leading-4 font-extrabold text-[#06101c]">
            160 XP to next level
          </p>
        </Card>

        <Card className="mt-5 h-[88px] w-full flex-row items-center justify-between rounded-[20px] border-[1px] border-[#4a5270] bg-card px-5 py-4 shadow-none ring-0">
          <div>
            <h3 className="text-[13px] leading-5 font-extrabold text-palette-slate-50">
              Weekly Quest
            </h3>
            <p className="max-w-[170px] pt-1 text-[11px] leading-4 font-bold text-palette-slate-400">
              Borrow 2 books this week
            </p>
          </div>
          <div className="flex h-8 w-12 items-center justify-center rounded-full bg-palette-cyan-300 text-[12px] leading-4 font-extrabold text-white dark:text-black">
            1/2
          </div>
        </Card>

        <div className="mt-5 grid w-full grid-cols-2 gap-4">
          <Card className="h-[132px] justify-center gap-0 rounded-[20px] border-[1px] border-[#4a5270] bg-card px-5 py-5 shadow-none ring-0">
            <div className="text-[25px] leading-8 font-extrabold text-palette-slate-50">
              🔥 4
            </div>
            <p className="pt-4 text-[12px] leading-4 font-bold text-palette-slate-400">
              week streak
            </p>
          </Card>

          <Card className="h-[132px] justify-center gap-0 rounded-[20px] border-[1px] border-[#4a5270] bg-card px-5 py-5 shadow-none ring-0">
            <div className="text-[25px] leading-8 font-extrabold text-palette-slate-50">
              🏅 12
            </div>
            <p className="pt-3 text-[12px] leading-4 font-bold text-palette-slate-400">
              achievements
            </p>
            <div className="mt-4 flex gap-2">
              <span className="flex size-6 items-center justify-center rounded-full border border-[#8f6cff] bg-[#45326d] text-[11px]">
                🕒
              </span>
              <span className="flex size-6 items-center justify-center rounded-full border border-palette-cyan-300 bg-[#0c566f] text-[11px]">
                ★
              </span>
              <span className="flex size-6 items-center justify-center rounded-full border border-[#d8a61a] bg-[#654b10] text-[11px]">
                📚
              </span>
            </div>
          </Card>
        </div>

        <Card className="mt-5 h-[74px] w-full flex-row items-center gap-4 rounded-full border-[1px] border-[#655c91] bg-card px-5 py-3 shadow-[inset_0_0_0_1px_rgba(255,_255,_255,_0.04)] ring-0">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#894cff] text-[20px] text-white">
            ★
          </span>
          <p className="flex-1 text-[13px] leading-5 font-extrabold text-palette-slate-400">
            Top 18% of readers this month
          </p>
          <span className="text-[28px] leading-none font-extrabold text-palette-slate-400">
            ›
          </span>
        </Card>
      </Card>
    </section>
  );
}
