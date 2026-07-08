import React, { useEffect, useMemo, useState } from 'react';
import { Code, Clock } from 'lucide-react';
import { useLocalStorage } from '../../shared/hooks/useLocalStorage';

function tryParseInput(text: string): number | null {
  const t = text.trim();
  if (!t) return null;
  // numeric-only -> treat as seconds if length <=10, else milliseconds
  if (/^-?\d+$/.test(t)) {
    const n = Number(t);
    // Heuristic: if absolute value looks like seconds (<= 1e10) treat as seconds
    if (Math.abs(n) < 1e11) {
      // if it's 10 digits or less assume seconds
      if (t.length <= 10) return n * 1000;
      return n;
    }
    return n;
  }
  // Try Date.parse for ISO8601/RFC3339 and other date strings
  const parsed = Date.parse(t);
  if (!isNaN(parsed)) return parsed;
  return null;
}

function formatISOWithTimezone(dateMs: number, tz: string) {
  try {
    const dt = new Date(dateMs);
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    const parts = fmt.formatToParts(dt).reduce((acc: any, p) => {
      if (p.type !== 'literal') acc[p.type] = p.value;
      return acc;
    }, {});

    const yyyy = parts.year;
    const MM = parts.month;
    const dd = parts.day;
    const hh = parts.hour;
    const mm = parts.minute;
    const ss = parts.second;

    // Build a UTC time for the same wall-clock time in the target timezone
    const localUtcMs = Date.UTC(Number(yyyy), Number(MM) - 1, Number(dd), Number(hh), Number(mm), Number(ss));
    // offset in minutes = (localUtcMs - instantMs)/60000
    const offsetMin = Math.round((localUtcMs - dateMs) / 60000);
    const sign = offsetMin <= 0 ? '+' : '-';
    const absMin = Math.abs(offsetMin);
    const offH = String(Math.floor(absMin / 60)).padStart(2, '0');
    const offM = String(absMin % 60).padStart(2, '0');

    const isoLocal = `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}${sign}${offH}:${offM}`;
    return isoLocal;
  } catch (e) {
    return 'Invalid timezone';
  }
}

function relativeTimeFrom(nowMs: number, targetMs: number) {
  const diff = targetMs - nowMs;
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  const abs = Math.abs(diff);
  const seconds = Math.round(diff / 1000);
  if (abs < 60 * 1000) return rtf.format(seconds, 'second');
  const minutes = Math.round(diff / (60 * 1000));
  if (abs < 60 * 60 * 1000) return rtf.format(minutes, 'minute');
  const hours = Math.round(diff / (60 * 60 * 1000));
  if (abs < 24 * 60 * 60 * 1000) return rtf.format(hours, 'hour');
  const days = Math.round(diff / (24 * 60 * 60 * 1000));
  if (abs < 30 * 24 * 60 * 60 * 1000) return rtf.format(days, 'day');
  const months = Math.round(diff / (30 * 24 * 60 * 60 * 1000));
  if (abs < 365 * 24 * 60 * 60 * 1000) return rtf.format(months, 'month');
  const years = Math.round(diff / (365 * 24 * 60 * 60 * 1000));
  return rtf.format(years, 'year');
}

const COMMON_TIMEZONES = [
  'UTC',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney'
];

export default function TimestampPage(): JSX.Element {
  const [input, setInput] = useLocalStorage('devbox.timestamp.input', '');
  const [tz, setTz] = useLocalStorage('devbox.timestamp.tz', 'UTC');
  const [now, setNow] = useState<number>(() => Date.now());
  const [realtime, setRealtime] = useState<number>(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setRealtime(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const parsedMs = useMemo(() => tryParseInput(input), [input]);

  const outputs = useMemo(() => {
    if (parsedMs == null) return null;
    const d = new Date(parsedMs);
    return {
      unix: Math.floor(parsedMs / 1000),
      millis: parsedMs,
      iso: d.toISOString(),
      rfc3339: d.toISOString(), // RFC3339 is compatible with toISOString for UTC
      local: d.toString(),
      tzIso: formatISOWithTimezone(parsedMs, tz)
    };
  }, [parsedMs, tz]);

  const nowOutputs = useMemo(() => {
    const n = now;
    const d = new Date(n);
    return {
      unix: Math.floor(n / 1000),
      millis: n,
      iso: d.toISOString()
    };
  }, [now]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleSetNow = () => setInput(String(Math.floor(Date.now() / 1000)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold flex items-center gap-2"><Clock className="w-5 h-5" /> Timestamp Tools</h1>
        <div className="text-sm text-slate-500">Convert, inspect and manipulate timestamps</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-medium">Input (Unix / milliseconds / ISO / RFC3339)</label>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. 1625812800 or 1625812800000 or 2021-07-09T12:00:00Z"
            className="w-full px-3 py-2 rounded border bg-slate-50 dark:bg-slate-800"
          />

          <div className="flex gap-2 mt-2">
            <select value={tz} onChange={(e) => setTz(e.target.value)} className="px-2 py-1 rounded border bg-white dark:bg-slate-800">
              {COMMON_TIMEZONES.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
              <option value="">Custom (enter IANA tz)</option>
            </select>
            <input
              value={tz}
              onChange={(e) => setTz(e.target.value)}
              placeholder="Timezone (IANA), e.g. America/New_York"
              className="px-2 py-1 rounded border bg-white dark:bg-slate-800 flex-1"
            />
            <button onClick={() => setInput(String(Math.floor(Date.now() / 1000)))} className="btn">Set Now (unix)</button>
            <button onClick={() => setInput(String(Date.now()))} className="btn">Set Now (ms)</button>
          </div>

          <div className="mt-3 bg-white dark:bg-slate-800 border rounded p-3">
            {!outputs && <div className="text-sm text-slate-500">Enter a timestamp to see conversions.</div>}
            {outputs && (
              <div className="space-y-2">
                <div><span className="font-medium">Unix (s):</span> {outputs.unix}</div>
                <div><span className="font-medium">Milliseconds:</span> {outputs.millis}</div>
                <div><span className="font-medium">ISO8601 (UTC):</span> {outputs.iso}</div>
                <div><span className="font-medium">RFC3339 (UTC):</span> {outputs.rfc3339}</div>
                <div><span className="font-medium">Local String:</span> {outputs.local}</div>
                <div><span className="font-medium">In {tz}:</span> {outputs.tzIso}</div>
                <div><span className="font-medium">Relative to now:</span> {relativeTimeFrom(Date.now(), parsedMs!)}</div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="bg-white dark:bg-slate-800 border rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Current Timestamp</div>
              <div className="text-xs text-slate-500">Real-time</div>
            </div>
            <div><span className="font-medium">Unix (s):</span> {Math.floor(realtime / 1000)}</div>
            <div><span className="font-medium">Milliseconds:</span> {realtime}</div>
            <div><span className="font-medium">ISO8601:</span> {new Date(realtime).toISOString()}</div>
            <div className="mt-2">
              <button onClick={handleSetNow} className="btn">Insert current unix (s) into input</button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border rounded p-3">
            <div className="text-sm font-medium mb-2">Relative Time Helper</div>
            <div className="text-sm text-slate-500">Enter an input timestamp to see relative time compared to now.</div>
            <div className="mt-2">{parsedMs ? relativeTimeFrom(Date.now(), parsedMs) : '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
