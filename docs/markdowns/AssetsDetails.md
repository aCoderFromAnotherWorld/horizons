# HORIZONS — Assets Reference Guide

> All assets needed for the Horizons ASD screening game.  
> Organized by type and chapter. Each entry includes: path, dimensions, description, and where to find it.

---

## HOW TO USE THIS FILE

1. Download assets from the listed free sources
2. Rename them to match the exact filename in the "Save As" column
3. Place them in the correct folder under `public/assets/`
4. Formats: use `.webp` for images (best size/quality), `.mp3` for audio, `.svg` for icons

---

## FOLDER STRUCTURE

```
public/assets/
├── backgrounds/       # Full-scene backgrounds (1280×768px)
├── characters/        # Avatar parts + guide animals
│   ├── avatar/
│   └── guides/
├── emotions/          # Emotion face images
├── objects/           # Game objects (daily items, toys, etc.)
│   ├── routines/
│   ├── playground/
│   ├── pretend/
│   ├── textures/
│   ├── topics/
│   └── patterns/
├── sounds/            # Audio files
│   ├── ambient/
│   ├── effects/
│   ├── sensory/
│   └── voice/
└── ui/                # UI decorations, icons, overlays
```

---

## 1. BACKGROUNDS (1280×768px, .webp)

| Filename                                  | Scene                     | Description                                                                       | Search Terms                              | Free Sources              |
| ----------------------------------------- | ------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------- |
| `backgrounds/main-menu.webp`              | Main Menu                 | Colorful galaxy/space with stars and planets, purple/indigo tones, child-friendly | "cartoon space background children"       | freepik.com, vecteezy.com |
| `backgrounds/chapter-1-room.webp`         | Ch1 Level 1               | Bright cozy bedroom, colorful wardrobe visible, sunny window                      | "cartoon bedroom children bright"         | freepik.com               |
| `backgrounds/chapter-1-living-room.webp`  | Ch1 Level 2               | Living room with 5 distinct objects: lamp, book, cup, ball, plant                 | "cartoon living room items children"      | vecteezy.com              |
| `backgrounds/emotion-island.webp`         | Ch2 Hub                   | Tropical island with 4 flower-bed areas (different colors), sunny                 | "cartoon tropical island flowers"         | freepik.com               |
| `backgrounds/emotion-garden.webp`         | Ch2 Level 1               | Garden with 4 distinct flower beds labeled areas                                  | "cartoon garden flower beds colorful"     | vecteezy.com              |
| `backgrounds/mirror-room.webp`            | Ch2 Level 2               | Dressing room with a large mirror, bright lighting                                | "cartoon mirror room bright children"     | freepik.com               |
| `backgrounds/story-room.webp`             | Ch2 Level 3               | Cozy reading/story room with soft lighting                                        | "cartoon cozy room storytelling"          | freepik.com               |
| `backgrounds/friends-house-exterior.webp` | Ch3 Level 1               | Cartoon house exterior, front door visible, garden                                | "cartoon house exterior door garden"      | vecteezy.com              |
| `backgrounds/friends-house-interior.webp` | Ch3 Level 2               | Bright kids' room interior with toys                                              | "cartoon kids room bright colorful"       | freepik.com               |
| `backgrounds/playground.webp`             | Ch3 Level 3 / Ch4 Level 2 | Playground with swings, slide, sandbox, climbing frame, see-saw                   | "cartoon playground equipment sunny"      | vecteezy.com              |
| `backgrounds/village-morning.webp`        | Ch4 Hub                   | Cartoon neighborhood street, morning light                                        | "cartoon neighborhood morning children"   | freepik.com               |
| `backgrounds/bathroom.webp`               | Ch4 Level 1               | Cartoon bathroom: sink, shower, mirror                                            | "cartoon bathroom children morning"       | vecteezy.com              |
| `backgrounds/unexpected-events.webp`      | Ch4 Level 3               | Neutral street/town background for event scenarios                                | "cartoon town street simple"              | freepik.com               |
| `backgrounds/theater-stage.webp`          | Ch5 Hub                   | Cartoon theater stage with red curtains                                           | "cartoon theater stage curtains children" | vecteezy.com              |
| `backgrounds/play-props-table.webp`       | Ch5 Level 2               | Table with scattered toys and everyday objects                                    | "cartoon toy table objects children"      | freepik.com               |
| `backgrounds/sensory-garden.webp`         | Ch6 Hub                   | Calm garden with flowers, bird, fountain, nature                                  | "cartoon calm garden nature sunny"        | freepik.com               |
| `backgrounds/forest-sounds.webp`          | Ch6 Level 1               | Forest scene with animals, birds, natural setting                                 | "cartoon forest animals peaceful"         | vecteezy.com              |
| `backgrounds/house-rooms-grid.webp`       | Ch6 Level 2               | House floorplan view showing 6 doors to rooms                                     | "cartoon house floor plan rooms"          | freepik.com               |
| `backgrounds/texture-studio.webp`         | Ch6 Level 3               | Art studio / workshop with shelves                                                | "cartoon art studio workshop children"    | vecteezy.com              |
| `backgrounds/detective-office.webp`       | Ch7 Hub                   | Cartoon detective office with clues board, magnifying glass                       | "cartoon detective office children fun"   | freepik.com               |
| `backgrounds/pattern-table.webp`          | Ch7 Level 1               | Simple table with colored shape pieces                                            | "cartoon flat table simple background"    | vecteezy.com              |
| `backgrounds/toyroom-free-play.webp`      | Ch7 Level 2               | Bright toy room with lots of different toys                                       | "cartoon toy room bright colorful"        | freepik.com               |
| `backgrounds/library.webp`                | Ch7 Level 3               | Colorful children's library with book shelves                                     | "cartoon children library colorful books" | freepik.com               |
| `backgrounds/mirror-gym.webp`             | Ch8 Hub                   | Bright gym/dance studio with large mirror                                         | "cartoon dance studio mirror children"    | freepik.com               |
| `backgrounds/summary-stars.webp`          | Ch9                       | Night sky with stars, celebration feel                                            | "cartoon night sky stars celebration"     | vecteezy.com              |
| `backgrounds/results-celebration.webp`    | Results                   | Confetti, balloons, stars, celebration party                                      | "cartoon celebration confetti balloons"   | freepik.com               |

