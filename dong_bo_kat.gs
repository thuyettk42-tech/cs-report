/**
 * =====================================================================
 *  ĐỒNG BỘ TICKET DỰ ÁN KAT (xuất từ CRM)  →  SUPABASE
 * =====================================================================
 *  Đọc các file xuất ticket KAT trong thư mục Drive "KAT", mỗi ticket:
 *    - Kênh: Call / Call – Miss call / Chat – Freshchat / Chat – Zalo /
 *      Ticket – DVKH / Ticket – Sale / Ticket – AI ElevenLabs / Khác.
 *      CRM không ghi kênh: người tạo = người xử lý → kênh NV dùng nhiều nhất
 *      ngày đó (không có thì cả các file đang đọc); khác người → Ticket – DVKH.
 *    - Nhóm nội dung: đọc mô tả + AI summary, nhóm nhiều dấu hiệu nhất;
 *      hòa → ưu tiên Thuế → HĐĐT → CKS → Khác; không có dấu hiệu → theo tiêu đề.
 *    - Trạng thái: Hoàn thành / Không xử lý / Đang treo.
 *  rồi ghi vào bảng kat_ticket (ghi đè theo mã ticket – file sau cập nhật trạng thái mới).
 *  KHÔNG ghi tên gian hàng, số điện thoại, mô tả.
 *
 *  File này nằm CÙNG dự án Apps Script "Đồng bộ 3CX Supabase" (dùng Drive API đã bật).
 *
 *  CÁC HÀM BẠN SẼ BẤM CHẠY:
 *    1. kiemTraKAT        – đọc thử mọi file, chỉ hiện kết quả, KHÔNG ghi gì
 *    2. napKATTatCa       – nạp toàn bộ các file trong thư mục
 *    3. caiLichKAT        – cài lịch tự động mỗi sáng khoảng 11h
 *  Hàm dongBoKATHangNgay là hàm lịch tự động gọi: chỉ đọc file mới hoặc vừa sửa.
 * =====================================================================
 */

const KAT = {
  FOLDER_ID: '1-VoFs6q4Z0--M1DmEXu507WINLc_ZWrx',
  GIO_CHAY: 11,
  PHUT_CHAY: 0,                  // Google lệch ±15 phút → khoảng 10h45–11h15
  KHOA_LAN_CHAY: 'KAT_LAN_CHAY_CUOI',
};

const KAT_COT = {
  id: 'so thu tu ticket',
  tieuDe: 'tieu de',
  kenh: 'kenh ho tro',
  moTa: 'mo ta',
  nguon: 'nguon tiep nhan',
  trangThai: 'trang thai',
  nguoiTao: 'nguoi tao',
  thoiGianTao: 'thoi gian tao',
  nguoiXuLy: 'nguoi xu ly',
  tongThoiGian: 'tong thoi gian xu ly',
  aiSummary: 'ai summary',
};

// Nhóm nội dung theo thứ tự ưu tiên khi hòa điểm
const KAT_NHOM = ['Thuế – Kế toán', 'HĐĐT', 'CKS', 'Khác'];
const KAT_TU_KHOA = {
  'Thuế – Kế toán': [/tu van thue/, /to khai/, /ke toan/, /so sach/, /\bbctc\b/, /quyet toan/, /\bhtkk\b/, /nop thue/, /\btncn\b/,
    /thue gtgt/, /bao cao thue/, /thue mon bai|le phi mon bai/, /\bhkd\b.*thue|thue.*\bhkd\b/, /thue khoan/, /ke khai thue/,
    /so ke toan/, /thong tu 88|tt88|tt 88/, /doanh thu.*thue|thue.*doanh thu/],
  'HĐĐT': [/\bhddt\b/, /hoa don/, /\bhd\b/, /xuat hd|phat hanh/, /mau in|mau so|ky hieu/, /einvoice|e-invoice/, /thay the|dieu chinh/,
    /may tinh tien|\bmtt\b/, /cqt (chap nhan|tu choi|cap ma)|cap ma/, /\bkve\b/],
  'CKS': [/\bcks\b/, /chu ky so/, /token/, /usb ky|ky so/, /gia han chu ky|gia han cks/, /hsm|smartca|remote signing|ky tu xa/, /chung thu/],
  'Khác': [/doi (thong tin|ten|sdt|email|mat khau)|thay doi thong tin/, /gateway|cong thanh toan|\bvnpay\b|\bpay\b/,
    /onboard|kich hoat tai khoan|tao tai khoan/, /lending|leads|tai ky/],
};
const KAT_TIEU_DE_CHUNG = /tu van nghiep vu|ho tro khac|miss ?call|cham call|ho tro noi bo|survey|xac nhan bug|cong viec phat sinh/;

