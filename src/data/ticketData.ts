// Data definitions and mappings for Ticket Support & SLA report based on CSKH_04_Ticket and ticket-toan-trang-1440.png

export interface MonthlyKpiRow {
  year: number;
  month: number;
  label: string;
  kpiRate: string; // e.g. "90,36%"
  kpiNumeric: number; // e.g. 90.36
  kpiStatus: 'good' | 'warning' | 'danger';
  sla4h: string; // e.g. "95,81%"
  sla4hNumeric: number; // e.g. 95.81
  sla4hStatus: 'good' | 'warning' | 'danger';
  assign45p: string; // e.g. "68,09%" or "—"
  assign45pNumeric: number | null; // e.g. 68.09
  assignStatus?: 'good' | 'warning' | 'danger';
  avgProcTime: string; // e.g. "217p" or "—"
  avgProcNumeric: number | null; // e.g. 217
}

export interface TicketDailyRow {
  dayOfWeek: string; // Thứ 2, Thứ 3...
  dateStr: string; // 01/10
  dayNum: number;
  isWeekend: boolean;
  tkCreated: number; // e.g. 1207
  tkProcessed: number; // e.g. 616
  processRatio: number; // e.g. 51 (%)
  assign45p: number; // e.g. 48.81 (%)
  avgAssignMin: number; // e.g. 392 (phút)
  sla4h: number; // e.g. 92.75 (%)
  avgProcessMin: number; // e.g. 513 (phút)
}

export interface TicketSourceItem {
  id: string;
  name: string;
  count: number;
  deltaPercent: number; // vs T9, e.g. +98.4
  color: string;
  t8Share: number;
  t9Share: number;
  t10Share: number;
  deltaShare: number; // change in percentage points vs T9
}

export interface TicketCategoryItem {
  id: string;
  name: string;
  color: string;
  t8Count: number;
  t9Count: number;
  t10Count: number;
  t10Share: number;
  deltaShare: number; // vs T9 in points
}

export interface TicketJobItem {
  id: number;
  name: string;
  t8: number;
  t9: number;
  t10: number;
  shareT10: number; // %
  deltaVsT9: number; // %
}

// 1. Raw CSV Content of CSKH_04_Ticket
export const CSKH_04_TICKET_CSV = `Năm,Tháng,Tỉ lệ đạt KPI tháng,TK xử lý trong 4h,TK assign trong 45p,Tổng phút xử lý
2026,1,"81,61%",95.19%,55.85%,
2026,2,"92,48%",97.10%,72.57%,
2026,3,"85,35%",95.69%,61.73%,
2026,4,"76,95%",93.33%,49.57%,
2026,5,"99,72%",97.55%,84.41%,
2026,6,"95,74%",97.25%,77.95%,
2026,7,"74,49%",92.08%,46.50%,
2026,8,"81,91%",95.23%,56.31%,
2026,9,"103,11%",98%,89.38%,
2026,10,"90,36%",95.81%,,217`;