---

## 2. GUIDE CHARACTERS (Animals) — ~300×400px, .webp

One guide animal appears throughout the game. Choose ONE as your main guide plus 4 alternates for variety.

| Filename                             | Description                                              | Search Terms                                | Notes                      |
| ------------------------------------ | -------------------------------------------------------- | ------------------------------------------- | -------------------------- |
| `characters/guides/bunny.webp`       | Friendly cartoon rabbit, standing upright, bright colors | "cartoon bunny character friendly children" | **Recommended main guide** |
| `characters/guides/bunny-point.webp` | Same bunny with pointing paw/arm gesture                 | "cartoon bunny pointing arm"                | Used in Ch1 Level 2        |
| `characters/guides/bunny-wave.webp`  | Same bunny waving                                        | "cartoon bunny waving friendly"             | Used in Ch3                |
| `characters/guides/bunny-happy.webp` | Same bunny with happy expression                         | "cartoon bunny happy smile"                 | Feedback                   |
| `characters/guides/bunny-sad.webp`   | Same bunny with sad expression                           | "cartoon bunny sad expression"              | Feedback                   |
| `characters/guides/owl.webp`         | Cartoon owl with glasses, academic feel                  | "cartoon owl teacher glasses children"      | Ch7 detective theme        |
| `characters/guides/cat.webp`         | Friendly cartoon cat character                           | "cartoon cat friendly children character"   | Alternative guide          |
| `characters/guides/dog.webp`         | Friendly cartoon dog character                           | "cartoon dog friendly children character"   | Alternative guide          |
| `characters/guides/bear.webp`        | Friendly cartoon bear character                          | "cartoon bear friendly children character"  | Alternative guide          |

