import ChapterHub from "@/components/game/ChapterHub";

export default function Chapter2Page() {
  return (
    <ChapterHub
      chapter={2}
      title="Emotion Island"
      description="Match faces, choose expressions, and help with feelings."
      levels={[
        { label: "Emotion Matching", href: "/chapter-2/level-1" },
        { label: "Expression Mirror", href: "/chapter-2/level-2" },
        { label: "Regulation Stories", href: "/chapter-2/level-3" },
      ]}
    />
  );
}
