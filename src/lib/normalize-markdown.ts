const validDelimiterCell = /^:?-{3,}:?$/;
const delimiterCell = /^:?-*:?$/;

function parseRow(fragment: string): string[] {
  let row = fragment.trim();
  if (row.startsWith("|")) row = row.slice(1);
  if (row.endsWith("|")) row = row.slice(0, -1);
  return row.split("|").map((cell) => cell.trim());
}

function normalizeDelimiter(cell: string): string {
  if (validDelimiterCell.test(cell)) return cell;
  if (cell.startsWith(":") && cell.endsWith(":") && cell.length > 1) {
    return ":---:";
  }
  if (cell.startsWith(":")) return ":---";
  if (cell.endsWith(":")) return "---:";
  return "---";
}

function normalizeCollapsedTableLine(line: string): string {
  const trimmed = line.trim();
  if (
    !trimmed.startsWith("|") ||
    !trimmed.endsWith("|") ||
    !/\|\s+\|/.test(trimmed)
  ) {
    return line;
  }

  const fragments = trimmed.split(/\|\s+\|/);
  if (fragments.length < 3) return line;

  const header = parseRow(fragments[0]);
  const delimiter = parseRow(fragments[1]);
  const dataRows = fragments.slice(2).map(parseRow);
  const isTable =
    header.length >= 2 &&
    delimiter.length === header.length &&
    delimiter.every((cell) => cell.length > 0 && delimiterCell.test(cell)) &&
    delimiter.some((cell) => validDelimiterCell.test(cell)) &&
    dataRows.every((row) => row.length === header.length);

  if (!isTable) return line;

  const indent = line.slice(0, line.length - line.trimStart().length);
  return [header, delimiter.map(normalizeDelimiter), ...dataRows]
    .map((row) => `${indent}| ${row.join(" | ")} |`)
    .join("\n");
}

export function normalizeMarkdown(markdown: string): string {
  return markdown.split("\n").map(normalizeCollapsedTableLine).join("\n");
}