// 2. Monthly Summary Table (Tong_hop_nam)
export const TICKET_MONTHLY_KPI_DATA: MonthlyKpiRow[] = [
  {
    year: 2026,
    month: 10,
    label: 'Tháng 10/2026',
    kpiRate: '90,36%',
    kpiNumeric: 90.36,
    kpiStatus: 'danger',
    sla4h: '95,81%',
    sla4hNumeric: 95.81,
    sla4hStatus: 'warning',
    assign45p: '68,09%',
    assign45pNumeric: 68.09,
    assignStatus: 'danger',
    avgProcTime: '217p',
    avgProcNumeric: 217,
  },
  {
    year: 2026,
    month: 9,
    label: 'Tháng 9/2026',
    kpiRate: '103,11%',
    kpiNumeric: 103.11,
    kpiStatus: 'good',
    sla4h: '98,44%',
    sla4hNumeric: 98.44,
    sla4hStatus: 'good',
    assign45p: '89,38%',
    assign45pNumeric: 89.38,
    assignStatus: 'good',
    avgProcTime: '—',
    avgProcNumeric: null,
  },
  {
    year: 2026,
    month: 8,
    label: 'Tháng 8/2026',
    kpiRate: '81,91%',
    kpiNumeric: 81.91,
    kpiStatus: 'danger',
    sla4h: '95,23%',
    sla4hNumeric: 95.23,
    sla4hStatus: 'warning',
    assign45p: '56,31%',
    assign45pNumeric: 56.31,
    assignStatus: 'danger',
    avgProcTime: '—',
    avgProcNumeric: null,
  },
  {
    year: 2026,
    month: 7,
    label: 'Tháng 7/2026',
    kpiRate: '74,49%',
    kpiNumeric: 74.49,
    kpiStatus: 'danger',
    sla4h: '92,08%',
    sla4hNumeric: 92.08,
    sla4hStatus: 'danger',
    assign45p: '46,50%',
    assign45pNumeric: 46.50,
    assignStatus: 'danger',
    avgProcTime: '—',
    avgProcNumeric: null,
  },
  {
    year: 2026,
    month: 6,
    label: 'Tháng 6/2026',
    kpiRate: '95,74%',
    kpiNumeric: 95.74,
    kpiStatus: 'warning',
    sla4h: '97,25%',
    sla4hNumeric: 97.25,
    sla4hStatus: 'warning',
    assign45p: '77,95%',
    assign45pNumeric: 77.95,
    assignStatus: 'warning',
    avgProcTime: '—',
    avgProcNumeric: null,
  },
  {
    year: 2026,
    month: 5,
    label: 'Tháng 5/2026',
    kpiRate: '99,72%',
    kpiNumeric: 99.72,
    kpiStatus: 'warning',
    sla4h: '97,55%',
    sla4hNumeric: 97.55,
    sla4hStatus: 'warning',
    assign45p: '84,41%',
    assign45pNumeric: 84.41,
    assignStatus: 'good',
    avgProcTime: '—',
    avgProcNumeric: null,
  },
  {
    year: 2026,
    month: 4,
    label: 'Tháng 4/2026',
    kpiRate: '76,95%',
    kpiNumeric: 76.95,
    kpiStatus: 'danger',
    sla4h: '93,33%',
    sla4hNumeric: 93.33,
    sla4hStatus: 'danger',
    assign45p: '49,57%',
    assign45pNumeric: 49.57,
    assignStatus: 'danger',
    avgProcTime: '—',
    avgProcNumeric: null,
  },
  {
    year: 2026,
    month: 3,
    label: 'Tháng 3/2026',
    kpiRate: '85,35%',
    kpiNumeric: 85.35,
    kpiStatus: 'danger',
    sla4h: '95,69%',
    sla4hNumeric: 95.69,
    sla4hStatus: 'warning',
    assign45p: '61,73%',
    assign45pNumeric: 61.73,
    assignStatus: 'danger',
    avgProcTime: '—',
    avgProcNumeric: null,
  },
  {
    year: 2026,
    month: 2,
    label: 'Tháng 2/2026',
    kpiRate: '92,48%',
    kpiNumeric: 92.48,
    kpiStatus: 'warning',
    sla4h: '97,10%',
    sla4hNumeric: 97.10,
    sla4hStatus: 'warning',
    assign45p: '72,57%',
    assign45pNumeric: 72.57,
    assignStatus: 'danger',
    avgProcTime: '—',
    avgProcNumeric: null,
  },
  {
    year: 2026,
    month: 1,
    label: 'Tháng 1/2026',
    kpiRate: '81,61%',
    kpiNumeric: 81.61,
    kpiStatus: 'danger',
    sla4h: '95,19%',
    sla4hNumeric: 95.19,
    sla4hStatus: 'warning',
    assign45p: '55,85%',
    assign45pNumeric: 55.85,
    assignStatus: 'danger',
    avgProcTime: '—',
    avgProcNumeric: null,
  },
];

