import ChapterHub from "@/components/game/ChapterHub";

export default function Chapter3Page() {
  return (
    <ChapterHub
      chapter={3}
      title="Friend's House Visit"
      description="Practice greeting, conversation, and sharing."
      levels={[
        { label: "Greeting Sequence", href: "/chapter-3/level-1" },
        { label: "Turn-Taking", href: "/chapter-3/level-2" },
        { label: "Sharing Attention", href: "/chapter-3/level-3" },
      ]}
    />
  );
}
