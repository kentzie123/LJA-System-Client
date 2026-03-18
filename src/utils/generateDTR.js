import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// --- HELPERS ---
const format12Hour = (timeString) => {
  if (!timeString || timeString === '--:--') return '--:--';
  if (timeString.includes('T')) {
    const d = new Date(timeString);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
  const [hoursString, minutes] = timeString.split(':');
  let hours = parseInt(hoursString, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; 
  return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

const formatDateTime12Hour = (isoString) => {
  if (!isoString) return '--';
  const d = new Date(isoString);
  if (isNaN(d)) return '--';
  const date = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${date}, ${time}`;
};

const formatFriendlyDate = (dateString) => {
  if (!dateString) return 'N/A';
  const safeDate = dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
  return new Date(safeDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

const formatFileNameDate = (dateString) => {
  if (!dateString) return '';
  const safeDate = dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
  const d = new Date(safeDate);
  return `${d.toLocaleString('en-US', { month: 'short' })}_${d.getDate().toString().padStart(2, '0')}_${d.getFullYear()}`;
};

const getLocalYYYYMMDD = (input) => {
  if (!input) return null;
  if (typeof input === 'string') {
    const match = input.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
  }
  const d = new Date(input);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const downloadDTRExcel = async (employee, attendanceRecords, leaveRecords, overtimeRecords, startDate, endDate) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('DTR');

  sheet.pageSetup = {
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0, 
    paperSize: 9, 
    margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 }
  };

  const FONT_FAMILY = 'Inter'; 
  const COLOR_ACCENT = 'FF094C8A'; 
  const COLOR_TEXT = 'FF1F2937'; 
  const COLOR_MUTED = 'FF6B7280'; 
  const COLOR_BG_ALT = 'FFF3F4F6'; 

  sheet.columns = [
    { key: 'A', width: 14 }, { key: 'B', width: 8 }, { key: 'C', width: 12 }, 
    { key: 'D', width: 12 }, { key: 'E', width: 10 }, { key: 'F', width: 18 }, 
    { key: 'G', width: 18 }, { key: 'H', width: 10 }, { key: 'I', width: 35 }, 
  ];

  sheet.mergeCells('A1:I1');
  const title1 = sheet.getCell('A1');
  title1.value = 'LJA POWER LIMITED CO.';
  title1.font = { bold: true, size: 18, name: FONT_FAMILY, color: { argb: COLOR_ACCENT } };
  title1.alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('A2:I2');
  const title2 = sheet.getCell('A2');
  title2.value = 'DAILY TIME RECORD (DTR)';
  title2.font = { bold: true, size: 11, color: { argb: COLOR_MUTED }, name: FONT_FAMILY };
  title2.alignment = { horizontal: 'center', vertical: 'middle' };

  const labelFont = { bold: true, color: { argb: COLOR_MUTED }, size: 9.5, name: FONT_FAMILY };
  const valFont = { bold: true, size: 10, color: { argb: COLOR_TEXT }, name: FONT_FAMILY };

  sheet.getCell('A4').value = 'Employee:'; sheet.getCell('A4').font = labelFont;
  sheet.mergeCells('B4:D4'); sheet.getCell('B4').value = employee?.fullname || 'N/A'; sheet.getCell('B4').font = valFont;

  sheet.getCell('F4').value = 'Period:'; sheet.getCell('F4').font = labelFont;
  sheet.mergeCells('G4:I4'); sheet.getCell('G4').value = `${formatFriendlyDate(startDate)} - ${formatFriendlyDate(endDate)}`; sheet.getCell('G4').font = valFont;

  sheet.getCell('A5').value = 'Position:'; sheet.getCell('A5').font = labelFont;
  sheet.mergeCells('B5:D5'); sheet.getCell('B5').value = employee?.position || 'Staff'; sheet.getCell('B5').font = valFont;

  sheet.getCell('F5').value = 'Employee ID:'; sheet.getCell('F5').font = labelFont;
  sheet.mergeCells('G5:I5'); sheet.getCell('G5').value = employee?.employee_id || 'N/A'; sheet.getCell('G5').font = valFont;

  const headerRow = sheet.getRow(7); 
  headerRow.values = ['Date', 'Day', 'Time In', 'Time Out', 'Reg Hrs', 'OT In', 'OT Out', 'OT Hrs', 'Remarks'];
  headerRow.height = 28; 
  for (let i = 1; i <= 9; i++) {
    const cell = headerRow.getCell(i);
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: FONT_FAMILY, size: 9.5 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_ACCENT } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  }

  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T23:59:59'); 
  let curr = new Date(start);
  let currentRow = 8; 
  let dayCounter = 0; // Used for alternating colors regardless of sub-rows

  while (curr <= end) {
    const dateStr = getLocalYYYYMMDD(curr); 
    const dayName = curr.toLocaleDateString('en-US', { weekday: 'short' });
    const isSunday = dayName === 'Sun'; 

    const att = attendanceRecords.find(r => getLocalYYYYMMDD(r.date) === dateStr);
    
    // UPDATED: Strictly use start_datetime to match the database changes
    const ot = overtimeRecords.find(o => {
      if (!o.start_datetime || o.status !== 'Approved') return false;
      return getLocalYYYYMMDD(o.start_datetime) === dateStr;
    });

    const leave = leaveRecords.find(l => {
      const lStart = new Date(l.start_date + (l.start_date.includes('T') ? '' : 'T00:00:00'));
      const lEnd = new Date(l.end_date + (l.end_date.includes('T') ? '' : 'T23:59:59'));
      return curr >= lStart && curr <= lEnd && l.status === 'Approved';
    });

    let timeIn = att ? format12Hour(att.time_in) : '--:--';
    let timeOut = att ? format12Hour(att.time_out) : '--:--';
    let regHrs = att?.worked_hours || '--';
    let scope = att?.work_summary || '';

    if (leave) {
      scope = `${leave.leave_type_name || 'Leave'}: ${leave.reason || ''}`;
      if (!att) { timeIn = 'LEAVE'; timeOut = 'LEAVE'; }
    } else if (isSunday && !att && !ot) {
      scope = 'WEEKEND'; 
    }

    const row = sheet.getRow(currentRow);
    row.values = [
      formatFriendlyDate(dateStr), dayName, timeIn, timeOut, regHrs, 
      ot ? formatDateTime12Hour(ot.start_datetime) : '--',
      ot ? formatDateTime12Hour(ot.end_datetime) : '--',
      ot ? ot.total_hours : '--',
      scope
    ];

    const isEven = dayCounter % 2 === 1; // Logic for striped rows
    for (let i = 1; i <= 9; i++) {
      const cell = row.getCell(i);
      cell.font = { name: FONT_FAMILY, size: 9, color: { argb: (isSunday && !ot) ? COLOR_MUTED : COLOR_TEXT } };
      cell.alignment = { vertical: 'middle', horizontal: i === 9 ? 'left' : 'center', wrapText: true };
      if (isSunday && !ot) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
      else if (isEven) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_BG_ALT } };
      cell.border = { bottom: { style: 'hair', color: { argb: 'FFE5E7EB' } } };
    }

    if (ot && ot.reason) {
      currentRow++;
      sheet.mergeCells(`F${currentRow}:I${currentRow}`);
      const reasonRow = sheet.getRow(currentRow);
      const reasonCell = reasonRow.getCell(6); 
      reasonCell.value = `↳ OT Reason: ${ot.reason}`;
      reasonCell.font = { italic: true, size: 8.5, color: { argb: 'FF4B5563' }, name: FONT_FAMILY };
      reasonCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 2 };

      for (let i = 1; i <= 9; i++) {
        const c = reasonRow.getCell(i);
        if (isSunday) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
        else if (isEven) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_BG_ALT } };
        c.border = { bottom: { style: 'hair', color: { argb: 'FFE5E7EB' } } };
      }
    }

    currentRow++;
    dayCounter++; // Increment purely by date
    curr.setDate(curr.getDate() + 1);
  }

  currentRow += 2; 
  sheet.mergeCells(`A${currentRow}:I${currentRow}`);
  const cert = sheet.getCell(`A${currentRow}`);
  cert.value = 'I hereby certify that the above records are true and correct reflections of my hours worked.';
  cert.font = { italic: true, size: 9, color: { argb: COLOR_MUTED }, name: FONT_FAMILY };
  cert.alignment = { horizontal: 'center' };

  currentRow += 3; 
  sheet.mergeCells(`A${currentRow}:D${currentRow}`);
  sheet.mergeCells(`F${currentRow}:I${currentRow}`);
  sheet.getCell(`A${currentRow}`).border = { bottom: { style: 'medium', color: { argb: COLOR_ACCENT} } };
  sheet.getCell(`F${currentRow}`).border = { bottom: { style: 'medium', color: { argb: COLOR_ACCENT} } };
  
  currentRow += 1;
  const sigL = sheet.getCell(`A${currentRow}`); sigL.value = 'Employee Signature';
  sigL.alignment = { horizontal: 'center' }; sigL.font = { bold: true, size: 9, color: { argb: COLOR_ACCENT } };
  
  const sigR = sheet.getCell(`F${currentRow}`); sigR.value = 'Verified By (Manager / HR)';
  sigR.alignment = { horizontal: 'center' }; sigR.font = { bold: true, size: 9, color: { argb: COLOR_ACCENT } };

  const buffer = await workbook.xlsx.writeBuffer();
  const cleanName = (employee?.fullname || 'Employee').replace(/\s+/g, '_');
  saveAs(new Blob([buffer]), `DTR_${cleanName}_${formatFileNameDate(startDate)}.xlsx`);
};