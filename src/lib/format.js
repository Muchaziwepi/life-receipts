const nf = new Intl.NumberFormat("en-US");
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const num = (n) => nf.format(Math.round(n));
export const inr = (n) => "₹" + nf.format(Math.round(n));
export const pct = (x) => Math.round(x * 100) + "%";

// Dates arrive as "2017-07-05" or "2017-07-05T12:00:00". Parse by hand so time zones never shift the day.
const parts = (iso) => {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return { y, m, d };
};
export const shortDate = (iso) => {
  const { y, m, d } = parts(iso);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};
export const rangeLabel = (start, end) => {
  const a = parts(start);
  const b = parts(end);
  const left = a.y === b.y ? `${a.d} ${MONTHS[a.m - 1]}` : `${a.d} ${MONTHS[a.m - 1]} ${a.y}`;
  return `${left} – ${b.d} ${MONTHS[b.m - 1]} ${b.y}`;
};
export const yearSpan = (c) => {
  const y0 = parts(c.start).y;
  const y1 = parts(c.end).y;
  return y0 === y1 ? String(y0) : `${y0}–${String(y1).slice(2)}`;
};

export const MOODS = {
  prologue: { label: "Prologue", color: "#8b8f96" },
  burst: { label: "First burst", color: "#d9902f" },
  quiet: { label: "Quiet", color: "#4f9d9a" },
  steady: { label: "Steady", color: "#3b5bdb" },
  peak: { label: "Loudest stretch", color: "#c62f2a" },
  explorer: { label: "Explorer", color: "#2f8f5b" },
};
export const moodOf = (c) => MOODS[c.mood] ?? MOODS.steady;

export const TYPE_LABEL = { music: "Music", purchase: "Purchase", income: "Income", card: "Card" };
export const TYPE_GLYPH = { music: "♪", purchase: "₹", income: "+", card: "▭" };
