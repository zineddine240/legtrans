import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";

export async function POST(req: NextRequest) {
  try {
    const { tables = [], title = "LegTrans DZ — Tables" } = await req.json();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "LegTrans DZ";
    workbook.lastModifiedBy = "LegTrans DZ";
    workbook.created = new Date();

    if (tables.length === 0) {
      const sheet = workbook.addWorksheet("Empty");
      sheet.addRow(["No tables found"]);
    }

    for (let i = 0; i < tables.length; i++) {
      const tbl = tables[i];
      const sheetName = `Table ${i + 1}`;
      const worksheet = workbook.addWorksheet(sheetName);

      // Title row
      worksheet.mergeCells("A1:E1");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = `${title} - ${sheetName}`;
      titleCell.font = { size: 14, bold: true, color: { argb: "FF0D6E4E" } }; // Algerian Green
      titleCell.alignment = { horizontal: "center" };

      // Header row
      if (tbl.headers && tbl.headers.length > 0) {
        const headerRow = worksheet.addRow(tbl.headers);
        headerRow.eachCell((cell) => {
          cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0D6E4E" } };
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      }

      // Data rows
      if (tbl.rows && tbl.rows.length > 0) {
        tbl.rows.forEach((row: string[], ri: number) => {
          const dataRow = worksheet.addRow(row);
          const isEven = ri % 2 === 0;
          dataRow.eachCell((cell) => {
            if (isEven) {
              cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F8F5" } };
            }
            cell.border = {
              top: { style: "thin", color: { argb: "FFCCCCCC" } },
              left: { style: "thin", color: { argb: "FFCCCCCC" } },
              bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
              right: { style: "thin", color: { argb: "FFCCCCCC" } },
            };
          });
        });
      }

      // Column widths
      worksheet.columns?.forEach((column) => {
        column.width = 20;
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="legtrans-tables.xlsx"',
      },
    });
  } catch (error: any) {
    console.error("[export-xlsx] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
