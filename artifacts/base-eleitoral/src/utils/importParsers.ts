export type ParsedImportFile = {
  headers: string[];
  rows: Array<Record<string, string>>;
};

export async function parseSpreadsheetFile(file: File): Promise<ParsedImportFile> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "csv") return parseCsv(await file.text());
  if (extension === "xlsx" || extension === "xls") return parseXlsx(file);
  throw new Error("Formato inválido. Envie um arquivo .csv ou .xlsx.");
}

export function parseCsv(text: string): ParsedImportFile {
  const clean = text.replace(/^\uFEFF/, "");
  const lines = clean.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (!lines.length) return { headers: [], rows: [] };
  const separator = detectSeparator(lines[0]);
  const headers = splitCsvLine(lines[0], separator).map((item) => item.trim());
  const rows = lines.slice(1).map((line) => {
    const values = splitCsvLine(line, separator);
    return Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() ?? ""]));
  });
  return { headers, rows };
}

async function parseXlsx(file: File): Promise<ParsedImportFile> {
  const XLSX = await import("xlsx");
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  const headers = rows.length ? Object.keys(rows[0]) : [];
  return {
    headers,
    rows: rows.map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, String(value ?? "").trim()]))),
  };
}

function detectSeparator(line: string) {
  const semicolons = (line.match(/;/g) ?? []).length;
  const commas = (line.match(/,/g) ?? []).length;
  return semicolons >= commas ? ";" : ",";
}

function splitCsvLine(line: string, separator: string) {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === "\"") {
      if (insideQuotes && line[index + 1] === "\"") {
        current += "\"";
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === separator && !insideQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
