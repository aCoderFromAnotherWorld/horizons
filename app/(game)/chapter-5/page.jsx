import ChapterHub from "@/components/game/ChapterHub";

export default function Chapter5Page() {
  return (
    <ChapterHub
      chapter={5}
      title="Pretend Play Theater"
      description="Spot pretend play and create new stories."
      levels={[
        { label: "Pretend Recognition", href: "/chapter-5/level-1" },
        { label: "Make Pretend Play", href: "/chapter-5/level-2" },
      ]}
    />
  );
}
