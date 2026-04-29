import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

// Colors
const C_HEADER_BG = "1E2A3A";
const C_GREEN     = "22C55E";
const C_RED       = "EF4444";
const C_AMBER     = "F59E0B";
const C_INDIGO    = "6366F1";
const C_AGREE_BG  = "DCFCE7";
const C_DIS_BG    = "FEE2E2";
const C_ALT       = "F8FAFC";

function makeCell(v: any, opts: {
  bold?: boolean; color?: string; bg?: string; align?: string;
  size?: number; wrap?: boolean; border?: boolean;
} = {}) {
  const cell: any = { v, t: typeof v === "number" ? "n" : "s" };
  const style: any = {
    font: { name: "Calibri", sz: opts.size ?? 10, bold: opts.bold ?? false, color: { rgb: opts.color ?? "000000" } },
    alignment: { horizontal: opts.align ?? "left", vertical: "center", wrapText: opts.wrap ?? false },
  };
  if (opts.bg) style.fill = { fgColor: { rgb: opts.bg }, patternType: "solid" };
  if (opts.border !== false) {
    style.border = {
      top: { style: "thin", color: { rgb: "D1D5DB" } },
      bottom: { style: "thin", color: { rgb: "D1D5DB" } },
      left: { style: "thin", color: { rgb: "D1D5DB" } },
      right: { style: "thin", color: { rgb: "D1D5DB" } },
    };
  }
  cell.s = style;
  return cell;
}

