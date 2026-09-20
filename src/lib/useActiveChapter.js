import { useEffect, useState } from "react";

// Tracks which section (by element id) is in the middle of the screen, for the navigation.
export function useActiveSection(elementIds) {
  const [active, setActive] = useState(elementIds[0]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    elementIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [elementIds.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps

  return active;
}