**Tip:** Search OpenGameArt.org or itch.io for free character sprite sheets. Look for "2D platformer character" or "chibi" style characters with Creative Commons license.

---

## 3. AVATAR PARTS — ~200×200px each, .webp or .svg

The child builds their own avatar in Chapter 1.

### Hair Styles (4 options)

| Filename                        | Description           |
| ------------------------------- | --------------------- |
| `characters/avatar/hair-1.webp` | Short straight hair   |
| `characters/avatar/hair-2.webp` | Curly hair            |
| `characters/avatar/hair-3.webp` | Long straight hair    |
| `characters/avatar/hair-4.webp` | Short curly/afro hair |

### Clothes (4 options)

| Filename                           | Description     |
| ---------------------------------- | --------------- |
| `characters/avatar/clothes-1.webp` | T-shirt + pants |
| `characters/avatar/clothes-2.webp` | Dress           |
| `characters/avatar/clothes-3.webp` | Hoodie + jeans  |
| `characters/avatar/clothes-4.webp` | Shirt + skirt   |

### Avatar Base (neutral body)

| Filename                           | Description                                               |
| ---------------------------------- | --------------------------------------------------------- |
| `characters/avatar/body-base.webp` | Neutral cartoon child body, no hair/clothes, front-facing |

**Color tinting:** Hair and clothes colors are applied via CSS `filter: hue-rotate()` — you only need one version of each part. Use flat/solid colored versions for best tinting.

**Free sources:**

- picrew.me style references
- OpenClipart.org
- Search "flat cartoon avatar parts children svg"

---

## 4. EMOTION FACES — 200×200px, .webp

Need: 4 emotions × 3 subjects × 3 intensity levels = 36 images  
Plus: 6-option grids for Level 2 (can reuse from the 36)

### Emotions: happy, sad, angry, scared (fear)

### Subjects: child, adult, animal (dog/bear/rabbit face)

### Intensities: mild (1), moderate (2), strong (3)

| Filename Pattern                                | Example                       | Description                    |
| ----------------------------------------------- | ----------------------------- | ------------------------------ |
| `emotions/[subject]-[emotion]-[intensity].webp` | `emotions/child-happy-2.webp` | Cartoon face, clear expression |

**All files needed:**

```
child-happy-1.webp    child-happy-2.webp    child-happy-3.webp
child-sad-1.webp      child-sad-2.webp      child-sad-3.webp
child-angry-1.webp    child-angry-2.webp    child-angry-3.webp
child-scared-1.webp   child-scared-2.webp   child-scared-3.webp
adult-happy-1.webp    adult-happy-2.webp    adult-happy-3.webp
adult-sad-1.webp      adult-sad-2.webp      adult-sad-3.webp
adult-angry-1.webp    adult-angry-2.webp    adult-angry-3.webp
adult-scared-1.webp   adult-scared-2.webp   adult-scared-3.webp
animal-happy-1.webp   animal-happy-2.webp   animal-happy-3.webp
animal-sad-1.webp     animal-sad-2.webp     animal-sad-3.webp
animal-angry-1.webp   animal-angry-2.webp   animal-angry-3.webp
animal-scared-1.webp  animal-scared-2.webp  animal-scared-3.webp
```

Also needed — neutral faces:

```
child-neutral.webp
adult-neutral.webp
animal-neutral.webp
```

**Free sources:**

- Search "cartoon emotion faces children clipart" on pixabay.com, pexels.com
- FlatIcon.com — search "emotion faces"
- Search "emoji face set SVG" on vecteezy.com
- Freepik: "cartoon facial expressions children set"

---

## 5. OBJECTS — Various sizes (~200×200px), .webp

### Chapter 1 — Living Room Objects (for "Following the Guide")

| Filename             | Object                  |
| -------------------- | ----------------------- |
| `objects/lamp.webp`  | Cartoon table lamp      |
| `objects/book.webp`  | Cartoon book (closed)   |
| `objects/cup.webp`   | Cartoon mug/cup         |
| `objects/ball.webp`  | Cartoon ball (colorful) |
| `objects/plant.webp` | Cartoon potted plant    |

