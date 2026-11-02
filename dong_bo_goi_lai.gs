/**
 * =====================================================================
 *  ĐỒNG BỘ GỌI LẠI CUỘC NHỠ (Power BI "QA call")  →  SUPABASE
 * =====================================================================
 *  Đọc các file xuất từ bảng "Chi tiết cuộc gọi MissCall" trong thư mục
 *  Drive "Goi lai", đếm theo ngày + hàng đợi: số cuộc nhỡ cần gọi lại,
 *  số gọi lại đúng / sai quy định, rồi ghi vào bảng call_callback_daily.
 *
 *  File này nằm CÙNG dự án Apps Script "Đồng bộ 3CX Supabase" (thêm file
 *  mới, không sửa file cũ) – dùng chung kết nối Supabase và các hàm tiện ích.
 *  Cần bật dịch vụ Drive API: Services (+) → Drive API → Add.
 *
 *  Đặt tên file trong thư mục:
 *    "Goi lai Thang 10"       – cả tháng 10 (năm nay)
 *    "Goi lai 2026-11-01"     – một ngày (cũng nhận 01-11-2026, 01.11.2026)
 *  File Excel (.xlsx) hay Google Trang tính đều được.
 *
 *  CÁC HÀM BẠN SẼ BẤM CHẠY:
 *    1. kiemTraGoiLai        – đọc thử mọi file, chỉ hiện kết quả, KHÔNG ghi gì
 *    2. napGoiLaiTatCa       – nạp toàn bộ các file trong thư mục (dùng khi nạp từ đầu)
 *    3. caiLichGoiLai        – cài lịch chạy tự động mỗi sáng khoảng 10h
 *  Hàm dongBoGoiLaiHangNgay là hàm lịch tự động gọi: chỉ đọc file mới hoặc vừa sửa.
 * =====================================================================
 */

const GOI_LAI = {
  FOLDER_ID: '1I06bR68nFpj8k5seIZGCZnr7izWkouNr', // thư mục "Goi lai"
  GIO_CHAY: 10,
  PHUT_CHAY: 15,                  // Google lệch ±15 phút → khoảng 10h00–10h30
  NGUON: 'Power BI (QA call)',
  KHOA_LAN_CHAY: 'GOI_LAI_LAN_CHAY_CUOI', // lưu thời điểm lần chạy thành công gần nhất
};

// Tên cột (không dấu, chữ thường, bỏ dấu "_" và "?")
const COT_GOI_LAI = {
  id:      ['ma cuoc goi'],
  queue:   ['line number'],
  start:   ['call start'],
  next:    ['cuoc goi tuong tac gan nhat sau cuoc goi nho'],
  ketQua:  ['goi lai dung quy dinh'],
};

// =====================================================================
// 1. CÁC HÀM BẤM CHẠY
// =====================================================================

function kiemTraGoiLai() {
  const files = dsFileGoiLai_();
  Logger.log('Thư mục có ' + files.length + ' file hợp lệ.');
  const kq = docCacFileGoiLai_(files);
  Object.keys(kq.theoThang).sort().forEach(th => {
    const t = kq.theoThang[th];
    Logger.log('  Tháng ' + th + ': ' + t.missed + ' cuộc nhỡ cần gọi lại, đúng QĐ ' + t.on_time +
      ', sai QĐ ' + t.late + ' (' + phanTram_(t.late, t.missed) + '), không có tương tác ' + t.no_interaction);
  });
  if (kq.boQua) Logger.log('Bỏ qua ' + kq.boQua + ' dòng (dòng tổng / không đọc được ngày hoặc kết quả).');
  if (kq.trung) Logger.log('Bỏ ' + kq.trung + ' dòng trùng mã cuộc gọi giữa các file.');
  Logger.log('✅ Đối chiếu với cột "% gọi lại sai quy định" trên Power BI. Không ghi gì vào Supabase.');
}

function napGoiLaiTatCa() {
  dongBoGoiLai_(dsFileGoiLai_(), 'Nạp gọi lại (tất cả file)');
}