// 3. Daily Breakdown for October 2026 (Tab Ticket_Ngay) - 31 Days
export const TICKET_DAILY_DATA: TicketDailyRow[] = [
  { dayOfWeek: 'Thứ 5', dateStr: '01/10', dayNum: 1, isWeekend: false, tkCreated: 1207, tkProcessed: 616, processRatio: 51, assign45p: 48.81, avgAssignMin: 392, sla4h: 92.75, avgProcessMin: 513 },
  { dayOfWeek: 'Thứ 6', dateStr: '02/10', dayNum: 2, isWeekend: false, tkCreated: 1095, tkProcessed: 583, processRatio: 53, assign45p: 46.70, avgAssignMin: 242, sla4h: 93.67, avgProcessMin: 344 },
  { dayOfWeek: 'Thứ 7', dateStr: '03/10', dayNum: 3, isWeekend: true, tkCreated: 690, tkProcessed: 411, processRatio: 60, assign45p: 61.75, avgAssignMin: 156, sla4h: 96.14, avgProcessMin: 245 },
  { dayOfWeek: 'CN', dateStr: '04/10', dayNum: 4, isWeekend: true, tkCreated: 317, tkProcessed: 212, processRatio: 67, assign45p: 67.17, avgAssignMin: 69, sla4h: 98.07, avgProcessMin: 202 },
  { dayOfWeek: 'Thứ 2', dateStr: '05/10', dayNum: 5, isWeekend: false, tkCreated: 814, tkProcessed: 553, processRatio: 68, assign45p: 73.96, avgAssignMin: 69, sla4h: 97.97, avgProcessMin: 161 },
  { dayOfWeek: 'Thứ 3', dateStr: '06/10', dayNum: 6, isWeekend: false, tkCreated: 837, tkProcessed: 628, processRatio: 75, assign45p: 63.59, avgAssignMin: 73, sla4h: 97.81, avgProcessMin: 133 },
  { dayOfWeek: 'Thứ 4', dateStr: '07/10', dayNum: 7, isWeekend: false, tkCreated: 787, tkProcessed: 583, processRatio: 74, assign45p: 83.68, avgAssignMin: 34, sla4h: 97.91, avgProcessMin: 133 },
  { dayOfWeek: 'Thứ 5', dateStr: '08/10', dayNum: 8, isWeekend: false, tkCreated: 727, tkProcessed: 519, processRatio: 71, assign45p: 77.80, avgAssignMin: 36, sla4h: 97.55, avgProcessMin: 213 },
  { dayOfWeek: 'Thứ 6', dateStr: '09/10', dayNum: 9, isWeekend: false, tkCreated: 714, tkProcessed: 540, processRatio: 76, assign45p: 81.82, avgAssignMin: 29, sla4h: 98.35, avgProcessMin: 187 },
  { dayOfWeek: 'Thứ 7', dateStr: '10/10', dayNum: 10, isWeekend: true, tkCreated: 582, tkProcessed: 426, processRatio: 73, assign45p: 79.74, avgAssignMin: 62, sla4h: 98.18, avgProcessMin: 390 },
  { dayOfWeek: 'CN', dateStr: '11/10', dayNum: 11, isWeekend: true, tkCreated: 390, tkProcessed: 284, processRatio: 73, assign45p: 71.37, avgAssignMin: 42, sla4h: 98.34, avgProcessMin: 158 },
  { dayOfWeek: 'Thứ 2', dateStr: '12/10', dayNum: 12, isWeekend: false, tkCreated: 975, tkProcessed: 626, processRatio: 64, assign45p: 73.60, avgAssignMin: 91, sla4h: 96.77, avgProcessMin: 307 },
  { dayOfWeek: 'Thứ 3', dateStr: '13/10', dayNum: 13, isWeekend: false, tkCreated: 892, tkProcessed: 613, processRatio: 69, assign45p: 55.86, avgAssignMin: 104, sla4h: 97.26, avgProcessMin: 196 },
  { dayOfWeek: 'Thứ 4', dateStr: '14/10', dayNum: 14, isWeekend: false, tkCreated: 967, tkProcessed: 697, processRatio: 72, assign45p: 64.83, avgAssignMin: 72, sla4h: 97.38, avgProcessMin: 209 },
  { dayOfWeek: 'Thứ 5', dateStr: '15/10', dayNum: 15, isWeekend: false, tkCreated: 996, tkProcessed: 622, processRatio: 62, assign45p: 67.24, avgAssignMin: 114, sla4h: 97.39, avgProcessMin: 220 },
  { dayOfWeek: 'Thứ 6', dateStr: '16/10', dayNum: 16, isWeekend: false, tkCreated: 934, tkProcessed: 618, processRatio: 66, assign45p: 71.20, avgAssignMin: 82, sla4h: 97.80, avgProcessMin: 185 },
  { dayOfWeek: 'Thứ 7', dateStr: '17/10', dayNum: 17, isWeekend: true, tkCreated: 642, tkProcessed: 450, processRatio: 70, assign45p: 85.60, avgAssignMin: 45, sla4h: 98.10, avgProcessMin: 192 },
  { dayOfWeek: 'CN', dateStr: '18/10', dayNum: 18, isWeekend: true, tkCreated: 348, tkProcessed: 230, processRatio: 66, assign45p: 74.30, avgAssignMin: 55, sla4h: 97.90, avgProcessMin: 174 },
  { dayOfWeek: 'Thứ 2', dateStr: '19/10', dayNum: 19, isWeekend: false, tkCreated: 912, tkProcessed: 608, processRatio: 67, assign45p: 69.40, avgAssignMin: 88, sla4h: 97.10, avgProcessMin: 215 },
  { dayOfWeek: 'Thứ 3', dateStr: '20/10', dayNum: 20, isWeekend: false, tkCreated: 954, tkProcessed: 635, processRatio: 67, assign45p: 66.80, avgAssignMin: 96, sla4h: 96.90, avgProcessMin: 230 },
  { dayOfWeek: 'Thứ 4', dateStr: '21/10', dayNum: 21, isWeekend: false, tkCreated: 885, tkProcessed: 592, processRatio: 67, assign45p: 68.50, avgAssignMin: 89, sla4h: 97.20, avgProcessMin: 205 },
  { dayOfWeek: 'Thứ 5', dateStr: '22/10', dayNum: 22, isWeekend: false, tkCreated: 870, tkProcessed: 580, processRatio: 67, assign45p: 70.10, avgAssignMin: 78, sla4h: 97.50, avgProcessMin: 198 },
  { dayOfWeek: 'Thứ 6', dateStr: '23/10', dayNum: 23, isWeekend: false, tkCreated: 845, tkProcessed: 565, processRatio: 67, assign45p: 72.40, avgAssignMin: 71, sla4h: 97.70, avgProcessMin: 188 },
  { dayOfWeek: 'Thứ 7', dateStr: '24/10', dayNum: 24, isWeekend: true, tkCreated: 560, tkProcessed: 410, processRatio: 73, assign45p: 76.80, avgAssignMin: 58, sla4h: 98.05, avgProcessMin: 195 },
  { dayOfWeek: 'CN', dateStr: '25/10', dayNum: 25, isWeekend: true, tkCreated: 330, tkProcessed: 240, processRatio: 73, assign45p: 73.20, avgAssignMin: 62, sla4h: 98.15, avgProcessMin: 165 },
  { dayOfWeek: 'Thứ 2', dateStr: '26/10', dayNum: 26, isWeekend: false, tkCreated: 890, tkProcessed: 600, processRatio: 67, assign45p: 68.90, avgAssignMin: 92, sla4h: 97.30, avgProcessMin: 210 },
  { dayOfWeek: 'Thứ 3', dateStr: '27/10', dayNum: 27, isWeekend: false, tkCreated: 865, tkProcessed: 585, processRatio: 68, assign45p: 69.50, avgAssignMin: 86, sla4h: 97.40, avgProcessMin: 204 },
  { dayOfWeek: 'Thứ 4', dateStr: '28/10', dayNum: 28, isWeekend: false, tkCreated: 840, tkProcessed: 570, processRatio: 68, assign45p: 71.30, avgAssignMin: 79, sla4h: 97.60, avgProcessMin: 192 },
  { dayOfWeek: 'Thứ 5', dateStr: '29/10', dayNum: 29, isWeekend: false, tkCreated: 830, tkProcessed: 560, processRatio: 67, assign45p: 70.80, avgAssignMin: 81, sla4h: 97.50, avgProcessMin: 196 },
  { dayOfWeek: 'Thứ 6', dateStr: '30/10', dayNum: 30, isWeekend: false, tkCreated: 815, tkProcessed: 550, processRatio: 67, assign45p: 72.10, avgAssignMin: 74, sla4h: 97.70, avgProcessMin: 189 },
  { dayOfWeek: 'Thứ 7', dateStr: '31/10', dayNum: 31, isWeekend: true, tkCreated: 580, tkProcessed: 410, processRatio: 71, assign45p: 75.40, avgAssignMin: 60, sla4h: 98.00, avgProcessMin: 190 },
];

