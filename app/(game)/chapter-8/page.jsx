import ChapterHub from "@/components/game/ChapterHub";

export default function Chapter8Page() {
  return (
    <ChapterHub
      chapter={8}
      title="Copy Cat Challenge"
      description="Watch actions and copy the sequence."
      levels={[
        { label: "Simple Imitation", href: "/chapter-8/level-1" },
        { label: "Sequence Imitation", href: "/chapter-8/level-2" },
      ]}
    />
  );
}