export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
    include: {
      tasks: {
        orderBy: { order: "asc" },
        include: {
          annotations: {
            where: { status: "SUBMITTED" },
            include: { user: { select: { id: true, name: true, email: true } } },
          },
        },
      },
    },
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // ── Build task data ────────────────────────────────────────────────────────
  const taskRows = project.tasks.map((task, i) => {
    const data: any = task.data;
    const anns = task.annotations;
    const ratings = anns.map((a: any) => a.result?.rating || a.result?.evaluation || "").filter(Boolean);
    const agreed = ratings.length >= 2 && new Set(ratings).size === 1;
    const disagreed = ratings.length >= 2 && new Set(ratings).size > 1;
    const agreement = ratings.length === 0 ? "Pending" : agreed ? "✓ Agree" : "✗ Disagree";
    const uniqueRatings = Array.from(new Set(ratings)).join(" / ");

    return {
      order: i + 1,
      task_id: String(data.id || data.task_id || data.external_id || task.id).slice(0, 50),
      domain: String(data.risk_category || data.risk || data.domain || data.category || ""),
      prompt: String(data.prompt || data.question || data.text || "").slice(0, 300),
      answer: String(data.answer || data.ai_answer || data.response || data.output || "").slice(0, 300),
      agreement,
      uniqueRatings,
      agreed,
      disagreed,
      annotations: anns.map((a) => ({
        name: a.user?.name || a.user?.email || "Unknown",
        rating: String((a.result as any)?.rating || (a.result as any)?.evaluation || ""),
        comment: a.notes || "",
      })),
    };
  });

  // ── Stats ──────────────────────────────────────────────────────────────────
  const total     = taskRows.length;
  const agreed    = taskRows.filter(t => t.agreed).length;
  const disagreed = taskRows.filter(t => t.disagreed).length;
  const pending   = taskRows.filter(t => t.agreement === "Pending").length;
  const agreePct  = total > 0 ? ((agreed / total) * 100).toFixed(1) : "0.0";

  const ratingCounts: Record<string, number> = {};
  taskRows.forEach(t => t.annotations.forEach(a => {
    if (a.rating) ratingCounts[a.rating] = (ratingCounts[a.rating] || 0) + 1;
  }));
  const ratingTotal = Object.values(ratingCounts).reduce((s, v) => s + v, 0);

  const annStats: Record<string, { total: number; ratings: Record<string, number> }> = {};
  taskRows.forEach(t => t.annotations.forEach(a => {
    if (!annStats[a.name]) annStats[a.name] = { total: 0, ratings: {} };
    annStats[a.name].total++;
    if (a.rating) annStats[a.name].ratings[a.rating] = (annStats[a.name].ratings[a.rating] || 0) + 1;
  }));

  const maxAnns = Math.max(...taskRows.map(t => t.annotations.length), 3);

  const wb = XLSX.utils.book_new();

  // ════════════════════════════════════════════════════════════════════════
  // SHEET 1 — SUMMARY
  // ════════════════════════════════════════════════════════════════════════
  const ws1: any = {};
  const s1Merges: any[] = [];

  // Title row
  ws1["A1"] = makeCell("IAA Report — Inter-Annotator Agreement", { bold: true, size: 16, color: C_INDIGO, bg: "EEF2FF", align: "center", border: false });
  s1Merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } });

  // KPI row
  const kpis = [
    ["Total Tasks",   total,                 C_INDIGO, "C7D2FE"],
    ["Agreed",        `${agreed} (${agreePct}%)`, C_GREEN, "DCFCE7"],
    ["Disagreed",     disagreed,             C_RED,    "FEE2E2"],
    ["Pending",       pending,               C_AMBER,  "FEF9C3"],
  ] as const;
  const kpiCols = [0, 2, 4, 6];
  kpis.forEach(([label, val, fg, bg], i) => {
    const col = kpiCols[i];
    ws1[XLSX.utils.encode_cell({ r: 2, c: col })] = makeCell(label, { size: 10, color: "6B7280", bg, align: "center", border: false });
    ws1[XLSX.utils.encode_cell({ r: 3, c: col })] = makeCell(val,   { size: 18, bold: true, color: fg, bg, align: "center", border: false });
    ws1[XLSX.utils.encode_cell({ r: 4, c: col })] = makeCell("",    { bg, border: false });
    s1Merges.push({ s: { r: 2, c: col }, e: { r: 2, c: col + 1 } });
    s1Merges.push({ s: { r: 3, c: col }, e: { r: 3, c: col + 1 } });
    s1Merges.push({ s: { r: 4, c: col }, e: { r: 4, c: col + 1 } });
  });

  // Spacer
  let row = 6;

  // Rating Distribution header
  ws1[XLSX.utils.encode_cell({ r: row, c: 0 })] = makeCell("Rating Distribution", { bold: true, size: 12, bg: "F3F4F6", border: false });
  s1Merges.push({ s: { r: row, c: 0 }, e: { r: row, c: 3 } });
  row++;

  // Rating headers
  ["Rating", "Count", "Percentage"].forEach((h, c) =>
    ws1[XLSX.utils.encode_cell({ r: row, c })] = makeCell(h, { bold: true, bg: C_HEADER_BG, color: "FFFFFF", align: "center" })
  );
  const ratingDataStart = row + 1;
  row++;

  const sortedRatings = Object.entries(ratingCounts).sort(([, a], [, b]) => b - a);
  sortedRatings.forEach(([label, count]) => {
    const pct = ratingTotal > 0 ? ((count / ratingTotal) * 100).toFixed(1) + "%" : "0%";
    const bg = row % 2 === 0 ? C_ALT : "FFFFFF";
    ws1[XLSX.utils.encode_cell({ r: row, c: 0 })] = makeCell(label, { bg, align: "center" });
    ws1[XLSX.utils.encode_cell({ r: row, c: 1 })] = makeCell(count, { bg, align: "center" });
    ws1[XLSX.utils.encode_cell({ r: row, c: 2 })] = makeCell(pct,   { bg, align: "center" });
    row++;
  });
  row++;

  // Annotator stats header
  ws1[XLSX.utils.encode_cell({ r: row, c: 0 })] = makeCell("Annotator Statistics", { bold: true, size: 12, bg: "F3F4F6", border: false });
  s1Merges.push({ s: { r: row, c: 0 }, e: { r: row, c: 5 } });
  row++;

  ["Annotator", "Total", "Safe", "Not Safe", "Other"].forEach((h, c) =>
    ws1[XLSX.utils.encode_cell({ r: row, c })] = makeCell(h, { bold: true, bg: C_HEADER_BG, color: "FFFFFF", align: "center" })
  );
  row++;

  Object.entries(annStats).sort().forEach(([name, stats]) => {
    const bg = row % 2 === 0 ? C_ALT : "FFFFFF";
    const safe    = stats.ratings["Safe"] || 0;
    const notSafe = stats.ratings["Not Safe"] || 0;
    const other   = stats.total - safe - notSafe;
    ws1[XLSX.utils.encode_cell({ r: row, c: 0 })] = makeCell(name,          { bg });
    ws1[XLSX.utils.encode_cell({ r: row, c: 1 })] = makeCell(stats.total,   { bg, align: "center" });
    ws1[XLSX.utils.encode_cell({ r: row, c: 2 })] = makeCell(safe,          { bg, align: "center" });
    ws1[XLSX.utils.encode_cell({ r: row, c: 3 })] = makeCell(notSafe,       { bg, align: "center" });
    ws1[XLSX.utils.encode_cell({ r: row, c: 4 })] = makeCell(other,         { bg, align: "center" });
    row++;
  });

  ws1["!ref"]   = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: row, c: 7 } });
  ws1["!merges"]= s1Merges;
  ws1["!cols"]  = [{ wch: 32 }, { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];
  ws1["!rows"]  = [{ hpx: 36 }, {}, { hpx: 20 }, { hpx: 32 }, { hpx: 8 }];
  XLSX.utils.book_append_sheet(wb, ws1, "Summary");

  // ════════════════════════════════════════════════════════════════════════
  // SHEET 2 — TASKS
  // ════════════════════════════════════════════════════════════════════════
  const buildTaskSheet = (rows: typeof taskRows, sheetName: string, headerBg = C_HEADER_BG) => {
    const ws: any = {};
    const hdrs = ["#", "Task ID", "Domain", "Prompt", "Answer", "Agreement", "Unique Ratings"];
    for (let i = 1; i <= maxAnns; i++) hdrs.push(`Annotator ${i}`, `Rating ${i}`, `Comment ${i}`);

    hdrs.forEach((h, c) =>
      ws[XLSX.utils.encode_cell({ r: 0, c })] = makeCell(h, { bold: true, bg: headerBg, color: "FFFFFF", align: "center", size: 10 })
    );

    rows.forEach((task, ri) => {
      const r = ri + 1;
      const bg = task.disagreed ? C_DIS_BG : task.agreed ? C_AGREE_BG : C_ALT;
      const agreeColor = task.disagreed ? C_RED : task.agreed ? C_GREEN : C_AMBER;

      const vals: any[] = [task.order, task.task_id, task.domain, task.prompt, task.answer, task.agreement, task.uniqueRatings];
      task.annotations.forEach(a => vals.push(a.name, a.rating, a.comment));
      while (vals.length < hdrs.length) vals.push("");

      vals.forEach((v, c) => {
        const isWrap = [3, 4].includes(c) || (c >= 7 && (c - 7) % 3 === 2);
        const cell = makeCell(v, { bg, wrap: isWrap, align: c <= 1 ? "center" : "left" });
        if (c === 5) cell.s.font.color = { rgb: agreeColor };
        ws[XLSX.utils.encode_cell({ r, c })] = cell;
      });
    });

    const colWidths = [5, 14, 14, 40, 40, 14, 18];
    for (let i = 0; i < maxAnns * 3; i++) colWidths.push(i % 3 === 0 ? 22 : 12);

    ws["!ref"]  = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rows.length, c: hdrs.length - 1 } });
    ws["!cols"] = colWidths.map(w => ({ wch: w }));
    ws["!rows"] = [{ hpx: 28 }];
    ws["!freeze"] = { xSplit: 0, ySplit: 1 };
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  };

  buildTaskSheet(taskRows, "Tasks");
  buildTaskSheet(taskRows.filter(t => t.disagreed), "Disagreements", "7F1D1D");

  // ── File name ──────────────────────────────────────────────────────────────
  const safeName = project.name.replace(/[\\/: *?"<>|]/g, "_");
  const fileName = `export_${safeName}.xlsx`;

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx", bookSST: false });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
