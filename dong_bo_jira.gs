/**
 * =====================================================================
 *  ĐỒNG BỘ TICKET JIRA CHUYỂN SẢN PHẨM (DỰ ÁN KAT)  →  SUPABASE
 * =====================================================================
 *  Đọc các file CSV xuất từ Jira trong thư mục Jira KAT riêng (file theo quý + từ Q4/2026 thêm
 *  file "BS case" chứa Case dự án PST). Chỉ đếm ticket CSKH (KTS-…, PST-…), bỏ bản bên Dev (KVEIN-…, KAT-…).
 *  Mỗi issue:
 *    - Loại: Bug (Production Bug, Sub_Bug) / Support (Support, Sub_Support) / Case (New Feature, Sub_Case) / Sự cố (Incident)
 *    - Trạng thái: Đã xong (Done + Waiting for customer, Đã xử lý tạm) / Từ chối (Rejected, Invalid, Duplicated) / Đang treo
 *    - Thời gian: Created (tạo), Resolved (xử lý xong), Status category changed (cập nhật gần nhất)
 *    - Sản phẩm: liên kết KVEIN-… = KVE, KAT-… = HKD
 *    - Nhóm vấn đề: khái quát từ tiêu đề + mô tả (chỉ lưu tên nhóm, không lưu nội dung)
 *    - Dịch vụ: HĐĐT / CKS / Thuế – Kế toán / Khác (dùng chung quy tắc của ticket KAT)
 *  rồi ghi vào bảng kat_jira_issue (ghi đè theo Issue key – file sau cập nhật trạng thái mới).
 *
 *  File này nằm CÙNG dự án Apps Script "Đồng bộ 3CX Supabase" (dùng hàm của dong_bo_kat.gs).
 *
 *  CÁC HÀM BẠN SẼ BẤM CHẠY:
 *    1. kiemTraJira       – đọc thử mọi file CSV, chỉ hiện kết quả, KHÔNG ghi gì
 *    2. napJiraTatCa      – đọc lại tất cả file CSV và ghi vào Supabase
 *    3. caiLichJira       – cài lịch tự động mỗi sáng khoảng 11h30
 *  Hàm dongBoJiraHangNgay là hàm lịch tự động gọi: chỉ đọc file mới hoặc vừa sửa
 *  (không có file mới thì giữ nguyên số cũ).
 * =====================================================================
 */

const JIRA = {
  FOLDER_ID: '1ToEDBdkEGnRvFoYWdIkORqGHcs8AlotL',   // thư mục Jira KAT (file CSV theo quý / hằng ngày)
  GIO_CHAY: 11,
  PHUT_CHAY: 30,
  KHOA_DA_DOC: 'JIRA_FILE_DA_DOC',
};

// Chỉ đếm ticket CSKH: KTS-… (Bug / Support / Case cũ) và PST-… (Case từ Q4/2026, file "BS case").
// Issue của dự án Dev (KVEIN-…, KAT-…) có trong file xuất chỉ là bản bên Dev → bỏ qua.
const JIRA_BO_DU_AN = /^(KVEIN|KAT)-\d+$/;

const JIRA_LOAI = {
  'production bug': 'Bug', 'sub_bug': 'Bug', 'bug': 'Bug',
  'support': 'Support', 'sub_support': 'Support',
  'new feature': 'Case', 'sub_case': 'Case', 'case': 'Case',
  'incident': 'Bug',   // Sự cố: rất hiếm (cả năm 2026 có 1) → tính vào Bug
};

// Trạng thái xử lý (so sánh sau chuanHoa_): Từ chối trước, rồi Đã xong (thêm 2 trạng thái tạm coi như xong), còn lại Đang treo
const JIRA_TU_CHOI = ['rejected', 'invalid', 'duplicated', 'duplicate'];
const JIRA_XONG_THEM = ['waiting for customer', 'da xu ly tam'];

