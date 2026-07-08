export function indexToLineCol(text: string, index: number) {
  const safeIndex = Math.max(0, Math.min(index, text.length));
  const before = text.slice(0, safeIndex);
  const lines = before.split('\n');
  const line = lines.length; // 1-based
  const column = lines[lines.length - 1].length + 1; // 1-based
  return { line, column };
}

export function extractPositionFromErrorMessage(message: string): number | undefined {
  if (!message) return undefined;
  // Common patterns: "at position 123", "position 123", "char 123"
  const patterns = [/at position (\d+)/i, /position (\d+)/i, /char (\d+)/i, /offset (\d+)/i];
  for (const p of patterns) {
    const m = p.exec(message);
    if (m && m[1]) return parseInt(m[1], 10);
  }
  // Some environments include the index after a colon like: "Unexpected token } in JSON at position 123"
  const generic = /(\d+)(?![\s\S]*\d+)/.exec(message);
  if (generic && generic[1]) {
    const n = parseInt(generic[1], 10);
    if (!Number.isNaN(n)) return n;
  }
  return undefined;
}
