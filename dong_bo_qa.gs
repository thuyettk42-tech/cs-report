/**
 * =====================================================================
 *  ĐỒNG BỘ ĐIỂM CHẤT LƯỢNG QA  →  SUPABASE
 * =====================================================================
 *  Đọc thẳng sheet "Form Responses 2" của file "QC Call Center (Responses)"
 *  (QA chấm qua Google Form), chỉ lấy kênh Call, tính điểm từng cuộc theo
 *  đúng công thức sheet "Data Check Call", cộng theo ngày chấm + máy ĐTV
 *  rồi ghi vào bảng call_qa_daily. Không ghi ticket / nội dung cuộc gọi.
 *
 *  File này nằm CÙNG dự án Apps Script "Đồng bộ 3CX Supabase".
 *
 *  CÁC HÀM BẠN SẼ BẤM CHẠY:
 *    1. kiemTraQA    – tính thử điểm TB từng tháng, chỉ hiện kết quả, KHÔNG ghi gì
 *    2. dongBoQA     – đọc toàn bộ sheet và ghi vào Supabase (chạy lại không trùng)
 *    3. caiLichQA    – cài lịch tự động mỗi sáng khoảng 10h
 * =====================================================================
 */

const QA = {
  FILE_ID: '1_y3S_8XmvBBbCjcZhhvnZhHbcv98IvVH7KOKF4Gt06g',
  SHEET: 'Form Responses 2',
  KENH: 'call',                // chỉ lấy dòng "Kênh hỗ trợ" = Call
  GIO_CHAY: 10,
  PHUT_CHAY: 30,               // Google lệch ±15 phút → khoảng 10h15–10h45
  NGUON: 'QA (Form Responses 2)',
};

// Lỗi mỗi tiêu chí: số lỗi = số mục cách nhau bởi dấu phẩy; điểm trừ mỗi lỗi theo "Data Check Call" cột AN
const QA_TIEU_CHI = [
  { ten: 'chao hoi', tru: 2 },
  { ten: 'xung ho', tru: 2 },
  { ten: 'ngu dieu, giong noi', tru: 2 },
  { ten: 'lang nghe, tich cuc giao tiep', tru: 2 },
  { ten: 'thai do 1', tru: 10 },
  { ten: 'thai do 2', tru: 20 },
  { ten: 'diem liet thai do', tru: 100 },
  { ten: 'ngon tu, dien dat', tru: 2 },
  { ten: 'khai thac va xu ly thong tin', tru: 5 },
  { ten: 'ghi nhan thong tin, du lieu', tru: 5 },
  { ten: 'dua ra phuong an giai quyet', tru: 100 },
  { ten: 'loi khac', tru: 5 },
];
const QA_COT = {
  time: 'timestamp',
  ext: 'line agent',
  kenh: 'kenh ho tro',
  chatLuong: 'chat luong call',
  giaiQuyet: 'da giai quyet van de',
  trung: 'co phat sinh call trung van de',
  thuong: 'diem thuong',            // mỗi mục khen +10 điểm
};

// =====================================================================
// 1. CÁC HÀM BẤM CHẠY
// =====================================================================

function kiemTraQA() {
  const kq = docQA_();
  Logger.log('Đọc ' + kq.tong + ' dòng; lấy ' + kq.call + ' cuộc kênh Call' +
    (kq.boQua ? ', bỏ qua ' + kq.boQua + ' dòng thiếu ngày / máy ĐTV' : '') + '.');
  const thang = {};
  Object.keys(kq.dong).forEach(k => {
    const r = kq.dong[k];
    const t = thang[r.report_date.slice(0, 7)] = thang[r.report_date.slice(0, 7)] || { n: 0, diem: 0, tot: 0, kem: 0, gq: 0 };
    t.n += r.qa_count; t.diem += r.score_sum; t.tot += r.good_count; t.kem += r.poor_count; t.gq += r.resolved_count;
  });
  Object.keys(thang).sort().forEach(m => {
    const t = thang[m];
    Logger.log('  Tháng ' + m + ': ' + t.n + ' cuộc, điểm TB ' + (t.diem / t.n).toFixed(1) + ', Tốt ' + t.tot +
      ', Kém ' + t.kem + ', đã giải quyết ' + phanTram_(t.gq, t.n));
  });
  Logger.log('✅ Đối chiếu với báo cáo QA. Không ghi gì vào Supabase.');
}

