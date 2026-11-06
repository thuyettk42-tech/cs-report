/**
 * =====================================================================
 *  ĐỒNG BỘ SỰ CỐ SẢN PHẨM (DỰ ÁN KAT)  →  SUPABASE
 * =====================================================================
 *  Đọc sheet "Sự cố KAT" trong file "Thống kê vấn đề sản phẩm" (quản lý tự ghi nhận) và ghi
 *  vào bảng kat_incident. Mỗi lần chạy đọc lại CẢ sheet, xóa bảng rồi ghi lại (bảng nhỏ).
 *
 *  Cột trong sheet:
 *    A STT · B Thời gian phát sinh lỗi · C Thời gian xử lý done lỗi · D Lỗi phát sinh · E Mã lỗi
 *    F Mức độ ảnh hưởng (số gian hàng) · G Đánh giá
 *    H Mức độ (chọn: Nghiêm trọng / Ảnh hưởng vận hành / Nhẹ)       ← cột thêm cho báo cáo
 *    I Thời gian xử lý (gọn) – vd "~40 phút (9h50–10h30)"             ← cột thêm cho báo cáo
 *    J Tóm tắt đánh giá (báo cáo) – 1–2 câu hiện trên web            ← cột thêm cho báo cáo
 *  H, I, J để trống vẫn được: web hiện "Chưa đánh giá" / nguyên văn cột C / nguyên văn cột G.
 *
 *  File này nằm CÙNG dự án Apps Script "Đồng bộ 3CX Supabase" (dùng hàm supabase_, chuanHoa_…).
 *
 *  CÁC HÀM BẠN SẼ BẤM CHẠY:
 *    1. taoCotBaoCaoSuCo – chạy 1 LẦN: thêm tiêu đề cột H, I, J + ô chọn mức độ, điền sẵn
 *                          tóm tắt cho 12 sự cố đầu (chỉ điền ô đang trống, không ghi đè)
 *    2. kiemTraSuCo      – đọc thử sheet, chỉ hiện kết quả, KHÔNG ghi gì
 *    3. dongBoSuCo       – đọc sheet và ghi vào Supabase (lịch tự động cũng gọi hàm này)
 *    4. caiLichSuCo      – cài lịch tự động mỗi sáng khoảng 11h45
 * =====================================================================
 */

const SU_CO = {
  FILE_ID: '1FbY01DVNF_zhrCnHrUx4GIRHcE4WNTi_YELeyID-S7A',
  SHEET: 'Sự cố KAT',
  GIO_CHAY: 11,
  PHUT_CHAY: 45,
  MUC_DO: ['Nghiêm trọng', 'Ảnh hưởng vận hành', 'Nhẹ'],
};

// =====================================================================
// 1. CÁC HÀM BẤM CHẠY
// =====================================================================

function kiemTraSuCo() {
  const ds = docSuCo_();
  Logger.log('Đọc ' + ds.length + ' sự cố.');
  ds.forEach(x => Logger.log(x.incident_date + ' | ' + x.error_name + ' | ' + (x.severity || 'Chưa đánh giá') + ' | ' +
    (x.handle_time || '').slice(0, 60) + ' | GH: ' + (x.stores_reported == null ? '–' : x.stores_reported) +
    (x.stores_actual != null ? ' (thực tế ' + x.stores_actual + ')' : '')));
  Logger.log('✅ Không ghi gì vào Supabase.');
}

function dongBoSuCo() {
  const nhan = 'Thống kê sự cố';
  try {
    const ds = docSuCo_();
    const now = new Date().toISOString();
    supabase_('delete', 'kat_incident?row_no=gte.0', undefined, 'return=minimal');
    if (ds.length) ghiBang_('kat_incident', 'row_no', ds.map(x => Object.assign({}, x, { updated_at: now })));
    const ngay = ds.map(x => x.incident_date).sort();
    const msg = nhan + ': ' + ds.length + ' sự cố (' + (ngay[0] || '–') + ' → ' + (ngay[ngay.length - 1] || '–') + ')';
    supabase_('post', 'sync_log', [{ report_date: ngay[ngay.length - 1] || null, status: 'success', rows_written: ds.length, message: msg }], 'return=minimal');
    Logger.log('✅ ' + msg);
  } catch (e) {
    Logger.log('❌ LỖI: ' + e.message);
    try {
      supabase_('post', 'sync_log', [{ status: 'error', rows_written: 0, message: (nhan + ': ' + e.message).slice(0, 1000) }], 'return=minimal');
    } catch (e2) { /* bỏ qua */ }
    try {
      MailApp.sendEmail(Session.getEffectiveUser().getEmail(), '[Báo cáo KAT] Đồng bộ sự cố → Supabase bị lỗi',
        nhan + ' bị lỗi:\n\n' + e.message + '\n\nMở Apps Script → Executions để xem chi tiết.');
    } catch (e3) { /* bỏ qua */ }
    throw e;
  }
}