function dongBoGoiLaiHangNgay() {
  const lanTruoc = Number(PropertiesService.getScriptProperties().getProperty(GOI_LAI.KHOA_LAN_CHAY) || 0);
  const tatCa = dsFileGoiLai_();
  const moi = tatCa.filter(f => f.file.getLastUpdated().getTime() > lanTruoc);
  if (!moi.length) { Logger.log('Không có file gọi lại mới hoặc vừa sửa.'); return; }
  // Đọc lại mọi file có chung ngày với file mới để không đếm thiếu khi 1 ngày nằm ở 2 file
  const ngayMoi = moi.map(f => f.tu + '..' + f.den);
  const can = tatCa.filter(f => moi.some(m => f.tu <= m.den && m.tu <= f.den));
  dongBoGoiLai_(can, 'Gọi lại hằng ngày (' + moi.length + ' file mới: ' + ngayMoi.join(', ') + ')', moi);
}

function caiLichGoiLai() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'dongBoGoiLaiHangNgay')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('dongBoGoiLaiHangNgay').timeBased().everyDays(1)
    .atHour(GOI_LAI.GIO_CHAY).nearMinute(GOI_LAI.PHUT_CHAY).inTimezone(CAU_HINH.MUI_GIO).create();
  Logger.log('✅ Đã cài lịch: chạy dongBoGoiLaiHangNgay mỗi ngày khoảng ' + GOI_LAI.GIO_CHAY + 'h' +
    hai_(GOI_LAI.PHUT_CHAY) + ' (giờ Việt Nam, Google có thể lệch ±15 phút).');
}

// =====================================================================
// 2. ĐỒNG BỘ
// =====================================================================

/** files: danh sách cần đọc; chiPhu: nếu có, chỉ ghi các ngày nằm trong các file này. */
function dongBoGoiLai_(files, nhan, chiPhu) {
  const batDau = Date.now();
  try {
    const kq = docCacFileGoiLai_(files);
    const now = new Date().toISOString();
    const rows = [];
    const ngayGhi = {};
    Object.keys(kq.dong).forEach(k => {
      const r = kq.dong[k];
      if (chiPhu && !chiPhu.some(f => f.tu <= r.report_date && r.report_date <= f.den)) return;
      rows.push(Object.assign({}, r, { source: GOI_LAI.NGUON, updated_at: now }));
      const n = ngayGhi[r.report_date] = ngayGhi[r.report_date] || { missed: 0, late: 0 };
      n.missed += r.missed; n.late += r.late;
    });
    ghiBang_('call_callback_daily', 'report_date,queue', rows);
    const cacNgay = Object.keys(ngayGhi).sort();
    const tong = cacNgay.reduce((a, d) => ({ missed: a.missed + ngayGhi[d].missed, late: a.late + ngayGhi[d].late }), { missed: 0, late: 0 });
    const msg = nhan + ': ' + cacNgay.length + ' ngày' + (cacNgay.length ? ' (' + cacNgay[0] + ' → ' + cacNgay[cacNgay.length - 1] + ')' : '') +
      ', ' + tong.missed + ' cuộc nhỡ, sai QĐ ' + tong.late + ' (' + phanTram_(tong.late, tong.missed) + ')';
    supabase_('post', 'sync_log', [{ report_date: cacNgay[cacNgay.length - 1] || null, status: cacNgay.length ? 'success' : 'skipped',
      rows_written: rows.length, message: msg.slice(0, 1000) }], 'return=minimal');
    PropertiesService.getScriptProperties().setProperty(GOI_LAI.KHOA_LAN_CHAY, String(batDau));
    Logger.log('✅ ' + msg);
  } catch (e) {
    Logger.log('❌ LỖI: ' + e.message);
    try {
      supabase_('post', 'sync_log', [{ status: 'error', rows_written: 0, message: (nhan + ': ' + e.message).slice(0, 1000) }], 'return=minimal');
    } catch (e2) { /* Supabase không truy cập được – bỏ qua */ }
    try {
      MailApp.sendEmail(Session.getEffectiveUser().getEmail(), '[Báo cáo Call] Đồng bộ gọi lại → Supabase bị lỗi',
        nhan + ' bị lỗi:\n\n' + e.message + '\n\nMở Apps Script → Executions để xem chi tiết.');
    } catch (e3) { /* không gửi được mail – bỏ qua */ }
    throw e;
  }
}

