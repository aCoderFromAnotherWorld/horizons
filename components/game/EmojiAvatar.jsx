'use client';

const SKIN_MODIFIERS = [
  '',            // default yellow
  '\u{1F3FB}',  // light
  '\u{1F3FC}',  // medium-light
  '\u{1F3FD}',  // medium
  '\u{1F3FE}',  // medium-dark
  '\u{1F3FF}',  // dark
];

const SKIN_SWATCHES = [
  '#FFD93D',
  '#FDDBB4',
  '#EAC086',
  '#C68642',
  '#8D5524',
  '#4A2912',
];

const HAIR_COLORS = ['#F4C76E', '#8B4513', '#1C1C1C', '#D2D2D2', '#E8503A', '#4169E1'];
const OUTFIT_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#F7DC6F', '#BB8FCE'];

/**
 * CSS-composed emoji avatar with skin tone + hair/outfit color accents.
 * Props: skinTone (0-5), hairColor (CSS hex), outfitColor (CSS hex)
 */
export default function EmojiAvatar({ skinTone = 0, hairColor = HAIR_COLORS[0], outfitColor = OUTFIT_COLORS[0], size = 96 }) {
  const base = '🧒';
  const modifier = SKIN_MODIFIERS[skinTone] ?? '';
  const emoji = base + modifier;

  return (
    <div
      className="relative inline-flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      {/* Hair color cap overlay — top 30% */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full opacity-60 pointer-events-none"
        style={{
          width: size * 0.55,
          height: size * 0.32,
          backgroundColor: hairColor,
          top: size * 0.02,
        }}
      />
      {/* Base emoji */}
      <span
        style={{ fontSize: size * 0.72, lineHeight: 1 }}
        aria-hidden="true"
      >
        {emoji}
      </span>
      {/* Outfit color strip — bottom 20% */}
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full opacity-50 pointer-events-none"
        style={{
          width: size * 0.6,
          height: size * 0.2,
          backgroundColor: outfitColor,
          bottom: size * 0.02,
        }}
      />
    </div>
  );
}

export { SKIN_SWATCHES, HAIR_COLORS, OUTFIT_COLORS };
