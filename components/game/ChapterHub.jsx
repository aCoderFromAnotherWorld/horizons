"use client";

import { useRouter } from "next/navigation";

import BigButton from "@/components/shared/BigButton";

export default function ChapterHub({ chapter, title, description, levels }) {
  const router = useRouter();

  return (
    <section className="responsive-section flex flex-col items-center gap-8 text-center">
      <div className="ui-panel w-full max-w-4xl rounded-lg px-5 py-8 sm:px-8 sm:py-10">
        <p className="text-sm font-black uppercase tracking-wider text-primary sm:text-lg">
          Chapter {chapter}
        </p>
        <h1 className="mt-3 text-3xl font-black text-foreground sm:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-semibold text-muted-foreground sm:text-xl">
          {description}
        </p>
      </div>

      <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {levels.map((level) => (
          <BigButton
            key={level.href}
            className="min-h-24 bg-card text-foreground hover:bg-secondary"
            onClick={() => router.push(level.href)}
          >
            {level.label}
          </BigButton>
        ))}
      </div>
    </section>
  );
}
