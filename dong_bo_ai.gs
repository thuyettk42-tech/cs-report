/**
 * =====================================================================
 *  ĐỒNG BỘ KẾT QUẢ CHẤM CALL VOICE AI  →  SUPABASE
 * =====================================================================
 *  Đọc 4 sheet chi tiết "Call Retail", "Call FnB", "Call Kỹ thuật", "Call HDDT"
 *  của file "[OM] Báo cáo chất lượng call của AI Agent", đếm theo ngày gọi + line
 *  đúng như sheet "BÁO CÁO CALL", rồi ghi vào bảng call_ai_qa_daily.
 *  Không ghi nội dung hội thoại / số điện thoại.
 *
 *  File này nằm CÙNG dự án Apps Script "Đồng bộ 3CX Supabase".
 *
 *  CÁC HÀM BẠN SẼ BẤM CHẠY:
 *    1. kiemTraAI    – đếm thử theo tháng × line, chỉ hiện kết quả, KHÔNG ghi gì
 *    2. dongBoAI     – đọc toàn bộ và ghi vào Supabase (chạy lại không trùng)
 *    3. caiLichAI    – cài lịch tự động mỗi sáng khoảng 10h45
 * =====================================================================
 */

const AI_QA = {
  FILE_ID: '1yUa-aue-5hn4eHAwvH-ian66CGuCmzvGpy_UOI1vRLc',
  SHEETS: [
    { sheet: 'Call Retail', line: 'Retail' },
    { sheet: 'Call FnB', line: 'FnB' },
    { sheet: 'Call Kỹ thuật', line: 'Kỹ thuật' },
    { sheet: 'Call HDDT', line: 'HDDT' },
  ],
  // Cột cố định theo công thức sheet "BÁO CÁO CALL" (A = 0): A Tháng, B Ngày, I Phân loại, V Action, W Action Result
  COT: { thang: 0, ngay: 1, phanLoai: 8, action: 21, ketQua: 22 },
  TIEU_DE: { ngay: 'ngay', phanLoai: 'phan loai', action: 'action', ketQua: 'action result' }, // kiểm tra dòng 2
  NAM_MAC_DINH: 2026,           // dùng khi cột Ngày trống mà cột Tháng có số
  GIO_CHAY: 10,
  PHUT_CHAY: 45,
  NGUON: 'AI Agent QA',
};

// =====================================================================
// 1. CÁC HÀM BẤM CHẠY
// =====================================================================

function kiemTraAI() {
  const kq = docAI_();
  const thang = {};
  Object.keys(kq.dong).forEach(k => {
    const r = kq.dong[k];
    const t = r.report_date.slice(0, 7) + ' ' + r.line;
    const x = thang[t] = thang[t] || { checked: 0, hangup: 0, self_resolved: 0, correct: 0 };
    ['checked', 'hangup', 'self_resolved', 'correct'].forEach(f => { x[f] += r[f]; });
  });
  Object.keys(thang).sort().forEach(t => {
    const x = thang[t];
    Logger.log('  ' + t + ': check ' + x.checked + ', ngắt máy ' + x.hangup + ', tự xử lý ' + x.self_resolved +
      ' (' + phanTram_(x.self_resolved, x.checked - x.hangup) + '), đúng ' + x.correct + ' (' + phanTram_(x.correct, x.self_resolved) + ')');
  });
  if (kq.boQua) Logger.log('Bỏ qua ' + kq.boQua + ' dòng có "Phân loại" nhưng không đọc được ngày/tháng.');
  Logger.log('✅ Đối chiếu với sheet "BÁO CÁO CALL" (mục báo cáo theo tháng × ngành). Không ghi gì vào Supabase.');
}

