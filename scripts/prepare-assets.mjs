import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();
const assetsRoot = path.join(projectRoot, "public/assets");
const tempRoot = "/tmp/horizons-assets";
const openMojiSvgRoot = path.join(
  tempRoot,
  "openmoji/openmoji-master/color/svg",
);
const kenneyUiRoot = path.join(tempRoot, "kenney-ui/PNG/Blue/Default");
const kenneySoundRoot = path.join(tempRoot, "kenney-sounds/Audio");

const sourceNotes = [];

function assetPath(relativePath) {
  return path.join(assetsRoot, relativePath);
}

function xmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function ensureDirFor(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function openMojiDataUri(code) {
  const file = path.join(openMojiSvgRoot, `${code}.svg`);
  const svg = await fs.readFile(file, "utf8");
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

async function renderSvgToWebp(relativePath, svg) {
  const output = assetPath(relativePath);
  await ensureDirFor(output);
  await sharp(Buffer.from(svg)).webp({ quality: 88 }).toFile(output);
}

async function renderIcon(relativePath, code, label, options = {}) {
  const size = options.size || 256;
  const iconSize = options.iconSize || Math.round(size * 0.62);
  const iconX = Math.round((size - iconSize) / 2);
  const iconY = Math.round(size * 0.14);
  const fill = options.background || "#ffffff";
  const stroke = options.stroke || "#d4d4d8";
  const labelFill = options.labelFill || "#27272a";
  const dataUri = await openMojiDataUri(code);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.12)}" fill="${fill}"/>
  <rect x="6" y="6" width="${size - 12}" height="${size - 12}" rx="${Math.round(size * 0.1)}" fill="none" stroke="${stroke}" stroke-width="4"/>
  <image href="${dataUri}" x="${iconX}" y="${iconY}" width="${iconSize}" height="${iconSize}"/>
  <text x="${size / 2}" y="${Math.round(size * 0.88)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.round(size * 0.09)}" font-weight="700" fill="${labelFill}">${xmlEscape(label)}</text>
</svg>`;
  await renderSvgToWebp(relativePath, svg);
  sourceNotes.push(`${relativePath}: OpenMoji ${code}`);
}

async function renderCharacter(relativePath, code, label, variantColor = "#eef2ff") {
  await renderIcon(relativePath, code, label, {
    size: 400,
    iconSize: 260,
    background: variantColor,
    stroke: "#6366f1",
  });
}

async function renderEmotionFace(relativePath, code, subject, intensity) {
  const intensityScale = { 1: 0.56, 2: 0.66, 3: 0.76 }[intensity] || 0.66;
  const size = 240;
  const iconSize = Math.round(size * intensityScale);
  const dataUri = await openMojiDataUri(code);
  const ring = {
    child: "#38bdf8",
    adult: "#a78bfa",
    animal: "#34d399",
  }[subject];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="32" fill="#fff7ed"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="104" fill="#ffffff" stroke="${ring}" stroke-width="8"/>
  <image href="${dataUri}" x="${(size - iconSize) / 2}" y="${(size - iconSize) / 2 - 4}" width="${iconSize}" height="${iconSize}"/>
</svg>`;
  await renderSvgToWebp(relativePath, svg);
  sourceNotes.push(`${relativePath}: OpenMoji ${code}`);
}

