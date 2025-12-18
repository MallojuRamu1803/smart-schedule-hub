import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { TimetableEntry, WorkingDay, TimeSlot } from '@/lib/types';

interface ExportOptions {
  title: string;
  subtitle?: string;
  viewType: 'section' | 'faculty' | 'room';
  viewName: string;
}

export const exportTimetableToPDF = (
  entries: TimetableEntry[],
  workingDays: WorkingDay[],
  timeSlots: TimeSlot[],
  options: ExportOptions
) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(options.title, 14, 20);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${options.viewType.charAt(0).toUpperCase() + options.viewType.slice(1)}: ${options.viewName}`, 14, 28);
  
  if (options.subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(options.subtitle, 14, 34);
    doc.setTextColor(0);
  }

  // Prepare table data
  const headers = ['Time', ...workingDays.map(d => d.day_name)];
  
  const rows = timeSlots.map(slot => {
    const row: string[] = [`${slot.start_time} - ${slot.end_time}`];
    
    workingDays.forEach(day => {
      if (slot.is_break) {
        row.push(slot.break_name || 'Break');
      } else {
        const entry = entries.find(
          e => e.working_day_id === day.id && e.time_slot_id === slot.id
        );
        
        if (entry) {
          const subject = entry.subject?.name || 'N/A';
          const faculty = entry.faculty?.name || '';
          const room = entry.classroom?.name || '';
          row.push(`${subject}\n${faculty}\n${room}`);
        } else {
          row.push('-');
        }
      }
    });
    
    return row;
  });

  // Generate table
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: options.subtitle ? 40 : 35,
    styles: {
      fontSize: 8,
      cellPadding: 2,
      valign: 'middle',
      halign: 'center',
    },
    headStyles: {
      fillColor: [30, 64, 175], // Primary blue
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold', cellWidth: 25 },
    },
    didParseCell: (data) => {
      // Style break rows
      const slot = timeSlots[data.row.index];
      if (slot?.is_break && data.column.index > 0) {
        data.cell.styles.fillColor = [255, 243, 205]; // Amber for breaks
        data.cell.styles.textColor = [180, 83, 9];
        data.cell.styles.fontStyle = 'italic';
      }
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const filename = `timetable_${options.viewType}_${options.viewName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  doc.save(filename);

  return filename;
};

export const exportMultipleTimetablesToPDF = (
  allEntries: Map<string, { entries: TimetableEntry[]; name: string }>,
  workingDays: WorkingDay[],
  timeSlots: TimeSlot[],
  title: string,
  viewType: 'section' | 'faculty' | 'room'
) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  let isFirstPage = true;

  allEntries.forEach(({ entries, name }) => {
    if (!isFirstPage) {
      doc.addPage();
    }
    isFirstPage = false;

    // Header for each section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 15);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`${viewType.charAt(0).toUpperCase() + viewType.slice(1)}: ${name}`, 14, 22);

    // Prepare table data
    const headers = ['Time', ...workingDays.map(d => d.day_name)];
    
    const rows = timeSlots.map(slot => {
      const row: string[] = [`${slot.start_time} - ${slot.end_time}`];
      
      workingDays.forEach(day => {
        if (slot.is_break) {
          row.push(slot.break_name || 'Break');
        } else {
          const entry = entries.find(
            e => e.working_day_id === day.id && e.time_slot_id === slot.id
          );
          
          if (entry) {
            const subject = entry.subject?.name || 'N/A';
            const faculty = entry.faculty?.name || '';
            const room = entry.classroom?.name || '';
            row.push(`${subject}\n${faculty}\n${room}`);
          } else {
            row.push('-');
          }
        }
      });
      
      return row;
    });

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 28,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        valign: 'middle',
        halign: 'center',
      },
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold', cellWidth: 25 },
      },
      didParseCell: (data) => {
        const slot = timeSlots[data.row.index];
        if (slot?.is_break && data.column.index > 0) {
          data.cell.styles.fillColor = [255, 243, 205];
          data.cell.styles.textColor = [180, 83, 9];
          data.cell.styles.fontStyle = 'italic';
        }
      },
    });
  });

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  const filename = `timetable_all_${viewType}s_${Date.now()}.pdf`;
  doc.save(filename);

  return filename;
};