function dongBoQA() {
  const nhan = 'Đồng bộ QA';
  try {
    const kq = docQA_();
    const now = new Date().toISOString();
    const rows = Object.keys(kq.dong).map(k => Object.assign({}, kq.dong[k], { source: QA.NGUON, updated_at: now }));
    ghiBang_('call_qa_daily', 'report_date,ext', rows);
    const ngay = rows.map(r => r.report_date).sort();
    const msg = nhan + ': ' + kq.call + ' cuộc chấm (' + (ngay[0] || '–') + ' → ' + (ngay[ngay.length - 1] || '–') + '), ' + rows.length + ' dòng ngày × ĐTV';
    supabase_('post', 'sync_log', [{ report_date: ngay[ngay.length - 1] || null, status: rows.length ? 'success' : 'skipped',
      rows_written: rows.length, message: msg }], 'return=minimal');
    Logger.log('✅ ' + msg);
  } catch (e) {
    Logger.log('❌ LỖI: ' + e.message);
    try {
      supabase_('post', 'sync_log', [{ status: 'error', rows_written: 0, message: (nhan + ': ' + e.message).slice(0, 1000) }], 'return=minimal');
    } catch (e2) { /* Supabase không truy cập được – bỏ qua */ }
    try {
      MailApp.sendEmail(Session.getEffectiveUser().getEmail(), '[Báo cáo Call] Đồng bộ QA → Supabase bị lỗi',
        nhan + ' bị lỗi:\n\n' + e.message + '\n\nMở Apps Script → Executions để xem chi tiết.');
    } catch (e3) { /* không gửi được mail – bỏ qua */ }
    throw e;
  }
}

function caiLichQA() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'dongBoQA')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('dongBoQA').timeBased().everyDays(1)
    .atHour(QA.GIO_CHAY).nearMinute(QA.PHUT_CHAY).inTimezone(CAU_HINH.MUI_GIO).create();
  Logger.log('✅ Đã cài lịch: chạy dongBoQA mỗi ngày khoảng ' + QA.GIO_CHAY + 'h' + hai_(QA.PHUT_CHAY) +
    ' (giờ Việt Nam, Google có thể lệch ±15 phút).');
}

// =====================================================================
// 2. ĐỌC VÀ TÍNH ĐIỂM
// =====================================================================

function docQA_() {
  const ss = SpreadsheetApp.openById(QA.FILE_ID);
  const sh = ss.getSheetByName(QA.SHEET);
  if (!sh) throw new Error('Không thấy sheet "' + QA.SHEET + '" trong file QA.');
  const vals = sh.getDataRange().getValues();
  const header = vals[0].map(chuanHoa_);
  const tim = ten => {
    const i = header.findIndex(h => h === ten || h.indexOf(ten) === 0);
    if (i < 0) throw new Error('Sheet "' + QA.SHEET + '" không có cột "' + ten + '". Kiểm tra lại tiêu đề cột.');
    return i;
  };
  const cot = {};
  Object.keys(QA_COT).forEach(k => { cot[k] = tim(QA_COT[k]); });
  const cotLoi = QA_TIEU_CHI.map(t => ({ i: tim(t.ten), tru: t.tru }));
  const tz = ss.getSpreadsheetTimeZone();

  const kq = { dong: {}, tong: vals.length - 1, call: 0, boQua: 0 };
  for (let r = 1; r < vals.length; r++) {
    const row = vals[r];
    if (chuanHoa_(row[cot.kenh]) !== QA.KENH) continue;
    const ts = row[cot.time];
    const ext = String(row[cot.ext] || '').replace(/\D/g, '');
    if (!(ts instanceof Date) || !ext) { kq.boQua++; continue; }
    const ngay = Utilities.formatDate(ts, tz, 'yyyy-MM-dd');
    // Điểm = 100 + 10 × số mục khen − Σ (số lỗi × điểm trừ)   (giống cột AP "Kết quả")
    const diem = 100 + 10 * demMuc_(row[cot.thuong]) - cotLoi.reduce((s, c) => s + demMuc_(row[c.i]) * c.tru, 0);
    const cl = chuanHoa_(row[cot.chatLuong]);
    const k = ngay + '|' + ext;
    const d = kq.dong[k] = kq.dong[k] || { report_date: ngay, ext, qa_count: 0, score_sum: 0, good_count: 0,
      fair_count: 0, poor_count: 0, resolved_count: 0, repeat_count: 0 };
    d.qa_count++; d.score_sum += diem;
    if (cl === 'tot') d.good_count++; else if (cl === 'kha') d.fair_count++; else if (cl === 'kem') d.poor_count++;
    if (chuanHoa_(row[cot.giaiQuyet]) === 'co') d.resolved_count++;
    if (chuanHoa_(row[cot.trung]) === 'co') d.repeat_count++;
    kq.call++;
  }
  return kq;
}

/** Số mục trong ô: rỗng = 0, còn lại = số dấu phẩy + 1 (giống công thức LEN/SUBSTITUTE của QA). */
function demMuc_(v) {
  const s = String(v == null ? '' : v);
  if (s === '') return 0;
  return s.split(',').length;
}
