// Minimal ICS (VCALENDAR) generator — no deps, client-side download.

const pad = (n: number) => String(n).padStart(2, "0");

const formatICSDate = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

const escapeICS = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

const foldLine = (line: string) => {
  // RFC5545: lines should be folded at 75 octets. Simple split is good enough for previews.
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  for (let i = 0; i < line.length; i += 73) {
    chunks.push((i === 0 ? "" : " ") + line.slice(i, i + 73));
  }
  return chunks.join("\r\n");
};

export type ICSEvent = {
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end?: Date; // defaults to start + 2h
  url?: string;
  uid?: string;
};

export const buildICS = (e: ICSEvent): string => {
  const start = e.start;
  const end = e.end || new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const uid = e.uid || `${Date.now()}-${Math.random().toString(36).slice(2)}@cakeaiartist.com`;
  const now = new Date();
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cake AI Artist//Party Planner//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART:${formatICSDate(start)}`,
    `DTEND:${formatICSDate(end)}`,
    `SUMMARY:${escapeICS(e.title)}`,
    e.description ? `DESCRIPTION:${escapeICS(e.description)}` : "",
    e.location ? `LOCATION:${escapeICS(e.location)}` : "",
    e.url ? `URL:${escapeICS(e.url)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return lines.map(foldLine).join("\r\n");
};

export const downloadICS = (e: ICSEvent, filename = "event.ics") => {
  const ics = buildICS(e);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