### Chapter 4 — Morning Routine Cards (~300×300px)

| Filename                              | Object            | Description            |
| ------------------------------------- | ----------------- | ---------------------- |
| `objects/routines/wake-up.webp`       | Alarm clock / bed | Child waking up in bed |
| `objects/routines/brush-teeth.webp`   | Toothbrush        | Child brushing teeth   |
| `objects/routines/get-dressed.webp`   | T-shirt           | Clothes laid out       |
| `objects/routines/eat-breakfast.webp` | Bowl of food      | Breakfast bowl         |
| `objects/routines/pack-bag.webp`      | School bag        | Backpack being packed  |
| `objects/routines/put-shoes.webp`     | Shoes             | Pair of shoes          |

### Chapter 4 — Playground Activities

| Filename                                 | Activity          |
| ---------------------------------------- | ----------------- |
| `objects/playground/slide.webp`          | Cartoon slide     |
| `objects/playground/swings.webp`         | Cartoon swing set |
| `objects/playground/sandbox.webp`        | Sandbox with toys |
| `objects/playground/climbing-frame.webp` | Climbing frame    |
| `objects/playground/see-saw.webp`        | See-saw           |

### Chapter 5 — Pretend Play Items

| Filename                         | Item          | Used as     |
| -------------------------------- | ------------- | ----------- |
| `objects/pretend/banana.webp`    | Banana        | Phone       |
| `objects/pretend/pot.webp`       | Empty pot     | Cooking     |
| `objects/pretend/teddy.webp`     | Teddy bear    | Baby        |
| `objects/pretend/block.webp`     | Wooden block  | Car         |
| `objects/pretend/empty-cup.webp` | Empty cup     | Drinking    |
| `objects/pretend/stick.webp`     | Stick         | Magic wand  |
| `objects/pretend/pillow.webp`    | Pillow        | Baby / seat |
| `objects/pretend/box.webp`       | Cardboard box | Car / house |

### Chapter 6 — Sensory: Sound Sources (~400×300px)

| Filename                               | Sound Source               |
| -------------------------------------- | -------------------------- |
| `objects/sounds-sources/birds.webp`    | Tree with cartoon birds    |
| `objects/sounds-sources/fountain.webp` | Garden fountain            |
| `objects/sounds-sources/laughter.webp` | Cartoon children laughing  |
| `objects/sounds-sources/vacuum.webp`   | Vacuum cleaner             |
| `objects/sounds-sources/dog.webp`      | Cartoon barking dog        |
| `objects/sounds-sources/thunder.webp`  | Storm cloud with lightning |
| `objects/sounds-sources/baby.webp`     | Cartoon baby crying        |
| `objects/sounds-sources/traffic.webp`  | Cartoon cars on road       |

### Chapter 6 — Visual Rooms (~800×600px)

| Filename                               | Room                                                 |
| -------------------------------------- | ---------------------------------------------------- |
| `objects/rooms/calm-painting.webp`     | Room with one calm landscape painting                |
| `objects/rooms/rainbow.webp`           | Bright room with rainbow colors everywhere           |
| `objects/rooms/flickering.webp`        | Room with light bulb (use CSS animation for flicker) |
| `objects/rooms/spinning-pinwheel.webp` | Room with pinwheel toy (use CSS animation)           |
| `objects/rooms/crowded.webp`           | Busy/crowded illustrated scene (many elements)       |
| `objects/rooms/stripes.webp`           | Room with strong stripe patterns on walls            |

### Chapter 6 — Texture Cards (~200×200px)

| Filename                          | Texture                    |
| --------------------------------- | -------------------------- |
| `objects/textures/cotton.webp`    | Cotton wool ball           |
| `objects/textures/glass.webp`     | Glass surface (reflective) |
| `objects/textures/rock.webp`      | Smooth stone               |
| `objects/textures/clay.webp`      | Clay/playdough             |
| `objects/textures/honey.webp`     | Honey (golden, dripping)   |
| `objects/textures/sandpaper.webp` | Rough sandpaper            |
| `objects/textures/ribbon.webp`    | Smooth satin ribbon        |
| `objects/textures/jello.webp`     | Jello/gelatin (wobbly)     |