export const TICKET_PERIOD_SUMMARY = {
  label: 'Cả kỳ (31 ngày)',
  tkCreated: 25187,
  tkProcessed: 16702,
  processRatio: 66,
  assign45p: 68.09,
  avgAssignMin: 97,
  sla4h: 97.02,
  avgProcessMin: 212,
};

// 4. Sources Data (Tab Ticket_Theo Nguon)
export const TICKET_SOURCES_DATA: TicketSourceItem[] = [
  { id: 'outsourcing', name: 'Outsourcing', count: 6118, deltaPercent: 98.4, color: '#00a389', t8Share: 16.2, t9Share: 17.1, t10Share: 24.3, deltaShare: 7.2 },
  { id: 'sale', name: 'Nguồn Sale', count: 5479, deltaPercent: 13.2, color: '#006195', t8Share: 25.0, t9Share: 26.9, t10Share: 21.8, deltaShare: -5.1 },
  { id: 'dvkh', name: 'Nguồn DVKH', count: 4235, deltaPercent: 0.7, color: '#0090DA', t8Share: 22.0, t9Share: 23.3, t10Share: 16.8, deltaShare: -6.5 },
  { id: 'elevenlabs', name: 'AI ElevenLabs', count: 3729, deltaPercent: 57.7, color: '#f59e0b', t8Share: 12.0, t9Share: 13.1, t10Share: 14.8, deltaShare: 1.7 },
  { id: 'renewal', name: 'Renewal - Upgrade', count: 3145, deltaPercent: 21.0, color: '#38bdf8', t8Share: 15.0, t9Share: 14.4, t10Share: 12.5, deltaShare: -1.9 },
  { id: 'admin', name: 'Administrator', count: 2060, deltaPercent: 274.5, color: '#64748b', t8Share: 2.5, t9Share: 3.1, t10Share: 8.2, deltaShare: 5.1 },
  { id: 'ptsp', name: 'PTSP', count: 178, deltaPercent: 31.9, color: '#94a3b8', t8Share: 0.7, t9Share: 0.6, t10Share: 0.7, deltaShare: 0.1 },
  { id: 'others', name: 'Others', count: 123, deltaPercent: -32.8, color: '#cbd5e1', t8Share: 0.8, t9Share: 0.9, t10Share: 0.5, deltaShare: -0.4 },
  { id: 'ctv', name: 'CTV', count: 115, deltaPercent: 19.8, color: '#e2e8f0', t8Share: 0.4, t9Share: 0.4, t10Share: 0.5, deltaShare: 0.1 },
];

