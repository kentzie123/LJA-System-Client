import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// --- HELPER 1: Convert military time (17:00) to 12-hour AM/PM (05:00 PM) ---
const format12Hour = (timeString) => {
  if (!timeString || timeString === '--:--') return '--:--';
  const [hoursString, minutes] = timeString.split(':');
  let hours = parseInt(hoursString, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; 
  return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

// --- HELPER 2: Convert YYYY-MM-DD to "Feb 27, 2026" (Timezone Safe) ---
const formatFriendlyDate = (dateString) => {
  if (!dateString) return 'N/A';
  // Append T00:00:00 if it's a raw date to prevent it from shifting back a day!
  const safeDate = dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
  return new Date(safeDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

// --- HELPER 3: Format Date for File Name ---
const formatFileNameDate = (dateString) => {
  if (!dateString) return '';
  const safeDate = dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
  const d = new Date(safeDate);
  const month = d.toLocaleString('en-US', { month: 'short' });
  const day = d.getDate().toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${month}_${day}_${year}`;
};

// --- HELPER 4: THE FIX - Ensure database dates are matched in LOCAL time ---
const getLocalYYYYMMDD = (dateInput) => {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


export const downloadDTRExcel = async (employee, attendanceRecords, leaveRecords, overtimeRecords, startDate, endDate) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('DTR');

  // MODERN SETTINGS
  const FONT_FAMILY = 'Segoe UI';
  const COLOR_PRIMARY = 'FF1E293B'; 
  const COLOR_MUTED = 'FF64748B'; 

  // 1. Define Columns 
  sheet.columns = [
    { key: 'A', width: 15 }, // Date
    { key: 'B', width: 10 }, // Day
    { key: 'C', width: 14 }, // Time In
    { key: 'D', width: 14 }, // Time Out
    { key: 'E', width: 14 }, // OT Hours
    { key: 'F', width: 45 }, // Scope of Work / Remarks
  ];

  // 2. --- HEADER SECTION ---
  sheet.mergeCells('A1:F1');
  const title1 = sheet.getCell('A1');
  title1.value = 'LJA POWER LIMITED CO.';
  title1.font = { bold: true, size: 16, name: FONT_FAMILY, color: { argb: COLOR_PRIMARY } };
  title1.alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('A2:F2');
  const title2 = sheet.getCell('A2');
  title2.value = 'DAILY TIME RECORD (DTR)';
  title2.font = { bold: true, size: 10, color: { argb: 'FF94A3B8' }, name: FONT_FAMILY };
  title2.alignment = { horizontal: 'center', vertical: 'middle' };

  // 3. --- EMPLOYEE INFO ---
  const labelFont = { bold: true, color: { argb: COLOR_MUTED }, size: 9.5, name: FONT_FAMILY };
  const valFont = { bold: true, size: 10, color: { argb: COLOR_PRIMARY }, name: FONT_FAMILY };

  sheet.getCell('A4').value = 'Employee:';
  sheet.getCell('A4').font = labelFont;
  sheet.mergeCells('B4:C4'); 
  sheet.getCell('B4').value = employee?.fullname || 'N/A';
  sheet.getCell('B4').font = valFont;

  sheet.getCell('D4').value = 'Period:';
  sheet.getCell('D4').font = labelFont;
  sheet.mergeCells('E4:F4'); 
  sheet.getCell('E4').value = `${formatFriendlyDate(startDate)} - ${formatFriendlyDate(endDate)}`;
  sheet.getCell('E4').font = valFont;

  sheet.getCell('A5').value = 'Position:';
  sheet.getCell('A5').font = labelFont;
  sheet.mergeCells('B5:C5'); 
  sheet.getCell('B5').value = employee?.position || 'Staff';
  sheet.getCell('B5').font = valFont;

  sheet.getCell('D5').value = 'ID:';
  sheet.getCell('D5').font = labelFont;
  sheet.mergeCells('E5:F5'); 
  sheet.getCell('E5').value = employee?.employee_id || 'N/A';
  sheet.getCell('E5').font = valFont;


  // 4. --- MODERN TABLE HEADER (Row 7) ---
  const headerRow = sheet.getRow(7);
  headerRow.values = ['Date', 'Day', 'Time In', 'Time Out', 'OT Hours', 'Scope of Work / Remarks'];
  headerRow.height = 25; 
  
  for (let i = 1; i <= 6; i++) {
    const cell = headerRow.getCell(i);
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: FONT_FAMILY, size: 9.5 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = { top: { style: 'thin', color: { argb: COLOR_PRIMARY } }, bottom: { style: 'thin', color: { argb: COLOR_PRIMARY } } };
  }

  // 5. --- GENERATE ALL DATES (Timezone Safe Loop) ---
  // Adding T00:00:00 ensures JS builds the loop based on local timezone midnight, not UTC
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  let curr = new Date(start);
  let currentRow = 8; 

  while (curr <= end) {
    const dateStr = getLocalYYYYMMDD(curr); // Guaranteed Local "YYYY-MM-DD"
    const dayName = curr.toLocaleDateString('en-US', { weekday: 'short' });
    const isSunday = dayName === 'Sun'; 

    // Find Data using the Timezone Safe matcher
    const att = attendanceRecords.find(r => getLocalYYYYMMDD(r.date) === dateStr);
    
    const leave = leaveRecords.find(l => {
      if (l.status !== 'Approved') return false;
      const lStart = new Date(l.start_date + (l.start_date.includes('T') ? '' : 'T00:00:00'));
      const lEnd = new Date(l.end_date + (l.end_date.includes('T') ? '' : 'T23:59:59'));
      return curr >= lStart && curr <= lEnd;
    });

    const ot = overtimeRecords.find(o => {
      const recordDate = o.ot_date || o.date || o.date_requested;
      return getLocalYYYYMMDD(recordDate) === dateStr && o.status === 'Approved';
    });

    // Build Row Logic
    let timeIn = att ? format12Hour(att.time_in) : '--:--';
    let timeOut = att ? format12Hour(att.time_out) : '--:--';
    let otHours = ot ? `${ot.total_hours || ot.hours || ''} hrs` : '';
    let scope = att?.work_summary || '';

    if (leave) {
      scope = `ON LEAVE: ${leave.leave_type_name || leave.leave_type || 'Approved Leave'}`;
      if (!att) { timeIn = 'LEAVE'; timeOut = 'LEAVE'; }
    } else if (!att && isSunday) {
      scope = 'WEEKEND'; 
    }

    const row = sheet.getRow(currentRow);
    // Use formatFriendlyDate safely
    row.values = [formatFriendlyDate(dateStr), dayName, timeIn, timeOut, otHours, scope];
    row.height = 20; 
    
    const isEven = currentRow % 2 === 0;
    
    for (let i = 1; i <= 6; i++) {
      const cell = row.getCell(i);
      const cellColor = isSunday ? COLOR_MUTED : 'FF334155';
      
      cell.font = { name: FONT_FAMILY, size: 9.5, color: { argb: cellColor } };
      cell.alignment = { vertical: 'middle', horizontal: i === 6 ? 'left' : 'center', wrapText: true };
      
      if (isSunday) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
      } else if (isEven) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      }
      
      cell.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
    }

    currentRow++;
    curr.setDate(curr.getDate() + 1);
  }

  // 6. --- FOOTER SIGNATURES ---
  currentRow += 2; 
  
  sheet.mergeCells(`A${currentRow}:F${currentRow}`);
  const certCell = sheet.getCell(`A${currentRow}`);
  certCell.value = 'I hereby certify that the above records are true and correct reflections of my hours worked.';
  certCell.font = { italic: true, size: 9, color: { argb: COLOR_MUTED }, name: FONT_FAMILY };
  certCell.alignment = { horizontal: 'center' };

  currentRow += 3; 

  sheet.mergeCells(`A${currentRow}:C${currentRow}`);
  sheet.mergeCells(`E${currentRow}:F${currentRow}`);
  
  sheet.getCell(`A${currentRow}`).border = { bottom: { style: 'medium', color: { argb: COLOR_PRIMARY} } };
  sheet.getCell(`E${currentRow}`).border = { bottom: { style: 'medium', color: { argb: COLOR_PRIMARY} } };
  
  currentRow += 1;
  
  sheet.mergeCells(`A${currentRow}:C${currentRow}`);
  sheet.mergeCells(`E${currentRow}:F${currentRow}`);
  
  const sigTextLeft = sheet.getCell(`A${currentRow}`);
  sigTextLeft.value = 'Employee Signature';
  sigTextLeft.alignment = { horizontal: 'center' };
  sigTextLeft.font = { bold: true, size: 9.5, color: { argb: COLOR_PRIMARY }, name: FONT_FAMILY };
  
  const sigTextRight = sheet.getCell(`E${currentRow}`);
  sigTextRight.value = 'Verified By (Manager / HR)';
  sigTextRight.alignment = { horizontal: 'center' };
  sigTextRight.font = { bold: true, size: 9.5, color: { argb: COLOR_PRIMARY }, name: FONT_FAMILY };

  // 7. --- TRIGGER DOWNLOAD ---
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  const cleanName = (employee?.fullname || 'Employee').replace(/\s+/g, '_');
  const fileStart = formatFileNameDate(startDate);
  const fileEnd = formatFileNameDate(endDate);
  
  const fileName = `DTR_${cleanName}_${fileStart}_to_${fileEnd}.xlsx`;
  
  saveAs(blob, fileName);
};