### Chapter 7 — Pattern Shapes (~80×80px each, .svg preferred)

| Filename                             | Shape                |
| ------------------------------------ | -------------------- |
| `objects/patterns/circle-red.svg`    | Red filled circle    |
| `objects/patterns/circle-blue.svg`   | Blue filled circle   |
| `objects/patterns/circle-yellow.svg` | Yellow filled circle |
| `objects/patterns/square-red.svg`    | Red filled square    |
| `objects/patterns/square-blue.svg`   | Blue filled square   |
| `objects/patterns/square-green.svg`  | Green filled square  |
| `objects/patterns/triangle-red.svg`  | Red filled triangle  |
| `objects/patterns/triangle-blue.svg` | Blue filled triangle |
| `objects/patterns/star-yellow.svg`   | Yellow filled star   |

**These can be created as inline SVGs** — no download needed. Just use simple `<svg>` elements in code.

### Chapter 7 — Topic Book Covers (~250×320px)

| Filename                        | Topic                            |
| ------------------------------- | -------------------------------- |
| `objects/topics/trains.webp`    | Cartoon train book cover         |
| `objects/topics/space.webp`     | Cartoon space/rockets book cover |
| `objects/topics/animals.webp`   | Cartoon animals book cover       |
| `objects/topics/numbers.webp`   | Cartoon numbers/math book cover  |
| `objects/topics/colors.webp`    | Colorful art book cover          |
| `objects/topics/dinosaurs.webp` | Cartoon dinosaur book cover      |
| `objects/topics/cars.webp`      | Cartoon cars book cover          |
| `objects/topics/music.webp`     | Cartoon music notes book cover   |

### Chapter 8 — Imitation Action Images (~300×300px)

| Filename                            | Action                          |
| ----------------------------------- | ------------------------------- |
| `objects/actions/wave.webp`         | Character waving hand           |
| `objects/actions/clap.webp`         | Character clapping              |
| `objects/actions/thumbs-up.webp`    | Thumbs up gesture               |
| `objects/actions/smile.webp`        | Big smile face                  |
| `objects/actions/frown.webp`        | Frowning face                   |
| `objects/actions/wink.webp`         | Winking face                    |
| `objects/actions/surprised.webp`    | Surprised open-mouth face       |
| `objects/actions/arms-up.webp`      | Arms raised up                  |
| `objects/actions/jump.webp`         | Jumping pose                    |
| `objects/actions/sit.webp`          | Sitting cross-legged            |
| `objects/actions/pour-water.webp`   | Pouring from one cup to another |
| `objects/actions/stack-blocks.webp` | Stacking building blocks        |

**Free sources for objects:** pixabay.com, openclipart.org, flaticon.com, freepik.com, icons8.com

---

## 6. SOUNDS

### Ambient Tracks (~2MB each, looping .mp3)

| Filename                         | Description                                     | Where to Find                                      |
| -------------------------------- | ----------------------------------------------- | -------------------------------------------------- |
| `sounds/ambient/main-menu.mp3`   | Gentle, upbeat, child-friendly background music | freemusicarchive.org, incompetech.com              |
| `sounds/ambient/nature.mp3`      | Soft nature sounds (birds, gentle wind)         | freesound.org search "nature ambience gentle"      |
| `sounds/ambient/playground.mp3`  | Happy outdoor/playground ambience               | freesound.org search "playground children distant" |
| `sounds/ambient/library.mp3`     | Very quiet, peaceful music                      | freemusicarchive.org                               |
| `sounds/ambient/celebration.mp3` | Cheerful, triumphant short loop                 | freemusicarchive.org                               |

### Sound Effects (short .mp3, <500KB)

