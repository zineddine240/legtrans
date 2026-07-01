import { NextRequest, NextResponse } from "next/server";
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, ShadingType, PageOrientation,
} from "docx";

// ── Markdown → docx children ──────────────────────────────────────────────────
function markdownToDocx(text: string, isLandscape: boolean): (Paragraph | Table)[] {
  const children: (Paragraph | Table)[] = [];
  const lines = text.split("\n");
  let i = 0;

  const tableWidth = isLandscape ? 14000 : 9500;

  while (i < lines.length) {
    const line = lines[i];

    // Detect markdown table (starts with |, next line is separator)
    if (
      line.trim().startsWith("|") &&
      lines[i + 1]?.trim().match(/^\|[-| :]+\|$/)
    ) {
      const headers = line.trim().split("|").filter((_, j, a) => j > 0 && j < a.length - 1).map(s => s.trim());
      i += 2; // skip header + separator

      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const rowCells = lines[i].trim().split("|").filter((_, j, a) => j > 0 && j < a.length - 1).map(s =>
          s.trim().replace(/<\/?[^>]+(>|$)/g, "") // strip HTML tags
        );
        // Pad row to match headers length
        while (rowCells.length < headers.length) rowCells.push("");
        // Trim row to match headers length (if too long)
        rows.push(rowCells.slice(0, headers.length));
        i++;
      }

      const colCount = headers.length;
      if (colCount === 0) { i++; continue; } // skip malformed tables
      const colWidth = Math.floor(tableWidth / colCount);

      const tableRows: TableRow[] = [
        // Header row
        new TableRow({
          tableHeader: true,
          children: headers.map(h =>
            new TableCell({
              width: { size: colWidth, type: WidthType.DXA },
              shading: { type: ShadingType.CLEAR, fill: "FFFFFF" }, // Clean white header
              children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: h, bold: true, color: "000000", size: 18 })],
              })],
              borders: {
                top:    { style: BorderStyle.SINGLE, size: 8, color: "000000" },
                bottom: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
                left:   { style: BorderStyle.SINGLE, size: 8, color: "000000" },
                right:  { style: BorderStyle.SINGLE, size: 8, color: "000000" },
              },
            })
          ),
        }),
        // Data rows (exact 1:1 mapping)
        ...rows.map((row) =>
          new TableRow({
            children: row.map((cell) => {
              return new TableCell({
                width: { size: colWidth, type: WidthType.DXA },
                shading: { type: ShadingType.CLEAR, fill: "FFFFFF" },
                children: [new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: cell || "", size: 18, color: "000000" })],
                })],
                borders: {
                  top:    { style: BorderStyle.SINGLE, size: 8, color: "000000" },
                  bottom: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
                  left:   { style: BorderStyle.SINGLE, size: 8, color: "000000" },
                  right:  { style: BorderStyle.SINGLE, size: 8, color: "000000" },
                },
              });
            }),
          })
        ),
      ];

      children.push(new Table({
        width: { size: tableWidth, type: WidthType.DXA },
        rows: tableRows,
      }));

      // Space after table
      children.push(new Paragraph({ children: [new TextRun("")], spacing: { after: 200 } }));
      continue;
    }

    // Heading lines (##, #)
    if (line.startsWith("## ")) {
      const textVal = line.slice(3).trim();
      const isArabic = /[\u0600-\u06FF]/.test(textVal);
      children.push(new Paragraph({
        text: textVal,
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 200 },
        alignment: isArabic ? AlignmentType.RIGHT : AlignmentType.LEFT,
        bidirectional: isArabic,
      }));
    } else if (line.startsWith("# ")) {
      const textVal = line.slice(2).trim();
      const isArabic = /[\u0600-\u06FF]/.test(textVal);
      children.push(new Paragraph({
        text: textVal,
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 300 },
        alignment: isArabic ? AlignmentType.RIGHT : AlignmentType.LEFT,
        bidirectional: isArabic,
      }));
    } else if (line.trim() === "") {
      children.push(new Paragraph({ children: [new TextRun("")], spacing: { after: 80 } }));
    } else {
      const clean = line.replace(/<\/?[^>]+(>|$)/g, "").trim();
      const isArabic = /[\u0600-\u06FF]/.test(clean);
      children.push(new Paragraph({
        alignment: isArabic ? AlignmentType.RIGHT : AlignmentType.LEFT,
        bidirectional: isArabic,
        children: [new TextRun({
          text: clean,
          size: 20,
          rightToLeft: isArabic,
        })],
        spacing: { after: 120 },
      }));
    }

    i++;
  }

  return children;
}

// ── API Route ─────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text: string = body.text || "";
    const orientation: string = body.orientation || "portrait";
    const isLandscape = orientation === "landscape";

    if (!text) {
      return NextResponse.json({ error: "Texte requis" }, { status: 400 });
    }

    const doc = new Document({
      creator: "LegTrans DZ",
      title: "Document OCR",
      sections: [{
        properties: {
          page: {
            margin: { top: 800, right: 800, bottom: 800, left: 800 },
            size: {
              width: 11906, // Standard A4 portrait width in twips
              height: 16838, // Standard A4 portrait height in twips
              orientation: isLandscape ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT,
            },
          },
        },
        children: [
          new Paragraph({
            text: "Document extrait par LegTrans DZ",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 400 },
          }),
          ...markdownToDocx(text, isLandscape),
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(buffer as any, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="legtrans-ocr-${Date.now()}.docx"`,
      },
    });
  } catch (err) {
    console.error("export-docx error:", err);
    return NextResponse.json({ error: "Échec génération Word" }, { status: 500 });
  }
}