// =====================================================================
// 1. CÁC HÀM BẤM CHẠY
// =====================================================================

function kiemTraKAT() {
  const kq = docCacFileKAT_(dsFileKAT_());
  Logger.log('Đọc ' + kq.files + ' file, ' + kq.ds.length + ' ticket (bỏ ' + kq.trung + ' dòng trùng mã, ' + kq.boQua + ' dòng thiếu mã/ngày).');
  const dem = (f) => {
    const m = {};
    kq.ds.forEach(t => { const v = f(t); m[v] = (m[v] || 0) + 1; });
    return Object.keys(m).sort((a, b) => m[b] - m[a]).map(k => k + ' ' + m[k] + ' (' + phanTram_(m[k], kq.ds.length) + ')').join(', ');
  };
  const ngay = kq.ds.map(t => t.report_date).sort();
  Logger.log('Khoảng ngày: ' + ngay[0] + ' → ' + ngay[ngay.length - 1]);
  Logger.log('Trạng thái: ' + dem(t => t.status_group));
  Logger.log('Kênh: ' + dem(t => t.channel));
  Logger.log('Kênh tự dò (CRM để trống): ' + kq.ds.filter(t => t.channel_inferred).length);
  Logger.log('Nhóm nội dung: ' + dem(t => t.content_group));
  const tk = kq.ds.filter(t => t.channel.indexOf('Ticket') === 0);
  const dat = tk.filter(t => t.status_group === 'Hoàn thành' && (t.process_seconds || 0) <= 4 * 3600).length;
  Logger.log('Kênh Ticket đúng SLA 4h: ' + dat + ' / ' + tk.length + ' (' + phanTram_(dat, tk.length) + ')');
  Logger.log('✅ Không ghi gì vào Supabase.');
}

function napKATTatCa() {
  dongBoKAT_(dsFileKAT_(), 'Nạp ticket KAT (tất cả file)');
}

function dongBoKATHangNgay() {
  const lanTruoc = Number(PropertiesService.getScriptProperties().getProperty(KAT.KHOA_LAN_CHAY) || 0);
  const moi = dsFileKAT_().filter(f => f.getLastUpdated().getTime() > lanTruoc);
  if (!moi.length) { Logger.log('Không có file ticket KAT mới hoặc vừa sửa.'); return; }
  dongBoKAT_(moi, 'Ticket KAT hằng ngày (' + moi.length + ' file mới)');
}

function caiLichKAT() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'dongBoKATHangNgay')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('dongBoKATHangNgay').timeBased().everyDays(1)
    .atHour(KAT.GIO_CHAY).nearMinute(KAT.PHUT_CHAY).inTimezone(CAU_HINH.MUI_GIO).create();
  Logger.log('✅ Đã cài lịch: chạy dongBoKATHangNgay mỗi ngày khoảng ' + KAT.GIO_CHAY + 'h' + hai_(KAT.PHUT_CHAY) +
    ' (giờ Việt Nam, Google có thể lệch ±15 phút).');
}

// =====================================================================
// 2. ĐỒNG BỘ
// =====================================================================

function dongBoKAT_(files, nhan) {
  const batDau = Date.now();
  try {
    const kq = docCacFileKAT_(files);
    const now = new Date().toISOString();
    const rows = kq.ds.map(t => Object.assign({}, t, { updated_at: now }));
    ghiBang_('kat_ticket', 'ticket_id', rows);
    const ngay = rows.map(r => r.report_date).sort();
    const msg = nhan + ': ' + rows.length + ' ticket (' + (ngay[0] || '–') + ' → ' + (ngay[ngay.length - 1] || '–') + ')';
    supabase_('post', 'sync_log', [{ report_date: ngay[ngay.length - 1] || null, status: rows.length ? 'success' : 'skipped',
      rows_written: rows.length, message: msg }], 'return=minimal');
    PropertiesService.getScriptProperties().setProperty(KAT.KHOA_LAN_CHAY, String(batDau));
    Logger.log('✅ ' + msg);
  } catch (e) {
    Logger.log('❌ LỖI: ' + e.message);
    try {
      supabase_('post', 'sync_log', [{ status: 'error', rows_written: 0, message: (nhan + ': ' + e.message).slice(0, 1000) }], 'return=minimal');
    } catch (e2) { /* Supabase không truy cập được – bỏ qua */ }
    try {
      MailApp.sendEmail(Session.getEffectiveUser().getEmail(), '[Báo cáo KAT] Đồng bộ ticket KAT → Supabase bị lỗi',
        nhan + ' bị lỗi:\n\n' + e.message + '\n\nMở Apps Script → Executions để xem chi tiết.');
    } catch (e3) { /* không gửi được mail – bỏ qua */ }
    throw e;
  }
}

