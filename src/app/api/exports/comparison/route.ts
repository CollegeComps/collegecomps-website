import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
;
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { getUsersDb } from '@/lib/db-helper'



export async function POST(req: NextRequest) {
  const db = getUsersDb();
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.subscriptionTier !== 'premium' && session.user.subscriptionTier !== 'professional') {
      return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 });
    }

    const body = await req.json();
    const { comparisonId, format, options = {} } = body;

    if (!comparisonId || !format) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Fetch comparison data
    const comparison = db.prepare(`
      SELECT * FROM saved_comparisons
      WHERE id = ? AND user_id = ?
    `).get(comparisonId, session.user.id);

    if (!comparison) {
      return NextResponse.json({ error: 'Comparison not found' }, { status: 404 });
    }

    // Generate export based on format
    let buffer: Buffer;
    let contentType: string;
    let filename: string;

    switch (format) {
      case 'csv':
        buffer = Buffer.from(generateCSV(comparison), 'utf-8');
        contentType = 'text/csv';
        filename = `comparison-${comparisonId}.csv`;
        break;
      case 'excel':
        buffer = await generateExcel(comparison, options);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename = `comparison-${comparisonId}.xlsx`;
        break;
      case 'pdf':
        buffer = await generatePDF(comparison, options);
        contentType = 'application/pdf';
        filename = `comparison-${comparisonId}.pdf`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }

    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting comparison:', error);
    return NextResponse.json(
      { error: 'Failed to export comparison' },
      { status: 500 }
    );
  }
}

function generateCSV(comparison: any): string {
  const data = JSON.parse(comparison.comparison_data || '{}');
  const colleges = data.colleges || [];
  
  let csv = 'College Name,Total Cost,Financial Aid,Net Cost,Expected Salary,ROI\n';
  
  colleges.forEach((college: any) => {
    csv += `"${college.name || 'N/A'}",`;
    csv += `"${college.totalCost || 'N/A'}",`;
    csv += `"${college.financialAid || 'N/A'}",`;
    csv += `"${college.netCost || 'N/A'}",`;
    csv += `"${college.expectedSalary || 'N/A'}",`;
    csv += `"${college.roi || 'N/A'}"\n`;
  });
  
  return csv;
}

async function generatePDF(comparison: any, options: any = {}): Promise<Buffer> {
  const data = JSON.parse(comparison.comparison_data || '{}');
  const colleges = data.colleges || [];

  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235); // Blue
  doc.text('College Comparison Report', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
  doc.text(`Comparison: ${comparison.name || 'Untitled'}`, 14, 34);
  
  // Prepare table data
  const tableData = colleges.map((college: any) => [
    college.name || 'N/A',
    college.totalCost ? `$${college.totalCost.toLocaleString()}` : 'N/A',
    college.financialAid ? `$${college.financialAid.toLocaleString()}` : 'N/A',
    college.netCost ? `$${college.netCost.toLocaleString()}` : 'N/A',
    college.expectedSalary ? `$${college.expectedSalary.toLocaleString()}` : 'N/A',
    college.roi || 'N/A',
  ]);

  // Add table
  autoTable(doc, {
    startY: 40,
    head: [['College', 'Total Cost', 'Financial Aid', 'Net Cost', 'Expected Salary', 'ROI']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 25, halign: 'right' },
      2: { cellWidth: 25, halign: 'right' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
      5: { cellWidth: 20, halign: 'center' },
    },
  });

  // Add optional sections based on options
  const finalY = (doc as any).lastAutoTable.finalY || 40;
  
  if (options.includeNotes && finalY < 250) {
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('Notes:', 14, finalY + 15);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('This report was generated using CollegeComps ROI Calculator.', 14, finalY + 22);
    doc.text('Visit our platform for more detailed analysis and comparisons.', 14, finalY + 28);
  }

  // Convert to buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}

async function generateExcel(comparison: any, options: any = {}): Promise<Buffer> {
  const data = JSON.parse(comparison.comparison_data || '{}');
  const colleges = data.colleges || [];

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CollegeComps';
  workbook.created = new Date();
  
  const worksheet = workbook.addWorksheet('College Comparison');

  // Title
  worksheet.mergeCells('A1:F1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'College Comparison Report';
  titleCell.font = { size: 16, bold: true, color: { argb: 'FF2563EB' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF3F4F6' },
  };

  // Metadata
  worksheet.getCell('A2').value = `Generated: ${new Date().toLocaleDateString()}`;
  worksheet.getCell('A3').value = `Comparison: ${comparison.name || 'Untitled'}`;
  worksheet.getCell('A2').font = { italic: true, color: { argb: 'FF6B7280' } };
  worksheet.getCell('A3').font = { italic: true, color: { argb: 'FF6B7280' } };

  // Headers
  const headers = ['College Name', 'Total Cost', 'Financial Aid', 'Net Cost', 'Expected Salary', 'ROI'];
  const headerRow = worksheet.getRow(5);
  headers.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = header;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  headerRow.height = 25;

  // Data rows
  colleges.forEach((college: any, index: number) => {
    const row = worksheet.getRow(6 + index);
    row.getCell(1).value = college.name || 'N/A';
    row.getCell(2).value = college.totalCost || 0;
    row.getCell(3).value = college.financialAid || 0;
    row.getCell(4).value = college.netCost || 0;
    row.getCell(5).value = college.expectedSalary || 0;
    row.getCell(6).value = college.roi || 'N/A';

    // Format currency columns
    [2, 3, 4, 5].forEach(colNum => {
      row.getCell(colNum).numFmt = '$#,##0';
    });

    // Zebra striping
    if (index % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9FAFB' },
        };
      });
    }
  });

  // Column widths
  worksheet.getColumn(1).width = 35;
  worksheet.getColumn(2).width = 15;
  worksheet.getColumn(3).width = 15;
  worksheet.getColumn(4).width = 15;
  worksheet.getColumn(5).width = 18;
  worksheet.getColumn(6).width = 12;

  // Add borders
  const lastRow = 5 + colleges.length;
  for (let row = 5; row <= lastRow; row++) {
    for (let col = 1; col <= 6; col++) {
      const cell = worksheet.getCell(row, col);
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      };
    }
  }

  // Convert to buffer
  const excelBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(excelBuffer);
}

function generatePDFText(comparison: any): string {
  const data = JSON.parse(comparison.comparison_data || '{}');
  
  let text = `College Comparison Report\n`;
  text += `Generated: ${new Date().toLocaleDateString()}\n`;
  text += `Comparison Name: ${comparison.name || 'Untitled'}\n`;
  text += `\n${'='.repeat(60)}\n\n`;
  
  const colleges = data.colleges || [];
  colleges.forEach((college: any, idx: number) => {
    text += `${idx + 1}. ${college.name || 'Unknown College'}\n`;
    text += `   Total Cost: $${college.totalCost?.toLocaleString() || 'N/A'}\n`;
    text += `   Financial Aid: $${college.financialAid?.toLocaleString() || 'N/A'}\n`;
    text += `   Net Cost: $${college.netCost?.toLocaleString() || 'N/A'}\n`;
    text += `   Expected Salary: $${college.expectedSalary?.toLocaleString() || 'N/A'}\n`;
    text += `   ROI: ${college.roi || 'N/A'}\n`;
    text += `\n`;
  });
  
  text += `${'='.repeat(60)}\n`;
  text += `\nNote: This is a text export. PDF generation with charts coming soon!\n`;
  
  return text;
}