// Nhóm vấn đề Bug / Support – xét theo thứ tự, gặp nhóm đầu tiên khớp thì dừng
const JIRA_NHOM_VAN_DE = [
  ['CQT từ chối / dữ liệu không hợp lệ', /cqt (tu choi|bao loi|khong chap nhan)|tu choi|khong hop le|khong duy nhat|sai dinh dang|dinh dang du lieu|ma loi|loi \d{3}/],
  ['Treo trạng thái / chưa nhận phản hồi CQT', /treo trang thai|treo hoa don|bi treo|kiem tra trang thai|dong bo trang thai|trang thai (cqt|da gui|cho)|chua (co|nhan) (ma|phan hoi|ket qua)|chay lai/],
  ['Lỗi phát hành HĐĐT', /loi phat hanh|phat hanh (loi|khong|that bai)|khong phat hanh|khong xuat duoc|loi xuat hoa don/],
  ['HĐ điều chỉnh / thay thế / hủy', /thay the|dieu chinh|huy hoa don|xoa bo|giai trinh/],
  ['Tờ khai thuế / kê khai', /to khai|ke khai|nop to|htkk|\bobd\b|quyet toan|thue mon bai|le phi/],
  ['Sổ doanh thu / sổ kế toán lệch', /so doanh thu|so ke toan|lech so|so sach|\bs1a|\bs2a|bao cao doanh thu|doanh thu/],
  ['Chữ ký số', /chu ky so|\bcks\b|ky so|token|chung thu|smartca|ky tu xa/],
  ['Đồng bộ / kết nối', /dong bo|ket noi|hoa don dau vao|lien ket|tich hop|\bapi\b/],
  ['Hiển thị sai / không hiển thị', /hien thi|khong thay|khong load|giao dien/],
  ['Hàng hóa / tiền / thuế suất', /hang hoa|tong tien|thue suat|gia tri|so tien|chiet khau|lam tron/],
  ['Tài khoản / đăng ký / cấu hình', /dang ky|tai khoan|mau so|ky hieu|ho so|cau hinh|thiet lap|mat khau|dang nhap|gia han|goi tai nguyen|doi gian hang|gian hang quan ly|tra cuu/],
  // ---- Các luật bổ sung (05/11): chỉ gom lại những ticket trước đây rơi vào "Khác", không đổi các nhóm phía trên ----
  ['Chuyển HĐ nháp / ghi tạm sang HĐĐT', /chuyen (hoa don|hd|hdon|don|nhap|du lieu|hddt)|(hoa don|hd|don) nhap|ghi tam/],
  ['Gửi email / import / xuất file HĐ', /\be ?mail\b|tep (pdf|xml)|file (pdf|xml|nen)|\bxml\b|\bpdf\b|xuat file|tai file|import/],
  ['Thông tin người mua / khách hàng', /khach le|thong tin (khach|nguoi mua|kh\b)|loai khach|mst nguoi mua|ten (khach|nguoi mua)/],
  ['Đồng bộ / kết nối', /\bmisa\b|viettel|vnpt|\bkvs\b|\bkov\b|san tmdt|shopee|tiktok|truyen/],
  ['Tài khoản / đăng ký / cấu hình', /gan (gian hang|gh|mst|tk)|(chuyen|huy|xoa) (tk|tai khoan|gh)|onboard|\bob\b|loai hinh|ngat mst|go (cac )?mst|het han|tai nguyen|hop dong|goi (hddt|hoa don)|thoi han|phan quyen/],
  ['HĐ điều chỉnh / thay thế / hủy', /sai sot/],
  ['Treo trạng thái / chưa nhận phản hồi CQT', /treo|cap ma|chua (duoc )?chap nhan|gui (cqt|thue)/],
  ['Lỗi phát hành HĐĐT', /phat hanh|loi he thong/],
  ['Hiển thị sai / không hiển thị', /load cham|xoay|khong vao duoc|khong xem duoc|khong sua duoc/],
];

// =====================================================================
// 1. CÁC HÀM BẤM CHẠY
// =====================================================================

