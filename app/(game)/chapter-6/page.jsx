import ChapterHub from "@/components/game/ChapterHub";

export default function Chapter6Page() {
  return (
    <ChapterHub
      chapter={6}
      title="Sensory Garden"
      description="Explore sounds, rooms, and textures."
      levels={[
        { label: "Sound Sensitivity", href: "/chapter-6/level-1" },
        { label: "Visual Rooms", href: "/chapter-6/level-2" },
        { label: "Texture Choices", href: "/chapter-6/level-3" },
      ]}
    />
  );
}
