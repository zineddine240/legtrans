import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ success: false, error: "Missing url parameter" }, { status: 400 });
    }

    const apiKey = process.env.DATALAB_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "Server configuration error" }, { status: 500 });
    }

    const response = await fetch(url, {
      headers: {
        "X-API-Key": apiKey,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ success: false, error: `Datalab poll failed: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();

    if (data.status === "complete") {
      // Simple regex-based table parser for the proxy
      const tables = data.html ? parseTables(data.html) : [];
      return NextResponse.json({
        ...data,
        success: true,
        tables,
        text: data.markdown || "",
      });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Poll OCR API] Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}

/** Simple regex-based table parser */
function parseTables(html: string) {
  const tables: any[] = [];
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  let tableMatch;

  while ((tableMatch = tableRegex.exec(html)) !== null) {
    const tableContent = tableMatch[1];
    const rows: string[][] = [];
    let headers: string[] = [];

    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;
    let rowIndex = 0;

    while ((rowMatch = rowRegex.exec(tableContent)) !== null) {
      const rowContent = rowMatch[1];
      const cells: string[] = [];
      const cellRegex = /<(td|th)[^>]*>([\s\S]*?)<\/(td|th)>/gi;
      let cellMatch;

      while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
        cells.push(cellMatch[2].replace(/<[^>]*>?/gm, "").trim());
      }

      if (cells.length > 0) {
        if (rowIndex === 0 && rowContent.includes("<th")) {
          headers = cells;
        } else {
          rows.push(cells);
        }
        rowIndex++;
      }
    }

    if (rows.length > 0) {
      tables.push({ headers: headers.length > 0 ? headers : rows[0].map((_, i) => `Col ${i + 1}`), rows });
    }
  }
  return tables;
}