| Filename                        | Description                           | Where to Find                               |
| ------------------------------- | ------------------------------------- | ------------------------------------------- |
| `sounds/effects/click.mp3`      | Soft click / pop sound                | freesound.org search "soft click button"    |
| `sounds/effects/correct.mp3`    | Happy chime / ding for correct answer | freesound.org search "correct answer chime" |
| `sounds/effects/wrong.mp3`      | Gentle "oops" sound, not harsh        | freesound.org search "gentle wrong answer"  |
| `sounds/effects/drag-start.mp3` | Soft whoosh for drag start            | freesound.org search "soft whoosh short"    |
| `sounds/effects/drop.mp3`       | Soft thud for drop                    | freesound.org search "soft thud drop"       |
| `sounds/effects/page-turn.mp3`  | Book page turning                     | freesound.org search "page turn book"       |
| `sounds/effects/star.mp3`       | Star/sparkle sound                    | freesound.org search "star sparkle magical" |
| `sounds/effects/cheer.mp3`      | Short cheerful applause               | freesound.org search "children cheer short" |
| `sounds/effects/timer-tick.mp3` | Very soft tick (barely audible)       | freesound.org search "soft tick clock"      |

### Sensory Test Sounds (Chapter 6, ~3-5 seconds each .mp3)

| Filename                      | Sound                       | Source                                          |
| ----------------------------- | --------------------------- | ----------------------------------------------- |
| `sounds/sensory/birds.mp3`    | Birds chirping in nature    | freesound.org search "birds chirping forest"    |
| `sounds/sensory/fountain.mp3` | Water fountain flowing      | freesound.org search "water fountain outdoor"   |
| `sounds/sensory/laughter.mp3` | Children laughing (gentle)  | freesound.org search "children laughter gentle" |
| `sounds/sensory/vacuum.mp3`   | Vacuum cleaner running      | freesound.org search "vacuum cleaner running"   |
| `sounds/sensory/dog-bark.mp3` | Dog barking (moderate)      | freesound.org search "dog barking moderate"     |
| `sounds/sensory/thunder.mp3`  | Thunder clap                | freesound.org search "thunder single strike"    |
| `sounds/sensory/baby-cry.mp3` | Baby crying                 | freesound.org search "baby crying"              |
| `sounds/sensory/traffic.mp3`  | City traffic / street noise | freesound.org search "city traffic street"      |

**Key resource: freesound.org** — free, Creative Commons licensed sounds. Create a free account.

---

## 7. UI ELEMENTS

| Filename                  | Type       | Description                                          |
| ------------------------- | ---------- | ---------------------------------------------------- |
| `ui/star-gold.svg`        | Icon       | Gold filled star                                     |
| `ui/star-empty.svg`       | Icon       | Empty star outline                                   |
| `ui/medal-gold.svg`       | Icon       | Gold medal/badge                                     |
| `ui/heart.svg`            | Icon       | Filled heart                                         |
| `ui/checkmark.svg`        | Icon       | Checkmark in circle                                  |
| `ui/x-mark.svg`           | Icon       | X mark in circle                                     |
| `ui/arrow-right.svg`      | Icon       | Right arrow (next)                                   |
| `ui/home.svg`             | Icon       | Home icon                                            |
| `ui/sound-on.svg`         | Icon       | Speaker with waves                                   |
| `ui/sound-off.svg`        | Icon       | Speaker muted                                        |
| `ui/loading-spinner.svg`  | Animation  | Spinning loader (animated SVG)                       |
| `ui/confetti-piece.svg`   | Decoration | Single confetti piece (rotate in CSS)                |
| `ui/flower-happy.webp`    | Game art   | Cartoon flower bed — Happy (yellow flowers)          |
| `ui/flower-sad.webp`      | Game art   | Cartoon flower bed — Sad (blue/drooping flowers)     |
| `ui/flower-angry.webp`    | Game art   | Cartoon flower bed — Angry (red spiky flowers)       |
| `ui/flower-scared.webp`   | Game art   | Cartoon flower bed — Scared (pale/trembling flowers) |
| `ui/progress-rocket.webp` | Progress   | Small rocket for progress indicator                  |
| `ui/planet-1.webp`        | Decoration | Small purple planet                                  |
| `ui/planet-2.webp`        | Decoration | Small orange planet                                  |