function caiLichSuCo() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'dongBoSuCo')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('dongBoSuCo').timeBased().everyDays(1)
    .atHour(SU_CO.GIO_CHAY).nearMinute(SU_CO.PHUT_CHAY).inTimezone(CAU_HINH.MUI_GIO).create();
  Logger.log('✅ Đã cài lịch: chạy dongBoSuCo mỗi ngày khoảng ' + SU_CO.GIO_CHAY + 'h' + hai_(SU_CO.PHUT_CHAY) +
    ' (giờ Việt Nam, Google có thể lệch ±15 phút).');
}

/**
 * Chạy 1 lần: thêm 3 cột H, I, J cho báo cáo, ô chọn mức độ ở cột H, và điền sẵn tóm tắt
 * cho các sự cố đã có (chỉ điền ô đang trống – chạy lại không ghi đè chữ bạn đã sửa).
 */
function taoCotBaoCaoSuCo() {
  const sh = sheetSuCo_();
  const tieuDe = sh.getRange(1, 8, 1, 3).getValues()[0];
  const tenCot = ['Mức độ', 'Thời gian xử lý (gọn)', 'Tóm tắt đánh giá (báo cáo)'];
  sh.getRange(1, 8, 1, 3).setValues([tieuDe.map((v, i) => v || tenCot[i])]).setFontWeight('bold');

  const quyTac = SpreadsheetApp.newDataValidation().requireValueInList(SU_CO.MUC_DO, true).setAllowInvalid(false).build();
  sh.getRange(2, 8, Math.max(sh.getMaxRows() - 1, 1), 1).setDataValidation(quyTac);

  const n = sh.getLastRow() - 1;
  if (n < 1) return;
  const v = sh.getRange(2, 1, n, 10).getValues();
  let dien = 0;
  v.forEach((r, i) => {
    if (!r[3]) return;
    const t = chuanHoa_(r[2] + ' ' + r[3]);
    const m = TOM_TAT_BAN_DAU.find(x => x[0].test(t));
    if (!m) return;
    [m[1], m[2], m[3]].forEach((giaTri, j) => {
      if (String(r[7 + j]).trim() === '') { sh.getRange(i + 2, 8 + j).setValue(giaTri); dien++; }
    });
  });
  sh.setColumnWidth(8, 140); sh.setColumnWidth(9, 200); sh.setColumnWidth(10, 380);
  sh.getRange(2, 10, n, 1).setWrap(true);
  Logger.log('✅ Đã thêm cột H, I, J và điền ' + dien + ' ô còn trống.');
}

// Tóm tắt cho các sự cố đã có đến 05/11/2026 – nhận theo từ khóa trong cột C + D
const TOM_TAT_BAN_DAU = [
  [/kve load cham/, 'Nhẹ', '~20 phút', 'Lỗi ngắn, nhưng rơi vào lúc KH mới dùng HĐĐT nên nhạy cảm.'],
  [/chu ky so khong hop le/, 'Ảnh hưởng vận hành', '~1h30', 'Do hệ thống thuế. KH không phát hành được HĐ / đăng ký tờ khai, đúng cao điểm kê khai tháng 1.'],
  [/dong bo du lieu so doanh thu/, 'Nghiêm trọng', 'Kéo dài nhiều ngày', 'Sai dữ liệu kê khai, xử lý lâu. Nhiều KH gay gắt đòi hủy hợp đồng.'],
  [/treo trang thai/, 'Ảnh hưởng vận hành', 'Lỗi 10 phút, đối soát với thuế ~2 ngày', 'Truyền nhận HĐ lên thuế không thông suốt.'],
  [/gui hddt cho cqt/, 'Ảnh hưởng vận hành', '~1h30', 'Do hạ tầng thuế, truyền nhận HĐ bị gián đoạn. Đã ổn định, không phát sinh thêm.'],
  [/chu ky so rms/, 'Nghiêm trọng', '~1 giờ (15h30–16h30)', 'Do đối tác Intrust. Ký số / phát hành HĐ không thành công; đã báo KH kiểm tra và phát hành lại.'],
  [/phat hanh cham/, 'Nhẹ', '~40 phút (9h50–10h30)', 'Do đối tác Misa, gặp ở cả Retail và FnB. Ảnh hưởng không đáng kể.'],
  [/giam thue/, 'Nghiêm trọng', 'Tối 15/07 → 10h 16/07', 'Ít GH nhưng có rủi ro sai lệch dữ liệu; KH phải tự điều chỉnh / thay thế HĐ lỗi.'],
  [/kafka/, 'Ảnh hưởng vận hành', '~15 phút (8h55–9h10)', 'Đã gửi thông báo, gọi ưu tiên GH nhiều HĐ; KH phát hành lại. Chưa có KH gay gắt.'],
  [/phat hanh len co quan thue/, 'Nhẹ', '~1 giờ', 'Do cấu hình QĐ1233 sai; PTSP tự xử lý, KH không phải thao tác (13 GH bị CQT từ chối cần DVKH hỗ trợ).'],
  [/chuyen nhap misa/, 'Ảnh hưởng vận hành', '~55 phút', 'Do đối tác Misa. Chỉ ảnh hưởng KH dùng HĐ Misa qua luồng chuyển nháp.'],
  [/cloudflare/, 'Nhẹ', '~10 phút', 'Do Cloudflare, xử lý nhanh, không ảnh hưởng nghiêm trọng.'],
];