async function renderBackground(relativePath, title, colors, iconCodes) {
  const icons = await Promise.all(iconCodes.map(openMojiDataUri));
  const placedIcons = icons
    .map((uri, index) => {
      const positions = [
        [80, 80, 150],
        [1010, 100, 170],
        [180, 520, 150],
        [930, 500, 180],
        [560, 180, 130],
      ];
      const [x, y, size] = positions[index % positions.length];
      return `<image href="${uri}" x="${x}" y="${y}" width="${size}" height="${size}" opacity="0.92"/>`;
    })
    .join("\n  ");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="768" viewBox="0 0 1280 768">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="${colors[0]}"/>
      <stop offset="55%" stop-color="${colors[1]}"/>
      <stop offset="100%" stop-color="${colors[2]}"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="768" fill="url(#bg)"/>
  <circle cx="1080" cy="140" r="90" fill="#ffffff" opacity="0.24"/>
  <circle cx="230" cy="170" r="130" fill="#ffffff" opacity="0.16"/>
  <path d="M0 590 C220 520 390 640 620 570 C860 500 1010 625 1280 545 L1280 768 L0 768 Z" fill="#ffffff" opacity="0.32"/>
  <path d="M0 665 C260 615 430 705 650 640 C890 570 1050 705 1280 625 L1280 768 L0 768 Z" fill="#ffffff" opacity="0.45"/>
  ${placedIcons}
  <text x="640" y="700" text-anchor="middle" font-family="Arial, sans-serif" font-size="44" font-weight="800" fill="#18181b" opacity="0.78">${xmlEscape(title)}</text>
</svg>`;
  await renderSvgToWebp(relativePath, svg);
  sourceNotes.push(`${relativePath}: composed from OpenMoji icons`);
}

async function writeSvg(relativePath, svg) {
  const output = assetPath(relativePath);
  await ensureDirFor(output);
  await fs.writeFile(output, svg);
}

async function copyKenneyPngAsSvgIcon(relativePath, sourceName, fallbackSvg) {
  const source = path.join(kenneyUiRoot, sourceName);
  if (!existsSync(source)) {
    await writeSvg(relativePath, fallbackSvg);
    sourceNotes.push(`${relativePath}: generated SVG fallback`);
    return;
  }

  const data = await fs.readFile(source);
  const metadata = await sharp(data).metadata();
  const uri = `data:image/png;base64,${data.toString("base64")}`;
  await writeSvg(
    relativePath,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${metadata.width}" height="${metadata.height}" viewBox="0 0 ${metadata.width} ${metadata.height}"><image href="${uri}" width="${metadata.width}" height="${metadata.height}"/></svg>`,
  );
  sourceNotes.push(`${relativePath}: Kenney UI Pack (${sourceName})`);
}

