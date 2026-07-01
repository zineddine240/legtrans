import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";

export async function POST(req: NextRequest) {
  try {
    const { translations } = await req.json();

    if (!translations || !Array.isArray(translations)) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Traductions");

    // Group translations by language pair
    const grouped: Record<string, any[]> = {};
    translations.forEach((item: any) => {
      const key = `${item.sourceLanguage.toUpperCase()} - ${item.targetLanguage.toUpperCase()}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    const pairKeys = Object.keys(grouped);
    
    // Distinct vibrant colors for different language pairs
    const colors = [
      "FF1E40AF", // Blue
      "FF047857", // Green
      "FFB91C1C", // Red
      "FFB45309", // Orange
      "FF6D28D9", // Purple
      "FFBE185D", // Pink
    ];
    
    const headers: string[] = [];
    const headerColors: string[] = [];

    pairKeys.forEach((key, idx) => {
      headers.push(`${key} (Original)`);
      headers.push(`${key} (Traduction)`);
      
      const color = colors[idx % colors.length];
      headerColors.push(color); // Color for original
      headerColors.push(color); // Color for traduction
    });

    const headerRow = sheet.addRow(headers);
    
    // Style headers
    headerRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { 
        type: "pattern", 
        pattern: "solid", 
        fgColor: { argb: headerColors[colNumber - 1] } 
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Find maximum rows needed
    const maxRows = Math.max(...Object.values(grouped).map((arr: any) => arr.length));

    // Fill data
    for (let i = 0; i < maxRows; i++) {
      const rowData: string[] = [];
      pairKeys.forEach(key => {
        const pair = grouped[key][i];
        if (pair) {
          rowData.push(pair.inputText);
          rowData.push(pair.outputText);
        } else {
          rowData.push("");
          rowData.push("");
        }
      });
      
      const dataRow = sheet.addRow(rowData);
      dataRow.eachCell(cell => {
         cell.alignment = { wrapText: true, vertical: "top" };
         cell.border = {
          top: { style: "thin", color: { argb: "FFCCCCCC" } },
          left: { style: "thin", color: { argb: "FFCCCCCC" } },
          bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
          right: { style: "thin", color: { argb: "FFCCCCCC" } },
        };
      });
    }

    // Set column widths
    sheet.columns.forEach(col => { 
      col.width = 45; 
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="traductions.xlsx"',
      },
    });

  } catch (err: any) {
    console.error("Excel Export Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