// =====================================================================
// 2. ĐỌC SHEET
// =====================================================================

function sheetSuCo_() {
  const ss = SpreadsheetApp.openById(SU_CO.FILE_ID);
  const sh = ss.getSheetByName(SU_CO.SHEET) ||
    ss.getSheets().find(s => chuanHoa_(s.getName()) === chuanHoa_(SU_CO.SHEET));
  if (!sh) throw new Error('Không thấy sheet "' + SU_CO.SHEET + '" trong file Thống kê vấn đề sản phẩm.');
  return sh;
}

function docSuCo_() {
  const sh = sheetSuCo_();
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  const v = sh.getRange(2, 1, n, 10).getValues();
  const ds = [];
  v.forEach((r, i) => {
    const ngay = docNgaySuCo_(r[1]);
    const ten = tenLoiSuCo_(r[3]);
    if (!ngay || !ten) return;            // dòng trống / chưa ghi ngày
    const gh = soGianHang_(r[5]);
    const mucDo = SU_CO.MUC_DO.find(m => chuanHoa_(m) === chuanHoa_(r[7])) || null;
    ds.push({
      row_no: i + 2,
      incident_date: ngay,
      error_name: ten,
      error_code: String(r[4] || '').trim() || null,
      severity: mucDo,
      handle_time: String(r[8] || '').trim() || String(r[2] || '').trim() || null,
      stores_reported: gh.baoLoi,
      stores_actual: gh.thucTe,
      impact_text: String(r[5] || '').trim() || null,
      summary: String(r[9] || '').trim() || String(r[6] || '').trim() || null,
    });
  });
  return ds;
}

/** Ô ngày: kiểu Date của Google Sheet, hoặc chữ dạng tháng/ngày/năm (như sheet đang dùng) */
function docNgaySuCo_(x) {
  if (x instanceof Date && !isNaN(x)) return Utilities.formatDate(x, CAU_HINH.MUI_GIO, 'yyyy-MM-dd');
  const m = String(x || '').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  return m ? m[3] + '-' + hai_(m[1]) + '-' + hai_(m[2]) : null;
}

/** Bỏ chữ "Lỗi KAT:" ở đầu và phần giải thích sau "=>" để tên lỗi gọn */
function tenLoiSuCo_(s) {
  let t = String(s || '').replace(/\s+/g, ' ').trim();
  t = t.split('=>')[0].trim().replace(/[,;:\s]+$/, '');
  t = t.replace(/^lỗi kat\s*[:\-–]\s*/i, '');
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : '';
}

/**
 * Số gian hàng từ cột F: "Có 48 GH báo lỗi" → 48. "Ghi nhận 51 GH báo lỗi, query hệ thống phát hiện 1272 GH"
 * → báo lỗi 51, thực tế 1272. "Retail: 9 GH - FnB: 34 GH" → 43.
 */
function soGianHang_(s) {
  const t = chuanHoa_(s);
  const so = [...t.matchAll(/(\d[\d.,]*)\s*gh\b/g)].map(m => Number(m[1].replace(/[.,]/g, '')));
  if (!so.length) return { baoLoi: null, thucTe: null };
  if (so.length > 1 && /query|phat hien|tong|thuc te/.test(t)) return { baoLoi: so[0], thucTe: so[so.length - 1] };
  return { baoLoi: so.reduce((a, b) => a + b, 0), thucTe: null };
}