function kiemTraJira() {
  const ds = docJira_(dsFileJira_());
  Logger.log('Đọc ' + ds.length + ' issue.');
  const dem = (f) => {
    const m = {};
    ds.forEach(x => { const v = f(x); m[v] = (m[v] || 0) + 1; });
    return Object.keys(m).sort((a, b) => m[b] - m[a]).map(k => k + ' ' + m[k]).join(', ');
  };
  const ngay = ds.map(x => x.created_date).sort();
  Logger.log('Khoảng ngày tạo: ' + ngay[0] + ' → ' + ngay[ngay.length - 1]);
  Logger.log('Loại: ' + dem(x => x.kind));
  Logger.log('Sản phẩm: ' + dem(x => x.product));
  Logger.log('Trạng thái: ' + dem(x => x.status_group));
  Logger.log('Nhóm vấn đề (Bug + Support): ' + dem(x => x.topic || '(Case)'));
  Logger.log('✅ Không ghi gì vào Supabase.');
}

function napJiraTatCa() {
  PropertiesService.getScriptProperties().deleteProperty(JIRA.KHOA_DA_DOC);
  dongBoJira_('Nạp Jira KAT (tất cả file)', true);
}

function dongBoJiraHangNgay() {
  dongBoJira_('Jira KAT hằng ngày');
}

function caiLichJira() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'dongBoJiraHangNgay')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('dongBoJiraHangNgay').timeBased().everyDays(1)
    .atHour(JIRA.GIO_CHAY).nearMinute(JIRA.PHUT_CHAY).inTimezone(CAU_HINH.MUI_GIO).create();
  Logger.log('✅ Đã cài lịch: chạy dongBoJiraHangNgay mỗi ngày khoảng ' + JIRA.GIO_CHAY + 'h' + hai_(JIRA.PHUT_CHAY) +
    ' (giờ Việt Nam, Google có thể lệch ±15 phút).');
}

// =====================================================================
// 2. ĐỒNG BỘ
// =====================================================================

/** xoaHet = true (nạp lại tất cả): xóa bảng trước khi ghi để bỏ các issue không còn được đếm (ticket test, bản Dev…) */
function dongBoJira_(nhan, xoaHet) {
  const p = PropertiesService.getScriptProperties();
  const daDoc = JSON.parse(p.getProperty(JIRA.KHOA_DA_DOC) || '{}');
  const chuaDoc = dsFileJira_().filter(f => daDoc[f.getId()] !== f.getLastUpdated().getTime());
  if (!chuaDoc.length) { Logger.log('Không có file Jira mới hoặc vừa sửa – giữ nguyên số cũ.'); return; }
  try {
    const ds = docJira_(chuaDoc);
    const now = new Date().toISOString();
    if (xoaHet && ds.length) supabase_('delete', 'kat_jira_issue?issue_key=neq.__', undefined, 'return=minimal');
    ghiBang_('kat_jira_issue', 'issue_key', ds.map(x => Object.assign({}, x, { updated_at: now })));
    chuaDoc.forEach(f => { daDoc[f.getId()] = f.getLastUpdated().getTime(); });
    p.setProperty(JIRA.KHOA_DA_DOC, JSON.stringify(daDoc));
    const ngay = ds.map(x => x.created_date).sort();
    const msg = nhan + ': ' + chuaDoc.length + ' file, ' + ds.length + ' issue (' + (ngay[0] || '–') + ' → ' + (ngay[ngay.length - 1] || '–') + ')';
    supabase_('post', 'sync_log', [{ report_date: ngay[ngay.length - 1] || null, status: 'success', rows_written: ds.length, message: msg }], 'return=minimal');
    Logger.log('✅ ' + msg);
  } catch (e) {
    Logger.log('❌ LỖI: ' + e.message);
    try {
      supabase_('post', 'sync_log', [{ status: 'error', rows_written: 0, message: (nhan + ': ' + e.message).slice(0, 1000) }], 'return=minimal');
    } catch (e2) { /* bỏ qua */ }
    try {
      MailApp.sendEmail(Session.getEffectiveUser().getEmail(), '[Báo cáo KAT] Đồng bộ Jira → Supabase bị lỗi',
        nhan + ' bị lỗi:\n\n' + e.message + '\n\nMở Apps Script → Executions để xem chi tiết.');
    } catch (e3) { /* bỏ qua */ }
    throw e;
  }
}