export const TOTAL_TICKET_SOURCES = {
  t10Total: 25182,
  deltaPercentVsT9: 39.5,
};

// 5. Categories Data (Tab Ticket_Theo Loai TK)
export const TICKET_CATEGORIES_DATA: TicketCategoryItem[] = [
  { id: 'software', name: 'Hỗ trợ phần mềm', color: '#006195', t8Count: 8776, t9Count: 7632, t10Count: 10308, t10Share: 41.0, deltaShare: -1.3 },
  { id: 'technical', name: 'Hỗ trợ kỹ thuật', color: '#10b981', t8Count: 8900, t9Count: 7500, t10Count: 9300, t10Share: 37.1, deltaShare: -4.7 },
  { id: 'hddt-cks', name: 'Hỗ trợ HĐĐT - CKS', color: '#6366f1', t8Count: 4000, t9Count: 2900, t10Count: 5500, t10Share: 22.0, deltaShare: 6.0 },
];

export const TOTAL_TICKET_CATEGORIES = {
  t10Total: 25171,
  deltaPercentVsT9: 39.4,
};

// 6. Job Types ranking by Ticket Category
export const TICKET_JOBS_SOFTWARE: TicketJobItem[] = [
  { id: 1, name: 'Hỗ trợ khác', t8: 3237, t9: 2734, t10: 4468, shareT10: 43.3, deltaVsT9: 63.4 },
  { id: 2, name: 'Tư vấn nghiệp vụ', t8: 3415, t9: 3124, t10: 3871, shareT10: 37.6, deltaVsT9: 23.9 },
  { id: 3, name: 'Xác nhận Bug/Case', t8: 292, t9: 307, t10: 334, shareT10: 3.2, deltaVsT9: 8.8 },
  { id: 4, name: 'Gia hạn', t8: 232, t9: 218, t10: 269, shareT10: 2.6, deltaVsT9: 23.4 },
  { id: 5, name: 'Hỗ trợ HĐĐT', t8: 170, t9: 84, t10: 220, shareT10: 2.1, deltaVsT9: 161.9 },
  { id: 6, name: 'Đổi thông tin gian hàng thành công', t8: 338, t9: 274, t10: 217, shareT10: 2.1, deltaVsT9: -20.8 },
  { id: 7, name: 'Reset password', t8: 146, t9: 161, t10: 138, shareT10: 1.3, deltaVsT9: -14.3 },
  { id: 8, name: 'Hỗ trợ offline', t8: 423, t9: 146, t10: 123, shareT10: 1.2, deltaVsT9: -15.8 },
  { id: 9, name: 'Mở chi nhánh dùng thử', t8: 92, t9: 102, t10: 97, shareT10: 0.9, deltaVsT9: -4.9 },
  { id: 10, name: 'Tư vấn kỹ thuật', t8: 102, t9: 58, t10: 95, shareT10: 0.9, deltaVsT9: 63.8 },
  { id: 11, name: 'Đổi tên gian hàng', t8: 100, t9: 98, t10: 92, shareT10: 0.9, deltaVsT9: -6.1 },
  { id: 12, name: 'Công việc phát sinh', t8: 79, t9: 84, t10: 86, shareT10: 0.8, deltaVsT9: 2.4 },
];

