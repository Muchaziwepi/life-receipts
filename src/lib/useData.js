import { useEffect, useState } from "react";

// Fetches the static JSON files from /public/data. No backend involved.
export function useData() {
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    let alive = true;
    const base = import.meta.env.BASE_URL;
    const get = (name) =>
      fetch(`${base}data/${name}.json`).then((r) => {
        if (!r.ok) throw new Error(`${name}.json returned ${r.status}`);
        return r.json();
      });

    Promise.all([get("chapters"), get("moments"), get("insights"), get("meta"), get("links")])
      .then(([chapters, moments, insights, meta, links]) => {
        if (alive) setState({ status: "ready", chapters, moments, insights, meta, links });
      })
      .catch((err) => alive && setState({ status: "error", message: err.message }));

    return () => {
      alive = false;
    };
  }, []);

  return state;
}
