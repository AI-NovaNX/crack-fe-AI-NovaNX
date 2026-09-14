import Image, { type StaticImageData } from "next/image";

import facebookIcon from "@/assets/icons/SocialMedia/facebook.svg";
import instagramIcon from "@/assets/icons/SocialMedia/instagram.svg";
import linkedInIcon from "@/assets/icons/SocialMedia/linkedIn.svg";
import tiktokIcon from "@/assets/icons/SocialMedia/Tiktok.svg";
import { Card, CardContent } from "@/components/ui/card";

type SocialMediaItem = {
  label: string;
  icon: StaticImageData;
};

const socialMediaItems: SocialMediaItem[] = [
  {
    label: "Facebook",
    icon: facebookIcon,
  },
  {
    label: "Instagram",
    icon: instagramIcon,
  },
  {
    label: "LinkedIn",
    icon: linkedInIcon,
  },
  {
    label: "TikTok",
    icon: tiktokIcon,
  },
];

export function Footer() {
  return (
    <footer className="w-full pb-10">
      <Card className="min-h-[145px] w-full rounded-[20px] border border-palette-indigo-300-20 bg-gray-200 p-0 py-0 font-outfit text-center text-palette-slate-50 shadow-[0px_25px_50px_-12px_rgba(0,_0,_0,_0.2)] ring-0">
        <CardContent className="flex flex-col items-center px-6 py-5">
          <h2 className="text-base leading-6 font-extrabold">NexRead</h2>

          <p className="max-w-[672px] pt-2 text-xs leading-6 text-palette-slate-400">
            Every visit brings your next geat read
          </p>

          <p className="pt-4 text-xs leading-5 font-extrabold">
            Follow on Social Media
          </p>

          <div className="flex items-center justify-center gap-2 pt-2">
            {socialMediaItems.map((item) => (
              <span
                key={item.label}
                className="flex size-6 items-center justify-center rounded-full border border-palette-indigo-300-20 bg-white"
                aria-label={item.label}
              >
                <Image
                  src={item.icon}
                  alt=""
                  className="max-h-3 w-auto"
                  aria-hidden="true"
                />
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </footer>
  );
}