/** File CSV trong thư mục, cũ trước – mới sau (file mới đè trạng thái lên file cũ) */
function dsFileJira_() {
  const it = DriveApp.getFolderById(JIRA.FOLDER_ID).getFiles();
  const ds = [];
  while (it.hasNext()) {
    const f = it.next();
    if (f.getMimeType() === MimeType.CSV || /\.csv$/i.test(f.getName())) ds.push(f);
  }
  return ds.sort((a, b) => a.getLastUpdated() - b.getLastUpdated());
}

/** Đọc các file CSV, gộp theo Issue key (file sau thắng), trả về các dòng để ghi */
function docJira_(files) {
  const theoMa = {};
  files.forEach(file => {
    const rows = Utilities.parseCsv(file.getBlob().getDataAsString('UTF-8').replace(/^\uFEFF/, ''));
    if (rows.length < 2) return;
    const head = rows[0].map(h => chuanHoa_(h));
    const cot = ten => head.indexOf(ten);
    const C = {
      loai: cot('issue type'), ma: cot('issue key'), tieuDe: cot('summary'), moTa: cot('description'),
      uuTien: cot('priority'), trangThai: cot('status'), nhomTT: cot('status category'),
      tao: cot('created'), xong: cot('resolved'), doiTT: cot('status category changed'),
      phamVi: head.findIndex(h => h.indexOf('impact scope') >= 0),
    };
    ['loai', 'ma', 'tieuDe', 'trangThai', 'tao'].forEach(k => {
      if (C[k] < 0) throw new Error('File "' + file.getName() + '" thiếu cột ' + k + '. Xuất lại từ Jira với đủ cột.');
    });
    const cotLienKet = head.map((h, i) => (h.indexOf('issue link') >= 0 ? i : -1)).filter(i => i >= 0);
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const ma = String(row[C.ma] || '').trim();
      if (!ma) continue;
      // Dòng của dự án Dev (KVEIN-… / KAT-…) là bản bên Dev của chính ticket CSKH (KTS-… / PST-…) → bỏ để không đếm 2 lần
      if (JIRA_BO_DU_AN.test(ma)) continue;
      const tao = docNgayJira_(row[C.tao]);
      if (!tao) continue;
      const loaiGoc = String(row[C.loai] || '').trim();
      const kind = JIRA_LOAI[loaiGoc.toLowerCase()] || 'Support';
      let dev = '';
      cotLienKet.some(i => { const m = String(row[i] || '').match(/\b(KVEIN|KAT)-\d+/); if (m) dev = m[0]; return !!m; });
      const tieuDe = String(row[C.tieuDe] || '');
      // Ticket tạo thử / tạo nhầm (vd "Tùng test", "TẠO NHẦM") → không đếm
      const tdChuan = chuanHoa_(tieuDe);
      if (tdChuan.length < 25 && /\btest\b|tao nham/.test(tdChuan)) continue;
      const moTa = C.moTa >= 0 ? String(row[C.moTa] || '') : '';
      const nhomTT = C.nhomTT >= 0 ? String(row[C.nhomTT] || '').trim() : '';
      const xong = C.xong >= 0 ? docNgayJira_(row[C.xong]) : null;
      const doiTT = C.doiTT >= 0 ? docNgayJira_(row[C.doiTT]) : null;
      const phamVi = C.phamVi >= 0 ? Number(row[C.phamVi]) : NaN;
      const tt = chuanHoa_(row[C.trangThai]);
      const nhom = JIRA_TU_CHOI.indexOf(tt) >= 0 ? 'Từ chối'
        : (nhomTT ? chuanHoa_(nhomTT) === 'done' : !!xong) || JIRA_XONG_THEM.indexOf(tt) >= 0 ? 'Đã xong' : 'Đang treo';
      theoMa[ma] = {
        issue_key: ma,
        issue_type: loaiGoc,
        kind,
        product: /^KVEIN-/.test(dev) ? 'KVE' : /^KAT-/.test(dev) ? 'HKD' : 'Khác',
        dev_key: dev || null,
        priority: C.uuTien >= 0 ? String(row[C.uuTien] || '').trim() || null : null,
        status: String(row[C.trangThai] || '').trim() || null,
        status_category: nhomTT || null,
        status_group: nhom,
        is_open: nhom === 'Đang treo',
        created_at: tao.ngay + ' ' + tao.gio,
        created_date: tao.ngay,
        resolved_at: xong ? xong.ngay + ' ' + xong.gio : null,
        changed_at: doiTT ? doiTT.ngay + ' ' + doiTT.gio : null,
        impact_scope: isFinite(phamVi) && String(row[C.phamVi]).trim() !== '' ? phamVi : null,
        topic: kind === 'Case' ? null : nhomVanDeJira_(tieuDe, moTa),
        service: nhomNoiDungKAT_({ tieuDe: tieuDe, moTa: moTa, ai: '' }),
        feature_title: kind === 'Case' ? tieuDeTinhNang_(tieuDe) : null,
      };
    }
  });
  return Object.keys(theoMa).map(k => theoMa[k]);
}