function dongBoAI() {
  const nhan = 'Đồng bộ chấm call AI';
  try {
    const kq = docAI_();
    const now = new Date().toISOString();
    const rows = Object.keys(kq.dong).map(k => Object.assign({}, kq.dong[k], { source: AI_QA.NGUON, updated_at: now }));
    ghiBang_('call_ai_qa_daily', 'report_date,line', rows);
    const ngay = rows.map(r => r.report_date).sort();
    const tong = rows.reduce((s, r) => s + r.checked, 0);
    const msg = nhan + ': ' + tong + ' cuộc check (' + (ngay[0] || '–') + ' → ' + (ngay[ngay.length - 1] || '–') + '), ' + rows.length + ' dòng ngày × line';
    supabase_('post', 'sync_log', [{ report_date: ngay[ngay.length - 1] || null, status: rows.length ? 'success' : 'skipped',
      rows_written: rows.length, message: msg }], 'return=minimal');
    Logger.log('✅ ' + msg);
  } catch (e) {
    Logger.log('❌ LỖI: ' + e.message);
    try {
      supabase_('post', 'sync_log', [{ status: 'error', rows_written: 0, message: (nhan + ': ' + e.message).slice(0, 1000) }], 'return=minimal');
    } catch (e2) { /* Supabase không truy cập được – bỏ qua */ }
    try {
      MailApp.sendEmail(Session.getEffectiveUser().getEmail(), '[Báo cáo Call] Đồng bộ chấm call AI → Supabase bị lỗi',
        nhan + ' bị lỗi:\n\n' + e.message + '\n\nMở Apps Script → Executions để xem chi tiết.');
    } catch (e3) { /* không gửi được mail – bỏ qua */ }
    throw e;
  }
}

function caiLichAI() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'dongBoAI')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('dongBoAI').timeBased().everyDays(1)
    .atHour(AI_QA.GIO_CHAY).nearMinute(AI_QA.PHUT_CHAY).inTimezone(CAU_HINH.MUI_GIO).create();
  Logger.log('✅ Đã cài lịch: chạy dongBoAI mỗi ngày khoảng ' + AI_QA.GIO_CHAY + 'h' + hai_(AI_QA.PHUT_CHAY) +
    ' (giờ Việt Nam, Google có thể lệch ±15 phút).');
}

// =====================================================================
// 2. ĐỌC VÀ ĐẾM
// =====================================================================

function docAI_() {
  const ss = SpreadsheetApp.openById(AI_QA.FILE_ID);
  const tz = ss.getSpreadsheetTimeZone();
  const C = AI_QA.COT;
  const kq = { dong: {}, boQua: 0 };
  AI_QA.SHEETS.forEach(cfg => {
    const sh = ss.getSheets().find(s => s.getName().trim() === cfg.sheet);
    if (!sh) throw new Error('Không thấy sheet "' + cfg.sheet + '" trong file báo cáo AI.');
    const vals = sh.getDataRange().getValues();
    // Dòng 2 là tiêu đề: kiểm tra các cột vẫn đúng vị trí như công thức "BÁO CÁO CALL"
    const tieuDe = (vals[1] || []).map(chuanHoa_);
    Object.keys(AI_QA.TIEU_DE).forEach(k => {
      if ((tieuDe[C[k]] || '').indexOf(AI_QA.TIEU_DE[k]) !== 0) {
        throw new Error('Sheet "' + cfg.sheet + '": cột ' + tenCot_(C[k]) + ' không còn là "' + AI_QA.TIEU_DE[k] +
          '" (đang là "' + (vals[1] || [])[C[k]] + '"). Có thể ai đó đã chèn / xóa cột.');
      }
    });
    for (let r = 2; r < vals.length; r++) {
      const row = vals[r];
      const phanLoai = chuanHoa_(row[C.phanLoai]);
      const tuXuLy = chuanHoa_(row[C.action]) === 'tu xu ly';
      if (!phanLoai && !tuXuLy) continue;
      const ngay = ngayAI_(row[C.ngay], row[C.thang], tz);
      if (!ngay) { kq.boQua++; continue; }
      const k = ngay + '|' + cfg.line;
      const d = kq.dong[k] = kq.dong[k] || { report_date: ngay, line: cfg.line, checked: 0, hangup: 0, transferred: 0, self_resolved: 0, correct: 0 };
      // Giống "BÁO CÁO CALL": call check = có "Phân loại"; tự xử lý / xử lý đúng đếm theo cột Action
      if (phanLoai) d.checked++;
      if (phanLoai === 'kh ngat may ngang') d.hangup++;
      if (phanLoai === 'chuyen dvkh') d.transferred++;
      if (tuXuLy) {
        d.self_resolved++;
        if (chuanHoa_(row[C.ketQua]) === 'pass') d.correct++;
      }
    }
  });
  return kq;
}

/** Ngày gọi: cột B kiểu ngày; nếu trống mà cột A là tháng (1–12) thì lấy ngày 01 của tháng đó. */
function ngayAI_(ngay, thang, tz) {
  if (ngay instanceof Date) return Utilities.formatDate(ngay, tz, 'yyyy-MM-dd');
  const t = Number(thang);
  if (t >= 1 && t <= 12) return AI_QA.NAM_MAC_DINH + '-' + hai_(t) + '-01';
  return null;
}