function dsFileKAT_() {
  const it = DriveApp.getFolderById(KAT.FOLDER_ID).getFiles();
  const ds = [];
  while (it.hasNext()) {
    const f = it.next();
    const loai = f.getMimeType();
    if (loai === MimeType.GOOGLE_SHEETS || loai === MimeType.MICROSOFT_EXCEL) ds.push(f);
  }
  return ds.sort((a, b) => a.getLastUpdated() - b.getLastUpdated()); // file mới hơn đọc sau → trạng thái mới đè lên
}

/** Đọc mọi file, gộp theo mã ticket (file sửa sau cùng thắng), rồi tính kênh / nhóm / trạng thái. */
function docCacFileKAT_(files) {
  const theoMa = {};
  const kq = { files: files.length, trung: 0, boQua: 0, ds: [] };
  files.forEach(file => docFileKAT_(file, (get, tz) => {
    const id = String(get('id') || '').trim();
    const tao = docThoiGianKAT_(get('thoiGianTao'), tz);
    if (!/^TT\d+/i.test(id) || !tao) { kq.boQua++; return; }
    if (theoMa[id]) kq.trung++;
    theoMa[id] = {
      id, tao,
      tieuDe: String(get('tieuDe') || ''), kenh: String(get('kenh') || '').trim(), moTa: String(get('moTa') || ''),
      ai: String(get('aiSummary') || ''), nguon: String(get('nguon') || '').trim(), trangThai: String(get('trangThai') || '').trim(),
      nguoiTao: String(get('nguoiTao') || '').trim(), nguoiXuLy: String(get('nguoiXuLy') || '').trim(),
      giay: Math.round(Number(get('tongThoiGian')) || 0),
    };
  }));
  const ve = Object.keys(theoMa).map(k => theoMa[k]);

  // Kênh chính của từng nhân viên theo ngày và theo cả các file đang đọc (từ ticket Call/Chat có ghi kênh)
  const nvNgay = {}, nvTong = {};
  ve.forEach(t => {
    const k = kenhGocKAT_(t);
    if (!k || k.indexOf('Ticket') === 0) return;
    const nv = maNV_(t.nguoiTao);
    [[nvNgay, nv + '|' + t.tao.ngay], [nvTong, nv]].forEach(([m, key]) => {
      const x = m[key] = m[key] || {}; x[k] = (x[k] || 0) + 1;
    });
  });
  const nhieuNhat = m => Object.keys(m).sort((a, b) => m[b] - m[a])[0];

  kq.ds = ve.map(t => {
    let kenh = kenhGocKAT_(t), doKenh = false;
    if (!kenh) {
      doKenh = true;
      const nv = maNV_(t.nguoiTao);
      if (nv && nv === maNV_(t.nguoiXuLy)) {
        const m = nvNgay[nv + '|' + t.tao.ngay] || nvTong[nv];
        kenh = m ? nhieuNhat(m) : 'Ticket – DVKH';
      } else kenh = 'Ticket – DVKH';
    }
    const tt = t.trangThai;
    return {
      ticket_id: t.id,
      created_at: t.tao.ngay + ' ' + t.tao.gio,
      report_date: t.tao.ngay,
      created_hour: Number(t.tao.gio.slice(0, 2)),
      channel: kenh,
      channel_inferred: doKenh,
      content_group: nhomNoiDungKAT_(t),
      status: tt || null,
      status_group: /^(da xu ly xong|da bao kh)$/.test(chuanHoa_(tt)) ? 'Hoàn thành'
        : /^(tu choi|trung lap)$/.test(chuanHoa_(tt)) ? 'Không xử lý' : 'Đang treo',
      source: /^\d{3,5}\s*-/.test(t.nguon) ? 'Nhân viên' : (t.nguon || null),
      creator_team: nhomNguoiTao_(t.nguoiTao),
      process_seconds: t.giay,
    };
  });
  return kq;
}

function kenhGocKAT_(t) {
  const k = chuanHoa_(t.kenh);
  if (k === 'call') return /miss ?call/i.test(t.tieuDe) ? 'Call – Miss call' : 'Call';
  if (k === 'freshchat') return 'Chat – Freshchat';
  if (k === 'zalo') return 'Chat – Zalo';
  if (k === 'ticket') return /elevenlabs/i.test(t.nguon) ? 'Ticket – AI ElevenLabs' : /sales|tai ky/.test(chuanHoa_(t.nguon)) ? 'Ticket – Sale' : 'Ticket – DVKH';
  return k ? 'Khác' : '';
}

