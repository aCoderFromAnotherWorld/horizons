import ChapterHub from "@/components/game/ChapterHub";

export default function Chapter4Page() {
  return (
    <ChapterHub
      chapter={4}
      title="Daily Routines Village"
      description="Put routines in order and try flexible choices."
      levels={[
        { label: "Morning Routine", href: "/chapter-4/level-1" },
        { label: "Playground Choice", href: "/chapter-4/level-2" },
        { label: "Unexpected Events", href: "/chapter-4/level-3" },
      ]}
    />
  );
}
