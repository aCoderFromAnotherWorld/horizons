import ChapterHub from "@/components/game/ChapterHub";

export default function Chapter7Page() {
  return (
    <ChapterHub
      chapter={7}
      title="Pattern Detective"
      description="Complete patterns and try new choices."
      levels={[
        { label: "Pattern Completion", href: "/chapter-7/level-1" },
        { label: "Free Play", href: "/chapter-7/level-2" },
        { label: "Topic Books", href: "/chapter-7/level-3" },
      ]}
    />
  );
}