function nhomVanDeJira_(tieuDe, moTa) {
  const s = chuanHoa_(tieuDe + ' ' + String(moTa).slice(0, 600));
  for (const [ten, re] of JIRA_NHOM_VAN_DE) if (re.test(s)) return ten;
  return 'Khác';
}

/**
 * Bỏ phần đầu tiêu đề chứa mã ticket / tên gian hàng, gọn còn 200 ký tự:
 *   "[TT9111998] - [Đề xuất - banhcanh] Đề xuất …" → "Đề xuất …"
 *   "[TT9072738] - shopmepi - chỉ ghi nhận …"      → "chỉ ghi nhận …"
 */
function tieuDeTinhNang_(s) {
  let t = String(s || '').replace(/\\([\[\]_*>-])/g, '$1').trim();
  const ngoac = [];
  for (let i = 0; i < 3; i++) {
    t = t.replace(/^\s*[\[{(]([^\]})]*)[\]})]\s*[-:–|]?\s*/, (m, g) => { ngoac.push(g); return ''; });
  }
  t = t.replace(/^[a-z0-9._]+\s*[-–:]\s+/, '');   // tên gian hàng viết liền không ngoặc
  t = t.replace(/\s*\]+\s*$/, '').trim();
  // Phần còn lại trống / chung chung ("Hỗ trợ case", "check mst", "KTS-123") → lấy nội dung trong ngoặc dài nhất,
  // bỏ đoạn tên gian hàng (chữ viết liền không dấu cách) và tiền tố sản phẩm "KVE -"
  if (t.length < 15 || /^(ho tro case|check|kiem tra|KTS-\d+$)/i.test(chuanHoa_(t)) || /^[A-Z]+-\d+$/.test(t)) {
    const dai = ngoac.map(g => g
      .split(/\s*[-–]\s*/).filter(p => !/^[a-z0-9._]+$/i.test(p.trim()) || /\s/.test(p.trim())).join(' - ')
      .replace(/^\s*(KVE|HDDT|HĐĐT|KV einvoice)\s*[-:]?\s*/i, '').trim())
      .sort((a, b) => b.length - a.length)[0] || '';
    if (dai.length > t.length) t = dai;
  }
  if (/^[A-Z]+-\d+$/.test(t)) t = '';
  return t ? t.charAt(0).toUpperCase() + t.slice(1, 200) : null;
}

/** "29/Oct/26 11:05 AM" → { ngay: '2026-10-29', gio: '11:05:00' } */
function docNgayJira_(s) {
  const m = String(s || '').trim().match(/^(\d{1,2})\/([A-Za-z]{3})\/(\d{2,4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!m) return null;
  const THANG = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
  const mo = THANG[m[2].toLowerCase()];
  if (!mo) return null;
  const y = m[3].length === 2 ? '20' + m[3] : m[3];
  let h = Number(m[4]);
  const ap = (m[6] || '').toUpperCase();
  if (ap === 'PM' && h < 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return { ngay: y + '-' + hai_(mo) + '-' + hai_(m[1]), gio: hai_(h) + ':' + m[5] + ':00' };
}
