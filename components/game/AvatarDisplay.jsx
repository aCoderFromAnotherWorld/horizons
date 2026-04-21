"use client";

import SafeImage from "@/components/shared/SafeImage";

import { avatarOptions } from "@/lib/gameData/chapter1";
import { useAvatarStore } from "@/store/avatarStore";

function tintStyle(color) {
  return {
    backgroundColor: color,
    mixBlendMode: "multiply",
  };
}

export default function AvatarDisplay({ className = "" }) {
  const { hair, clothes, hairColor, clothesColor } = useAvatarStore();
  const selectedHair = avatarOptions.hair[hair] || avatarOptions.hair[0];
  const selectedClothes = avatarOptions.clothes[clothes] || avatarOptions.clothes[0];

  return (
    <div
      className={`relative flex aspect-square w-full max-w-[280px] items-center justify-center rounded-2xl bg-white/90 shadow-xl ${className}`}
      aria-label="Avatar preview"
    >
      <SafeImage
        src="/assets/characters/avatar/body-base.webp"
        alt=""
        width={180}
        height={180}
        className="absolute top-10 h-36 w-36 object-contain"
      />
      <div className="absolute top-8 h-28 w-28 overflow-hidden rounded-full">
        <SafeImage
          src={selectedHair}
          alt=""
          width={128}
          height={128}
          className="h-full w-full object-contain"
        />
        <div
          className="absolute inset-0 opacity-40"
          style={tintStyle(avatarOptions.hairColors[hairColor])}
        />
      </div>
      <div className="absolute bottom-8 h-32 w-36 overflow-hidden rounded-2xl">
        <SafeImage
          src={selectedClothes}
          alt=""
          width={150}
          height={150}
          className="h-full w-full object-contain"
        />
        <div
          className="absolute inset-0 opacity-35"
          style={tintStyle(avatarOptions.clothesColors[clothesColor])}
        />
      </div>
    </div>
  );
}
