import { useMemo } from "react";
import { useActiveChapter } from "../lib/useActiveChapter";
import ChapterNav from "./ChapterNav";
import Hero from "./Hero";
import ChapterSection from "./ChapterSection";
import Patterns from "./Patterns";
import FinePrint from "./FinePrint";

export default function Story({ chapters, moments, insights, meta }) {
  const activeId = useActiveChapter(chapters.map((c) => c.id));

  const { momentsByChapter, notesByChapter, patterns } = useMemo(() => {
    const m = {};
    const n = {};
    moments.forEach((x) => {
      if (x.type === "milestone") return; // chapter markers are shown as chapter headings instead
      (m[x.chapter] ||= []).push(x);
    });
    insights.forEach((i) => {
      if (i.chapter) (n[i.chapter] ||= []).push(i);
    });
    return { momentsByChapter: m, notesByChapter: n, patterns: insights.filter((i) => !i.chapter) };
  }, [moments, insights]);

  return (
    <>
      <a className="skip" href="#story">
        Skip to the story
      </a>
      <ChapterNav chapters={chapters} activeId={activeId} />
      <main className="desk" id="story">
        <div className="roll">
          <Hero chapters={chapters} meta={meta} />
          {chapters.map((c, i) => (
            <ChapterSection
              key={c.id}
              chapter={c}
              position={i + 1}
              total={chapters.length}
              moments={momentsByChapter[c.id] ?? []}
              notes={notesByChapter[c.id] ?? []}
            />
          ))}
          <Patterns insights={patterns} />
          <FinePrint meta={meta} />
        </div>
      </main>
    </>
  );
}