function simpleSvgIcon(body, viewBox = "0 0 100 100") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>`;
}

async function renderPatternShapes() {
  const shapes = {
    "objects/patterns/circle-red.svg":
      '<circle cx="40" cy="40" r="34" fill="#ef4444"/>',
    "objects/patterns/circle-blue.svg":
      '<circle cx="40" cy="40" r="34" fill="#3b82f6"/>',
    "objects/patterns/circle-yellow.svg":
      '<circle cx="40" cy="40" r="34" fill="#facc15"/>',
    "objects/patterns/square-red.svg":
      '<rect x="8" y="8" width="64" height="64" rx="8" fill="#ef4444"/>',
    "objects/patterns/square-blue.svg":
      '<rect x="8" y="8" width="64" height="64" rx="8" fill="#3b82f6"/>',
    "objects/patterns/square-green.svg":
      '<rect x="8" y="8" width="64" height="64" rx="8" fill="#22c55e"/>',
    "objects/patterns/triangle-red.svg":
      '<path d="M40 6 76 74H4Z" fill="#ef4444"/>',
    "objects/patterns/triangle-blue.svg":
      '<path d="M40 6 76 74H4Z" fill="#3b82f6"/>',
    "objects/patterns/star-yellow.svg":
      '<path d="M40 4 49 29 76 30 55 47 62 74 40 59 18 74 25 47 4 30 31 29Z" fill="#facc15"/>',
  };

  for (const [relativePath, body] of Object.entries(shapes)) {
    await writeSvg(relativePath, simpleSvgIcon(body, "0 0 80 80"));
    sourceNotes.push(`${relativePath}: generated SVG shape`);
  }
}

async function convertOggToMp3(relativePath, sourceName) {
  const source = path.join(kenneySoundRoot, sourceName);
  const output = assetPath(relativePath);
  await ensureDirFor(output);
  execFileSync("ffmpeg", [
    "-y",
    "-loglevel",
    "error",
    "-i",
    source,
    "-codec:a",
    "libmp3lame",
    "-q:a",
    "4",
    output,
  ]);
  sourceNotes.push(`${relativePath}: Kenney Interface Sounds (${sourceName})`);
}

async function renderAll() {
  const backgroundIconSets = {
    "backgrounds/main-menu.webp": ["Horizons", ["#7c3aed", "#312e81", "#111827"], ["1F680", "1FA90", "2B50"]],
    "backgrounds/chapter-1-room.webp": ["Welcome Room", ["#fde68a", "#fb923c", "#f9a8d4"], ["1F9D2", "1F455", "1F4D5"]],
    "backgrounds/chapter-1-living-room.webp": ["Guide Room", ["#bae6fd", "#86efac", "#fef3c7"], ["1F4A1", "1F4D5", "2615", "26BD", "1FAB4"]],
    "backgrounds/emotion-island.webp": ["Emotion Island", ["#67e8f9", "#34d399", "#fde68a"], ["1F600", "1F622", "1F620", "1F628"]],
    "backgrounds/emotion-garden.webp": ["Emotion Garden", ["#bbf7d0", "#86efac", "#fef08a"], ["1F33C", "1F337", "1F338", "1F490"]],
    "backgrounds/mirror-room.webp": ["Mirror Room", ["#e0f2fe", "#ddd6fe", "#fbcfe8"], ["1FA9E", "1F603", "1F9D2"]],
    "backgrounds/story-room.webp": ["Story Room", ["#fed7aa", "#fde68a", "#fef3c7"], ["1F4D6", "1F9F8", "1F6CB"]],
    "backgrounds/friends-house-exterior.webp": ["Friend's House", ["#bfdbfe", "#86efac", "#fde68a"], ["1F3E0", "1F33C", "1F44B"]],
    "backgrounds/friends-house-interior.webp": ["Friend's Room", ["#fbcfe8", "#bfdbfe", "#bbf7d0"], ["1F9F8", "1F3B2", "1F9D2"]],
    "backgrounds/playground.webp": ["Playground", ["#93c5fd", "#86efac", "#fef08a"], ["1F6DD", "26BD", "1FAA3"]],
    "backgrounds/village-morning.webp": ["Morning Village", ["#fde68a", "#fdba74", "#bbf7d0"], ["1F3D8", "2600", "1F392"]],
    "backgrounds/bathroom.webp": ["Bathroom", ["#bae6fd", "#e0f2fe", "#ffffff"], ["1FAA5", "1FAA5", "1FA9E"]],
    "backgrounds/unexpected-events.webp": ["Town Events", ["#e5e7eb", "#bfdbfe", "#fef3c7"], ["1F6A7", "1F3D7", "26C8"]],
    "backgrounds/theater-stage.webp": ["Pretend Theater", ["#fecdd3", "#f43f5e", "#7f1d1d"], ["1F3AD", "1F9F8", "1FA84"]],
    "backgrounds/play-props-table.webp": ["Play Props", ["#fef3c7", "#fdba74", "#fbcfe8"], ["1F34C", "1F372", "1F9F8", "1F4E6"]],
    "backgrounds/sensory-garden.webp": ["Sensory Garden", ["#bbf7d0", "#67e8f9", "#fef9c3"], ["1F426", "26F2", "1F33C"]],
    "backgrounds/forest-sounds.webp": ["Forest Sounds", ["#86efac", "#16a34a", "#14532d"], ["1F426", "1F333", "1F98B"]],
    "backgrounds/house-rooms-grid.webp": ["Six Rooms", ["#ddd6fe", "#bfdbfe", "#fef3c7"], ["1F3E0", "1F6AA", "1FA9E"]],
    "backgrounds/texture-studio.webp": ["Texture Studio", ["#fed7aa", "#fde68a", "#fefce8"], ["1F3A8", "1F9F6", "1FAA8"]],
    "backgrounds/detective-office.webp": ["Pattern Detective", ["#c7d2fe", "#93c5fd", "#e0f2fe"], ["1F989", "1F50D", "1F9E9"]],
    "backgrounds/pattern-table.webp": ["Pattern Table", ["#fef3c7", "#fca5a5", "#93c5fd"], ["1F534", "1F535", "2B50"]],
    "backgrounds/toyroom-free-play.webp": ["Toy Room", ["#fbcfe8", "#bfdbfe", "#bbf7d0"], ["1F9F8", "1F697", "1F9F1"]],
    "backgrounds/library.webp": ["Library", ["#fde68a", "#fca5a5", "#c4b5fd"], ["1F4DA", "1F4D6", "1F989"]],
    "backgrounds/mirror-gym.webp": ["Copy Cat Gym", ["#bae6fd", "#fbcfe8", "#ddd6fe"], ["1FA9E", "1F9D8", "1F44B"]],
    "backgrounds/summary-stars.webp": ["Summary Stars", ["#312e81", "#6d28d9", "#111827"], ["2B50", "1F31F", "1F389"]],
    "backgrounds/results-celebration.webp": ["Results", ["#fef08a", "#f9a8d4", "#a7f3d0"], ["1F389", "1F388", "2B50"]],
  };

  for (const [relativePath, [title, colors, icons]] of Object.entries(backgroundIconSets)) {
    await renderBackground(relativePath, title, colors, icons);
  }

  const guides = {
    "characters/guides/bunny.webp": ["1F430", "Bunny", "#fce7f3"],
    "characters/guides/bunny-point.webp": ["1F430", "Point", "#e0f2fe"],
    "characters/guides/bunny-wave.webp": ["1F430", "Wave", "#dcfce7"],
    "characters/guides/bunny-happy.webp": ["1F600", "Happy", "#fef9c3"],
    "characters/guides/bunny-sad.webp": ["1F622", "Sad", "#dbeafe"],
    "characters/guides/owl.webp": ["1F989", "Owl", "#ede9fe"],
    "characters/guides/cat.webp": ["1F431", "Cat", "#fee2e2"],
    "characters/guides/dog.webp": ["1F436", "Dog", "#fef3c7"],
    "characters/guides/bear.webp": ["1F43B", "Bear", "#fed7aa"],
  };
  for (const [relativePath, [code, label, color]] of Object.entries(guides)) {
    await renderCharacter(relativePath, code, label, color);
  }

  await renderIcon("characters/avatar/body-base.webp", "1F9D2", "Avatar", { size: 240 });
  const avatarParts = {
    "characters/avatar/hair-1.webp": ["1F9D1", "Short hair"],
    "characters/avatar/hair-2.webp": ["1F9D1", "Curly hair"],
    "characters/avatar/hair-3.webp": ["1F469", "Long hair"],
    "characters/avatar/hair-4.webp": ["1F468", "Afro hair"],
    "characters/avatar/clothes-1.webp": ["1F455", "T-shirt"],
    "characters/avatar/clothes-2.webp": ["1F457", "Dress"],
    "characters/avatar/clothes-3.webp": ["1F9E5", "Hoodie"],
    "characters/avatar/clothes-4.webp": ["1F45A", "Shirt"],
  };
  for (const [relativePath, [code, label]] of Object.entries(avatarParts)) {
    await renderIcon(relativePath, code, label, { size: 240 });
  }

  const emotionCodes = {
    happy: "1F600",
    sad: "1F622",
    angry: "1F620",
    scared: "1F628",
  };
  for (const subject of ["child", "adult", "animal"]) {
    for (const [emotion, code] of Object.entries(emotionCodes)) {
      for (const intensity of [1, 2, 3]) {
        await renderEmotionFace(
          `emotions/${subject}-${emotion}-${intensity}.webp`,
          code,
          subject,
          intensity,
        );
      }
    }
    await renderEmotionFace(`emotions/${subject}-neutral.webp`, "1F610", subject, 2);
  }

  const objectIcons = {
    "objects/lamp.webp": ["1F4A1", "Lamp"],
    "objects/book.webp": ["1F4D5", "Book"],
    "objects/cup.webp": ["2615", "Cup"],
    "objects/ball.webp": ["26BD", "Ball"],
    "objects/plant.webp": ["1FAB4", "Plant"],
    "objects/routines/wake-up.webp": ["23F0", "Wake up"],
    "objects/routines/brush-teeth.webp": ["1FAA5", "Brush"],
    "objects/routines/get-dressed.webp": ["1F455", "Dress"],
    "objects/routines/eat-breakfast.webp": ["1F963", "Breakfast"],
    "objects/routines/pack-bag.webp": ["1F392", "Pack bag"],
    "objects/routines/put-shoes.webp": ["1F45F", "Shoes"],
    "objects/playground/slide.webp": ["1F6DD", "Slide"],
    "objects/playground/swings.webp": ["1FAA3", "Swings"],
    "objects/playground/sandbox.webp": ["1FAA3", "Sandbox"],
    "objects/playground/climbing-frame.webp": ["1F3D7", "Climb"],
    "objects/playground/see-saw.webp": ["1F6DD", "See-saw"],
    "objects/pretend/banana.webp": ["1F34C", "Banana"],
    "objects/pretend/pot.webp": ["1F372", "Pot"],
    "objects/pretend/teddy.webp": ["1F9F8", "Teddy"],
    "objects/pretend/block.webp": ["1F9F1", "Block"],
    "objects/pretend/empty-cup.webp": ["2615", "Cup"],
    "objects/pretend/stick.webp": ["1FA84", "Wand"],
    "objects/pretend/pillow.webp": ["1F6CF", "Pillow"],
    "objects/pretend/box.webp": ["1F4E6", "Box"],
    "objects/sounds-sources/birds.webp": ["1F426", "Birds"],
    "objects/sounds-sources/fountain.webp": ["26F2", "Fountain"],
    "objects/sounds-sources/laughter.webp": ["1F604", "Laugh"],
    "objects/sounds-sources/vacuum.webp": ["1F9F9", "Vacuum"],
    "objects/sounds-sources/dog.webp": ["1F436", "Dog"],
    "objects/sounds-sources/thunder.webp": ["26C8", "Thunder"],
    "objects/sounds-sources/baby.webp": ["1F476", "Baby"],
    "objects/sounds-sources/traffic.webp": ["1F697", "Traffic"],
    "objects/rooms/calm-painting.webp": ["1F5BC", "Calm"],
    "objects/rooms/rainbow.webp": ["1F308", "Rainbow"],
    "objects/rooms/flickering.webp": ["1F4A1", "Lights"],
    "objects/rooms/spinning-pinwheel.webp": ["1F300", "Spin"],
    "objects/rooms/crowded.webp": ["1F465", "Crowded"],
    "objects/rooms/stripes.webp": ["1F4CA", "Stripes"],
    "objects/textures/cotton.webp": ["1F9F6", "Cotton"],
    "objects/textures/glass.webp": ["1FA9E", "Glass"],
    "objects/textures/rock.webp": ["1FAA8", "Rock"],
    "objects/textures/clay.webp": ["1F9F1", "Clay"],
    "objects/textures/honey.webp": ["1F36F", "Honey"],
    "objects/textures/sandpaper.webp": ["1FAA8", "Rough"],
    "objects/textures/ribbon.webp": ["1F380", "Ribbon"],
    "objects/textures/jello.webp": ["1F36E", "Jello"],
    "objects/topics/trains.webp": ["1F686", "Trains"],
    "objects/topics/space.webp": ["1F680", "Space"],
    "objects/topics/animals.webp": ["1F981", "Animals"],
    "objects/topics/numbers.webp": ["1F522", "Numbers"],
    "objects/topics/colors.webp": ["1F3A8", "Colors"],
    "objects/topics/dinosaurs.webp": ["1F996", "Dinos"],
    "objects/topics/cars.webp": ["1F697", "Cars"],
    "objects/topics/music.webp": ["1F3B5", "Music"],
    "objects/actions/wave.webp": ["1F44B", "Wave"],
    "objects/actions/clap.webp": ["1F44F", "Clap"],
    "objects/actions/thumbs-up.webp": ["1F44D", "Thumbs"],
    "objects/actions/smile.webp": ["1F603", "Smile"],
    "objects/actions/frown.webp": ["2639", "Frown"],
    "objects/actions/wink.webp": ["1F609", "Wink"],
    "objects/actions/surprised.webp": ["1F632", "Surprised"],
    "objects/actions/arms-up.webp": ["1F64C", "Arms up"],
    "objects/actions/jump.webp": ["1F998", "Jump"],
    "objects/actions/sit.webp": ["1F9D8", "Sit"],
    "objects/actions/pour-water.webp": ["1F6B0", "Pour"],
    "objects/actions/stack-blocks.webp": ["1F9F1", "Stack"],
    "ui/flower-happy.webp": ["1F33C", "Happy"],
    "ui/flower-sad.webp": ["1F490", "Sad"],
    "ui/flower-angry.webp": ["1F339", "Angry"],
    "ui/flower-scared.webp": ["1F940", "Scared"],
    "ui/progress-rocket.webp": ["1F680", "Progress"],
    "ui/planet-1.webp": ["1FA90", "Planet"],
    "ui/planet-2.webp": ["1F6F8", "Planet"],
  };
  for (const [relativePath, [code, label]] of Object.entries(objectIcons)) {
    await renderIcon(relativePath, code, label);
  }

  await renderPatternShapes();

  await copyKenneyPngAsSvgIcon(
    "ui/star-gold.svg",
    "star.png",
    simpleSvgIcon('<path d="M50 6 61 37 94 38 68 58 78 90 50 71 22 90 32 58 6 38 39 37Z" fill="#facc15"/>'),
  );
  await copyKenneyPngAsSvgIcon(
    "ui/star-empty.svg",
    "star_outline.png",
    simpleSvgIcon('<path d="M50 8 61 37 92 38 68 58 77 88 50 70 23 88 32 58 8 38 39 37Z" fill="none" stroke="#facc15" stroke-width="8"/>'),
  );
  await writeSvg(
    "ui/medal-gold.svg",
    simpleSvgIcon('<circle cx="50" cy="42" r="26" fill="#facc15"/><path d="M34 64 24 94 50 78 76 94 66 64" fill="#f97316"/>'),
  );
  await writeSvg("ui/heart.svg", simpleSvgIcon('<path d="M50 86 15 52C-2 34 22 6 50 32 78 6 102 34 85 52Z" fill="#ef4444"/>'));
  await copyKenneyPngAsSvgIcon("ui/checkmark.svg", "icon_checkmark.png", simpleSvgIcon('<circle cx="50" cy="50" r="42" fill="#22c55e"/><path d="m28 51 14 14 32-35" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>'));
  await copyKenneyPngAsSvgIcon("ui/x-mark.svg", "icon_cross.png", simpleSvgIcon('<circle cx="50" cy="50" r="42" fill="#ef4444"/><path d="M32 32 68 68M68 32 32 68" stroke="#fff" stroke-width="10" stroke-linecap="round"/>'));
  await copyKenneyPngAsSvgIcon("ui/arrow-right.svg", "arrow_basic_e.png", simpleSvgIcon('<path d="M16 50h60M52 24l26 26-26 26" fill="none" stroke="#18181b" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>'));
  await writeSvg("ui/home.svg", simpleSvgIcon('<path d="M12 48 50 16l38 32v40H62V62H38v26H12Z" fill="#6366f1"/>'));
  await writeSvg("ui/sound-on.svg", simpleSvgIcon('<path d="M12 38h20l24-20v64L32 62H12Z" fill="#6366f1"/><path d="M66 34c8 8 8 24 0 32M76 24c16 16 16 36 0 52" fill="none" stroke="#6366f1" stroke-width="8" stroke-linecap="round"/>'));
  await writeSvg("ui/sound-off.svg", simpleSvgIcon('<path d="M12 38h20l24-20v64L32 62H12Z" fill="#71717a"/><path d="M70 35 92 65M92 35 70 65" stroke="#ef4444" stroke-width="8" stroke-linecap="round"/>'));
  await writeSvg("ui/loading-spinner.svg", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="36" fill="none" stroke="#e4e4e7" stroke-width="10"/><path d="M86 50a36 36 0 0 0-36-36" fill="none" stroke="#6366f1" stroke-width="10" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="0.9s" repeatCount="indefinite"/></path></svg>');
  await writeSvg("ui/confetti-piece.svg", simpleSvgIcon('<rect x="24" y="12" width="52" height="76" rx="10" fill="#f59e0b" transform="rotate(18 50 50)"/>'));

  const effects = {
    "sounds/effects/click.mp3": "click_001.ogg",
    "sounds/effects/correct.mp3": "confirmation_001.ogg",
    "sounds/effects/wrong.mp3": "error_001.ogg",
    "sounds/effects/drag-start.mp3": "switch_001.ogg",
    "sounds/effects/drop.mp3": "drop_001.ogg",
    "sounds/effects/page-turn.mp3": "scroll_001.ogg",
    "sounds/effects/star.mp3": "glass_001.ogg",
    "sounds/effects/cheer.mp3": "confirmation_003.ogg",
    "sounds/effects/timer-tick.mp3": "tick_001.ogg",
    "sounds/ambient/main-menu.mp3": "confirmation_002.ogg",
    "sounds/ambient/nature.mp3": "scroll_004.ogg",
    "sounds/ambient/playground.mp3": "confirmation_004.ogg",
    "sounds/ambient/library.mp3": "select_001.ogg",
    "sounds/ambient/celebration.mp3": "confirmation_003.ogg",
    "sounds/sensory/birds.mp3": "select_004.ogg",
    "sounds/sensory/fountain.mp3": "scroll_005.ogg",
    "sounds/sensory/laughter.mp3": "confirmation_004.ogg",
    "sounds/sensory/vacuum.mp3": "glitch_001.ogg",
    "sounds/sensory/dog-bark.mp3": "error_004.ogg",
    "sounds/sensory/thunder.mp3": "bong_001.ogg",
    "sounds/sensory/baby-cry.mp3": "question_004.ogg",
    "sounds/sensory/traffic.mp3": "click_005.ogg",
  };
  for (const [relativePath, sourceName] of Object.entries(effects)) {
    await convertOggToMp3(relativePath, sourceName);
  }

  await fs.writeFile(
    assetPath("ATTRIBUTION.md"),
    `# Asset Sources and Licenses

Generated on ${new Date().toISOString()}.

## Sources

- Kenney UI Pack from OpenGameArt: https://opengameart.org/content/ui-pack
  - Author: Kenney
  - License: CC0
  - Used for UI source assets.
- Kenney Interface Sounds from OpenGameArt: https://opengameart.org/content/interface-sounds
  - Author: Kenney
  - License: CC0
  - Used for effect, ambient-placeholder, and sensory-placeholder audio files.
- OpenMoji color SVG set from GitHub: https://github.com/hfg-gmuend/openmoji
  - License: CC BY-SA 4.0
  - Used to compose most cartoon webp image assets.

## Notes

The image assets are MVP-friendly composed illustrations based on OpenMoji SVGs.
Some audio files, especially sensory and ambient tracks, are semantically named placeholders derived from Kenney's CC0 interface sounds. Replace them with domain-specific CC0/CC-BY recordings before final user testing.

## Generated Files

${sourceNotes.map((note) => `- ${note}`).join("\n")}
`,
  );
}

renderAll().catch((error) => {
  console.error(error);
  process.exit(1);
});