/** Đọc các file, bỏ trùng theo mã cuộc gọi, cộng theo ngày + hàng đợi. */
function docCacFileGoiLai_(files) {
  const daThay = {};
  const kq = { dong: {}, theoThang: {}, boQua: 0, trung: 0 };
  files.forEach(f => {
    docFileGoiLai_(f.file, (get, tz) => {
      const id = String(get('id') || '').replace(/\D/g, '');
      const ngay = docNgayGoiLai_(get('start'), tz);
      const kqGoi = chuanHoa_(get('ketQua'));
      const dung = kqGoi.indexOf('dung') === 0, sai = kqGoi.indexOf('sai') === 0;
      if (id.length < 6 || !ngay || (!dung && !sai)) { kq.boQua++; return; }
      // Mã cuộc gọi dài 19 số có thể bị làm tròn khi là ô số → ghép thêm giờ gọi để không trùng nhầm
      const start = get('start');
      const khoa = id + '|' + (start instanceof Date ? start.getTime() : String(start));
      if (daThay[khoa]) { kq.trung++; return; }
      daThay[khoa] = 1;
      const q = docQueue_(String(get('queue') || '').trim());
      const ten = q.ten || '(không rõ)';
      const k = ngay + '|' + ten;
      const r = kq.dong[k] = kq.dong[k] || { report_date: ngay, queue: ten, queue_ext: q.ext || null,
        missed: 0, on_time: 0, late: 0, no_interaction: 0 };
      const khongTuongTac = String(get('next') || '').trim() === '' ? 1 : 0;
      r.missed++; r.on_time += dung ? 1 : 0; r.late += sai ? 1 : 0; r.no_interaction += khongTuongTac;
      const t = kq.theoThang[ngay.slice(0, 7)] = kq.theoThang[ngay.slice(0, 7)] || { missed: 0, on_time: 0, late: 0, no_interaction: 0 };
      t.missed++; t.on_time += dung ? 1 : 0; t.late += sai ? 1 : 0; t.no_interaction += khongTuongTac;
    });
  });
  return kq;
}

// =====================================================================
// 3. ĐỌC FILE
// =====================================================================

/** Các file trong thư mục có tên hợp lệ, kèm khoảng ngày suy ra từ tên. */
function dsFileGoiLai_() {
  const it = DriveApp.getFolderById(GOI_LAI.FOLDER_ID).getFiles();
  const ds = [];
  const homNay = homNay_();
  while (it.hasNext()) {
    const file = it.next();
    const loai = file.getMimeType();
    if (loai !== MimeType.GOOGLE_SHEETS && loai !== MimeType.MICROSOFT_EXCEL) continue;
    const kh = khoangNgayTuTen_(file.getName(), homNay);
    if (!kh) { Logger.log('⚠ Bỏ qua file "' + file.getName() + '": tên không theo mẫu "Goi lai Thang M" hoặc "Goi lai yyyy-mm-dd".'); continue; }
    ds.push({ file, tu: kh.tu, den: kh.den });
  }
  ds.sort((a, b) => (a.tu < b.tu ? -1 : 1));
  return ds;
}