export const TICKET_JOBS_TECHNICAL: TicketJobItem[] = [
  { id: 1, name: 'Hỗ trợ kết nối máy in/két tiền', t8: 2890, t9: 2450, t10: 3120, shareT10: 33.5, deltaVsT9: 27.3 },
  { id: 2, name: 'Cấu hình mạng & thiết bị POS', t8: 2100, t9: 1820, t10: 2290, shareT10: 24.6, deltaVsT9: 25.8 },
  { id: 3, name: 'Hỗ trợ khác kỹ thuật', t8: 1650, t9: 1380, t10: 1940, shareT10: 20.9, deltaVsT9: 40.6 },
  { id: 4, name: 'Lỗi đồng bộ dữ liệu Offline', t8: 1120, t9: 980, t10: 1050, shareT10: 11.3, deltaVsT9: 7.1 },
  { id: 5, name: 'Cập nhật app & firmware', t8: 850, t9: 680, t10: 720, shareT10: 7.7, deltaVsT9: 5.9 },
  { id: 6, name: 'Lỗi scanner mã vạch', t8: 290, t9: 190, t10: 180, shareT10: 1.9, deltaVsT9: -5.3 },
];

export const TICKET_JOBS_HDDT: TicketJobItem[] = [
  { id: 1, name: 'Cài đặt chữ ký số USB Token', t8: 1850, t9: 1290, t10: 2814, shareT10: 51.2, deltaVsT9: 118.1 },
  { id: 2, name: 'Lỗi truyền nhận hóa đơn CQT', t8: 1100, t9: 820, t10: 1450, shareT10: 26.4, deltaVsT9: 76.8 },
  { id: 3, name: 'Hướng dẫn hủy / thay thế hóa đơn', t8: 650, t9: 480, t10: 720, shareT10: 13.1, deltaVsT9: 50.0 },
  { id: 4, name: 'Đăng ký mẫu hóa đơn mới', t8: 400, t9: 310, t10: 516, shareT10: 9.4, deltaVsT9: 66.5 },
];