**SVG icons:** Use lucide-react (already installed) for most icons — no download needed.
**Flower beds:** Can be done with CSS (colored div + emoji) if images unavailable.

---

## 8. RECOMMENDED FREE ASSET WEBSITES

| Website                  | Best For                         | License                           |
| ------------------------ | -------------------------------- | --------------------------------- |
| **freesound.org**        | All audio effects & ambient      | CC (varies, usually CC0 or CC-BY) |
| **freepik.com**          | Cartoon backgrounds, characters  | Free with attribution             |
| **vecteezy.com**         | Vector backgrounds, objects      | Free with attribution             |
| **pixabay.com**          | Backgrounds, objects, some audio | CC0 (fully free)                  |
| **openclipart.org**      | Simple SVG clipart               | CC0                               |
| **flaticon.com**         | Icon sets                        | Free with attribution             |
| **icons8.com**           | Illustrations + icons            | Free with attribution             |
| **itch.io/game-assets**  | Game sprites, characters         | Varies (many CC0/free)            |
| **opengameart.org**      | Game sprites, audio              | CC0/CC-BY                         |
| **incompetech.com**      | Background music                 | CC-BY                             |
| **freemusicarchive.org** | Background music                 | Varies                            |
| **kenney.nl**            | Game assets (excellent quality)  | CC0 — **Highly Recommended**      |

**kenney.nl is especially recommended** — they have entire free CC0 game asset packs including characters, UI elements, backgrounds, and sound effects, all in consistent cartoon style.

---

## 9. MINIMUM VIABLE ASSET SET

If time is limited, these are the absolute minimum assets needed to run the game (rest can be CSS/emoji placeholders):

**Priority 1 (game won't run without):**

- 1 guide character (bunny or any animal) — at least neutral + pointing pose
- 12 emotion faces (child only, all 4 emotions × 3 intensities)
- 8 sensory sounds (audio only, no images needed — sound source can be emoji)
- 1 background per chapter (9 total)

**Priority 2 (significant gameplay improvement):**

- Routine task cards (6 images for Chapter 4)
- Pattern shapes (can be generated as SVGs in code)
- Avatar parts (4 hair + 4 clothes — can be color swatches only initially)
- Texture images (8 for Chapter 6)

**Priority 3 (polish and completeness):**

- All remaining backgrounds
- Sound effects (click, correct, wrong)
- Topic book covers
- Action imitation images
- Ambient music tracks

---

## 10. IMPLEMENTATION NOTES

### Generating Pattern Shapes (no download needed)

```jsx
// Use inline SVG - no asset needed
const shapes = {
  "circle-red": <circle cx="40" cy="40" r="35" fill="#ef4444" />,
  "square-blue": (
    <rect x="5" y="5" width="70" height="70" fill="#3b82f6" rx="8" />
  ),
  // etc.
};
```

### Emotion Face Fallback (no image needed)

```jsx
const emotionEmojis = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  scared: "😨",
  neutral: "😐",
};
// Use large emoji (text-8xl) as fallback when image fails
```

### Color Swatch Avatar (no image needed)

```jsx
// Avatar body can be a simple SVG circle-person shape
// Hair/clothes are colored divs with border-radius
// Full SVG avatar can be generated programmatically
```

### Background Fallback Gradients

```js
export const CHAPTER_GRADIENTS = {
  1: "from-yellow-300 via-orange-300 to-pink-300",
  2: "from-green-300 via-teal-300 to-cyan-300",
  3: "from-blue-300 via-indigo-300 to-purple-300",
  4: "from-orange-300 via-amber-300 to-yellow-300",
  5: "from-pink-300 via-purple-300 to-indigo-300",
  6: "from-green-400 via-emerald-300 to-teal-300",
  7: "from-indigo-400 via-blue-300 to-cyan-300",
  8: "from-rose-300 via-pink-300 to-purple-300",
  9: "from-violet-400 via-purple-400 to-indigo-400",
};
```

Every `SceneBackground.jsx` component should use these gradients as `bg-gradient-to-br` when the image file is missing.
