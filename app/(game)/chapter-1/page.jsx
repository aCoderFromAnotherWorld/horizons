import ChapterHub from "@/components/game/ChapterHub";

export default function Chapter1Page() {
  return (
    <ChapterHub
      chapter={1}
      title="Welcome to My World"
      description="Create an avatar and follow the guide."
      levels={[
        { label: "Avatar Creation", href: "/chapter-1/level-1" },
        { label: "Following the Guide", href: "/chapter-1/level-2" },
      ]}
    />
  );
}