function nhomNoiDungKAT_(t) {
  const tieuDe = chuanHoa_(t.tieuDe);
  const noiDung = chuanHoa_(t.moTa + ' ' + t.ai).replace(/ma so thue|\bmst\b|co quan thue|\bcqt\b(?! (chap nhan|tu choi|cap ma))/g, ' ');
  // 1) Đọc nội dung: nhóm có nhiều dấu hiệu nhất
  const diem = {};
  KAT_NHOM.forEach(n => { diem[n] = KAT_TU_KHOA[n].filter(re => re.test(noiDung)).length; });
  const best = Math.max.apply(null, KAT_NHOM.map(n => diem[n]));
  if (best > 0) return KAT_NHOM.filter(n => diem[n] === best)[0];   // hòa → Thuế → HĐĐT → CKS → Khác
  // 2) Nội dung không có dấu hiệu → theo tiêu đề rõ ràng (bỏ tiêu đề chung chung)
  const tieuDeRo = tieuDe.split('|').map(s => s.trim()).filter(s => s && !KAT_TIEU_DE_CHUNG.test(s));
  const theoTieuDe = KAT_NHOM.filter(n => tieuDeRo.some(x => KAT_TU_KHOA[n].some(re => re.test(x))));
  return theoTieuDe[0] || 'Khác';
}

function nhomNguoiTao_(s) {
  if (/elevenlabs/i.test(s)) return 'AI ElevenLabs';
  if (/administrator/i.test(s)) return 'Administrator';
  if (/- KAT|KAT -/i.test(s)) return 'KAT';
  if (/outsourc/i.test(s)) return 'Outsourcing';
  if (/customer service/i.test(s)) return 'CS ' + s.split(' - ').pop().trim();
  return s ? 'Khác' : null;
}

function maNV_(s) {
  const m = String(s || '').match(/^\s*(\d{3,5})\s*-/);
  return m ? m[1] : String(s || '').trim();
}

/** Thời gian tạo: ô ngày giờ, hoặc chữ "2026-10-31 9:59 pm" / "10/28/2026 21:33". */
function docThoiGianKAT_(v, tz) {
  if (v instanceof Date) return { ngay: Utilities.formatDate(v, tz, 'yyyy-MM-dd'), gio: Utilities.formatDate(v, tz, 'HH:mm:ss') };
  const s = String(v || '').trim().toLowerCase();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})[ t]+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?/);
  let y, mo, d, h, mi, se, ap;
  if (m) { [, y, mo, d, h, mi, se, ap] = m; }
  else {
    m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})[ t]+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?/);   // tháng/ngày/năm (kiểu CRM)
    if (!m) return null;
    [, mo, d, y, h, mi, se, ap] = m;
  }
  h = Number(h);
  if (ap === 'pm' && h < 12) h += 12;
  if (ap === 'am' && h === 12) h = 0;
  return { ngay: y + '-' + hai_(mo) + '-' + hai_(d), gio: hai_(h) + ':' + mi + ':' + (se || '00') };
}

/** Mở file (Excel thì tạm chuyển sang Google Trang tính rồi bỏ vào thùng rác), gọi xuLy cho từng dòng. */
function docFileKAT_(file, xuLy) {
  let tamId = null;
  try {
    let ssId = file.getId();
    if (file.getMimeType() === MimeType.MICROSOFT_EXCEL) {
      tamId = Drive.Files.create({ name: '(tạm) ' + file.getName(), mimeType: MimeType.GOOGLE_SHEETS }, file.getBlob()).id;
      ssId = tamId;
    }
    const ss = SpreadsheetApp.openById(ssId);
    const tz = ss.getSpreadsheetTimeZone();
    const sh = ss.getSheets()[0];
    const vals = sh.getDataRange().getValues();
    const hang = vals.findIndex(r => r.some(c => chuanHoa_(c) === KAT_COT.id));
    if (hang < 0) throw new Error('File "' + file.getName() + '" không có cột "Số thứ tự ticket".');
    const header = vals[hang].map(chuanHoa_);
    const viTri = {};
    Object.keys(KAT_COT).forEach(k => {
      const i = header.findIndex(h => h === KAT_COT[k] || h.indexOf(KAT_COT[k]) === 0);
      if (i < 0 && k !== 'aiSummary') throw new Error('File "' + file.getName() + '" không có cột "' + KAT_COT[k] + '".');
      viTri[k] = i;
    });
    for (let r = hang + 1; r < vals.length; r++) xuLy(k => (viTri[k] >= 0 ? vals[r][viTri[k]] : ''), tz);
  } finally {
    if (tamId) DriveApp.getFileById(tamId).setTrashed(true);
  }
}