/** "Goi lai Thang 10" → cả tháng 10; "Goi lai 2026-11-01" / "01-11-2026" → 1 ngày. */
function khoangNgayTuTen_(ten, homNay) {
  const s = chuanHoa_(ten).replace(/\.xlsx$/, '');
  let m = s.match(/thang\s*(\d{1,2})(?:\s*[\/.\- ]\s*(\d{4}))?/);
  if (m) {
    const thang = Number(m[1]);
    if (thang < 1 || thang > 12) return null;
    let nam = m[2] ? Number(m[2]) : Number(homNay.slice(0, 4));
    if (!m[2] && thang > Number(homNay.slice(5, 7))) nam--;            // "Thang 12" xem vào tháng 1 → năm trước
    const tu = nam + '-' + hai_(thang) + '-01';
    const cuoi = new Date(Date.UTC(nam, thang, 0)).getUTCDate();
    return { tu, den: nam + '-' + hai_(thang) + '-' + hai_(cuoi) };
  }
  m = s.match(/(\d{4})[\-.\/](\d{1,2})[\-.\/](\d{1,2})/);
  if (m) { const d = m[1] + '-' + hai_(m[2]) + '-' + hai_(m[3]); return { tu: d, den: d }; }
  m = s.match(/(\d{1,2})[\-.\/](\d{1,2})[\-.\/](\d{4})/);
  if (m) { const d = m[3] + '-' + hai_(m[2]) + '-' + hai_(m[1]); return { tu: d, den: d }; }
  return null;
}

/** Mở file (Excel thì tạm chuyển sang Google Trang tính rồi bỏ vào thùng rác), gọi xuLy cho từng dòng. */
function docFileGoiLai_(file, xuLy) {
  let tamId = null;
  try {
    let ssId = file.getId();
    if (file.getMimeType() === MimeType.MICROSOFT_EXCEL) {
      tamId = Drive.Files.create({ name: '(tạm) ' + file.getName(), mimeType: MimeType.GOOGLE_SHEETS }, file.getBlob()).id;
      ssId = tamId;
    }
    const ss = SpreadsheetApp.openById(ssId);
    const sh = timSheetGoiLai_(ss);
    const vals = sh.getDataRange().getValues();
    const hang = vals.findIndex(r => r.some(c => chuanHoaCot_(c) === 'ma cuoc goi'));
    if (hang < 0) throw new Error('File "' + file.getName() + '" không có cột "Mã cuộc gọi".');
    const header = vals[hang].map(chuanHoaCot_);
    const viTri = {};
    Object.keys(COT_GOI_LAI).forEach(k => {
      const i = header.findIndex(h => COT_GOI_LAI[k].some(t => h === t || h.indexOf(t) === 0));
      if (i < 0) throw new Error('File "' + file.getName() + '" không có cột "' + COT_GOI_LAI[k][0] + '".');
      viTri[k] = i;
    });
    const tz = ss.getSpreadsheetTimeZone();
    for (let r = hang + 1; r < vals.length; r++) xuLy(k => vals[r][viTri[k]], tz);
  } finally {
    if (tamId) DriveApp.getFileById(tamId).setTrashed(true);
  }
}

function timSheetGoiLai_(ss) {
  const sh = ss.getSheets().find(s => {
    const v = s.getRange(1, 1, Math.min(5, Math.max(1, s.getLastRow())), Math.max(1, s.getLastColumn())).getValues();
    return v.some(r => r.some(c => chuanHoaCot_(c) === 'ma cuoc goi'));
  });
  if (!sh) throw new Error('Không thấy sheet nào có cột "Mã cuộc gọi" trong file ' + ss.getName());
  return sh;
}

function chuanHoaCot_(s) { return chuanHoa_(s).replace(/[_?]/g, ' ').replace(/\s+/g, ' ').trim(); }

/** Ngày của cuộc nhỡ: ô kiểu ngày giờ, hoặc chữ "10/1/2026 9:10:45 AM" (tháng/ngày khi có AM/PM). */
function docNgayGoiLai_(v, tz) {
  if (v instanceof Date) return Utilities.formatDate(v, tz || CAU_HINH.MUI_GIO, 'yyyy-MM-dd');
  const s = String(v || '').trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return m[1] + '-' + hai_(m[2]) + '-' + hai_(m[3]);
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!m) return null;
  return /[ap]m\s*$/i.test(s) ? m[3] + '-' + hai_(m[1]) + '-' + hai_(m[2])   // kiểu Mỹ: tháng/ngày
                              : m[3] + '-' + hai_(m[2]) + '-' + hai_(m[1]);  // kiểu Việt: ngày/tháng
}
