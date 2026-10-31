/**
 * =====================================================================
 *  ĐỒNG BỘ DATA CALL 3CX  →  SUPABASE   (Báo cáo Call Center 1900 6522)
 * =====================================================================
 *  Mỗi sáng đọc sheet "Call in" và "Miss call" trong file "Thang M"
 *  (thư mục data 3CX trên Google Drive), tổng hợp theo ngày rồi ghi vào
 *  các bảng call_* trên Supabase. Không ghi số điện thoại khách hàng.
 *
 *  CÁC HÀM BẠN SẼ BẤM CHẠY (chọn tên hàm ở thanh trên cùng rồi bấm Run):
 *    1. kiemTraKetNoi     – kiểm tra kết nối Supabase và đọc thử file tháng này
 *    2. chayThuMotNgay    – tính thử 1 ngày, chỉ hiện kết quả, KHÔNG ghi gì
 *    3. napDuLieuThang    – nạp toàn bộ 1 tháng vào Supabase (dùng 1 lần)
 *    4. caiLichTuDong     – cài lịch chạy tự động mỗi sáng
 *  Hàm dongBoHangNgay là hàm lịch tự động gọi – không cần bấm tay.
 *
 *  Thông tin kết nối KHÔNG để trong code: nhập ở
 *  Project Settings → Script Properties:  SUPABASE_URL  và  SUPABASE_KEY
 * =====================================================================
 */

const CAU_HINH = {
  FOLDER_ID: '14gIVWTn2Z_XruwgXfN-Ui65ucoBu8GDU', // thư mục chứa file "Thang 10", "Thang 11"…
  SHEET_CALL_IN: 'Call in',
  SHEET_MISS: 'Miss call',
  NGUONG_SL_GIAY: 20,          // trả lời trong 20 giây (chờ queue + đổ chuông) = đạt SL
  NGUONG_NHO_GIAY: 5,          // chỉ tính là nhỡ khi chờ trong queue > 5 giây (vẫn tính vào tổng cuộc đến)
  SO_NGAY_DONG_BO_LAI: 3,      // mỗi sáng đồng bộ lại 3 ngày gần nhất (bắt kịp data dán muộn)
  GIO_CHAY: 9,                 // giờ chạy tự động mỗi sáng
  PHUT_CHAY: 30,               // phút chạy (Google chạy lệch ±15 phút) → khoảng 9h30
  MUI_GIO: 'Asia/Ho_Chi_Minh',
  TIEN_TO_AI: '84000',         // 8400001–8400007 = tổng đài AI trả lời
  SITE_OUTSOURCE: ['OUT'],     // "DVKH OUT" = OS Partner; các site khác = Inhouse
  QUEUE_AI: 'VOICE_AI_BOT',    // nhóm hàng đợi chung cho cuộc do AI nhận
  NGUON: 'Tự động (3CX)',
  KICH_THUOC_LO: 20000,        // số dòng đọc mỗi lần

  NGAY_CHAY_THU: '2026-10-01', // ngày dùng cho chayThuMotNgay (yyyy-mm-dd)
  THANG_NAP: '2026-10',        // tháng dùng cho napDuLieuThang (yyyy-mm)
};

// Tên cột (viết không dấu, chữ thường) và vị trí dự phòng (A = 0) nếu không thấy tiêu đề
const COT_CALL_IN = {
  phone:     { ten: ['dt', 'so dien thoai', 'nguoi goi'], duPhong: 1 },
  agent:     { ten: ['nhan vien tiep nhan'],               duPhong: 2 },
  queue:     { ten: ['queue'],                             duPhong: 3 },
  time:      { ten: ['thoi gian goi'],                     duPhong: 4 },
  wait:      { ten: ['cho trong queue'],                   duPhong: 6 },
  ring:      { ten: ['do chuong'],                         duPhong: 7 },
  talk:      { ten: ['dam thoai'],                         duPhong: 8 },
  status:    { ten: ['tinh trang'],                        duPhong: 9 },
  direction: { ten: ['direction'],                         duPhong: 10 },
};
const COT_MISS = {
  phone:  { ten: ['nguoi goi', 'dt', 'so dien thoai'], duPhong: 1 },
  queue:  { ten: ['queue'],                            duPhong: 3 },
  time:   { ten: ['thoi gian goi'],                    duPhong: 4 },
  wait:   { ten: ['cho trong queue', 'thoi gian cho'], duPhong: null }, // bắt buộc có tiêu đề
  status: { ten: ['tinh trang'],                       duPhong: 8 },
};
const DOI_NGU = ['Inhouse', 'OS Partner', 'Voice AI Bot'];

// =====================================================================
// 1. CÁC HÀM BẤM CHẠY
// =====================================================================

function kiemTraKetNoi() {
  const cfg = layKetNoi_();
  Logger.log('① Supabase: ' + cfg.url);
  const kq = supabase_('get', 'kpi_targets?select=code&limit=20');
  Logger.log('   ✔ Kết nối được, đọc thấy ' + kq.length + ' mục tiêu KPI.');

  const hom = homNay_();
  const [nam, thang] = hom.split('-').map(Number);
  const file = timFileThang_(nam, thang);
  Logger.log('② File tháng này: "' + file.getName() + '" (cập nhật ' + file.getLastUpdated() + ')');
  const ss = SpreadsheetApp.openById(file.getId());
  [[CAU_HINH.SHEET_CALL_IN, COT_CALL_IN], [CAU_HINH.SHEET_MISS, COT_MISS]].forEach(([ten, spec]) => {
    const sh = timSheet_(ss, ten);
    const header = sh.getRange(1, 1, 1, sh.getLastColumn()).getDisplayValues()[0];
    const cot = timCot_(header, spec);
    const mau = sh.getLastRow() >= 2 ? sh.getRange(2, 1, 1, sh.getLastColumn()).getDisplayValues()[0] : [];
    Logger.log('③ Sheet "' + sh.getName() + '": ' + (sh.getLastRow() - 1) + ' dòng dữ liệu');
    Object.keys(spec).forEach(k => {
      const i = cot.viTri[k];
      Logger.log('   ' + (cot.thay[k] ? '✔' : '⚠ dùng vị trí dự phòng') + '  ' + k + ' → cột ' +
        tenCot_(i) + ' "' + (header[i] || '') + '"  | ví dụ: ' + (mau[i] || ''));
    });
  });
  Logger.log('✅ Xong. Nếu có dòng ⚠ hoặc lỗi, chụp màn hình gửi lại để kiểm tra.');
}

function chayThuMotNgay() {
  const ngay = CAU_HINH.NGAY_CHAY_THU;
  const kq = tongHopCacNgay_([ngay]);
  const d = kq.ngay[ngay];
  if (!d || d.answered === 0) { Logger.log('Không có dữ liệu ngày ' + ngay); return; }
  const r = taoDongGhi_(ngay, d);
  const tong = r.daily[0];
  Logger.log('===== CHẠY THỬ NGÀY ' + ngay + ' (không ghi vào Supabase) =====');
  Logger.log('Tổng cuộc đến: ' + tong.offered + ' | Đã nghe: ' + tong.answered + ' | Nhỡ (chờ >' +
    CAU_HINH.NGUONG_NHO_GIAY + 's): ' + tong.abandoned + ' | Tỷ lệ nhỡ: ' + phanTram_(tong.abandoned, tong.offered));
  Logger.log('Khách gác máy khi chờ ≤' + CAU_HINH.NGUONG_NHO_GIAY + 's (không tính nhỡ): ' + d.nhoNgan);
  Logger.log('Khách nhỡ cần gọi lại (đã loại trùng, chưa tự gọi lại được nghe): ' + tong.callback_needed);
  r.team.forEach(t => Logger.log('  ' + t.team + ': ' + t.handled + ' cuộc' +
    (t.agents_on_duty ? ', ' + t.agents_on_duty + ' ĐTV' : '') +
    ', SL≤' + CAU_HINH.NGUONG_SL_GIAY + 's ' + phanTram_(t.answered_within_sl, t.handled) +
    ', đàm thoại TB ' + phutGiay_(t.handled ? t.talk_seconds / t.handled : 0)));
  Logger.log('Hàng đợi:');
  r.queue.sort((a, b) => b.offered - a.offered).forEach(q => Logger.log('  ' + q.queue + ': đến ' + q.offered +
    ', nhỡ ' + q.abandoned + ', IH ' + q.handled_inhouse + ', OS ' + q.handled_os + ', AI ' + q.handled_ai));
  Logger.log('Số khung 30 phút có cuộc: ' + r.slot.length + ' | Số ĐTV/máy AI có cuộc: ' + r.agent.length);
  if (d.boQua) Logger.log('Bỏ qua ' + d.boQua + ' dòng (hộp thư thoại / không đọc được thời gian).');
  Logger.log('Cuộc nhỡ theo trạng thái: ' + JSON.stringify(d.trangThaiNho));
}

function napDuLieuThang() {
  const [nam, thang] = CAU_HINH.THANG_NAP.split('-').map(Number);
  const homQua = congNgay_(homNay_(), -1);
  const cacNgay = [];
  for (let n = 1; n <= 31; n++) {
    if (new Date(Date.UTC(nam, thang - 1, n)).getUTCMonth() !== thang - 1) break; // hết tháng
    const ngay = nam + '-' + hai_(thang) + '-' + hai_(n);
    if (ngay > homQua) break;                                                      // không nạp hôm nay
    cacNgay.push(ngay);
  }
  dongBo_(cacNgay, 'Nạp tháng ' + CAU_HINH.THANG_NAP);
}

function dongBoHangNgay() {
  const hom = homNay_();
  const cacNgay = [];
  for (let i = CAU_HINH.SO_NGAY_DONG_BO_LAI; i >= 1; i--) cacNgay.push(congNgay_(hom, -i));
  dongBo_(cacNgay, 'Đồng bộ hằng ngày');
}

function caiLichTuDong() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'dongBoHangNgay')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('dongBoHangNgay').timeBased().everyDays(1)
    .atHour(CAU_HINH.GIO_CHAY).nearMinute(CAU_HINH.PHUT_CHAY).inTimezone(CAU_HINH.MUI_GIO).create();
  Logger.log('✅ Đã cài lịch: chạy dongBoHangNgay mỗi ngày khoảng ' + CAU_HINH.GIO_CHAY + 'h' +
    hai_(CAU_HINH.PHUT_CHAY) + ' (giờ Việt Nam, Google có thể lệch ±15 phút).');
}

// =====================================================================
// 2. ĐỒNG BỘ
// =====================================================================

function dongBo_(cacNgay, nhan) {
  try {
    const kq = tongHopCacNgay_(cacNgay);
    const gom = { daily: [], team: [], queue: [], slot: [], agent: [], dmAgent: [], dmQueue: [] };
    const nhatKy = [];
    cacNgay.forEach(ngay => {
      const d = kq.ngay[ngay];
      if (!d || d.answered === 0) {
        nhatKy.push({ report_date: ngay, status: 'skipped', rows_written: 0, message: nhan + ': chưa có dữ liệu Call in' });
        return;
      }
      const r = taoDongGhi_(ngay, d);
      Object.keys(gom).forEach(k => gom[k].push(...r[k]));
      const t = r.daily[0];
      nhatKy.push({ report_date: ngay, status: 'success',
        rows_written: r.team.length + r.queue.length + r.slot.length + r.agent.length + 1,
        message: nhan + ': đến ' + t.offered + ', nghe ' + t.answered + ', nhỡ ' + t.abandoned +
          (d.nhoNgan ? ', gác máy ≤' + CAU_HINH.NGUONG_NHO_GIAY + 's ' + d.nhoNgan : '') +
          (d.boQua ? ', bỏ qua ' + d.boQua + ' dòng' : '') });
    });
    ghiBang_('agents', 'ext', gopTheoKhoa_(gom.dmAgent, 'ext'), 'ignore');
    ghiBang_('call_queues', 'queue', gopTheoKhoa_(gom.dmQueue, 'queue'), 'ignore');
    ghiBang_('call_daily', 'report_date', gom.daily);
    ghiBang_('call_team_daily', 'report_date,team', gom.team);
    ghiBang_('call_queue_daily', 'report_date,queue', gom.queue);
    ghiBang_('call_timeslot_daily', 'report_date,slot_start', gom.slot);
    ghiBang_('call_agent_daily', 'report_date,ext', gom.agent);
    if (nhatKy.length) supabase_('post', 'sync_log', nhatKy, 'return=minimal');
    nhatKy.forEach(n => Logger.log(n.report_date + ' – ' + n.status + ' – ' + n.message));
  } catch (e) {
    Logger.log('❌ LỖI: ' + e.message);
    try {
      supabase_('post', 'sync_log', [{ status: 'error', rows_written: 0, message: (nhan + ': ' + e.message).slice(0, 1000) }], 'return=minimal');
    } catch (e2) { /* Supabase không truy cập được – bỏ qua */ }
    try {
      MailApp.sendEmail(Session.getEffectiveUser().getEmail(), '[Báo cáo Call] Đồng bộ 3CX → Supabase bị lỗi',
        nhan + ' cho các ngày ' + cacNgay.join(', ') + ' bị lỗi:\n\n' + e.message +
        '\n\nMở Apps Script → Executions để xem chi tiết.');
    } catch (e3) { /* không gửi được mail – bỏ qua */ }
    throw e;
  }
}

/** Đọc file tháng tương ứng với từng ngày, tổng hợp số liệu theo ngày. */
function tongHopCacNgay_(cacNgay) {
  const can = new Set(cacNgay);
  const ketQua = { ngay: {} };
  const theoThang = {};
  cacNgay.forEach(n => { (theoThang[n.slice(0, 7)] = theoThang[n.slice(0, 7)] || []).push(n); });
  Object.keys(theoThang).forEach(thang => {
    const [y, m] = thang.split('-').map(Number);
    const ss = SpreadsheetApp.openById(timFileThang_(y, m).getId());
    docSheet_(ss, CAU_HINH.SHEET_CALL_IN, COT_CALL_IN, get => {
      const tg = docThoiGian_(get('time'));
      if (!tg || !can.has(tg.ngay)) return;
      themCuocNghe_(layNgay_(ketQua, tg.ngay), tg, get);
    });
    docSheet_(ss, CAU_HINH.SHEET_MISS, COT_MISS, get => {
      const tg = docThoiGian_(get('time'));
      if (!tg || !can.has(tg.ngay)) return;
      themCuocNho_(layNgay_(ketQua, tg.ngay), tg, get);
    });
  });
  return ketQua;
}

// =====================================================================
// 3. TỔNG HỢP (không phụ thuộc Google – có thể chạy thử độc lập)
// =====================================================================

function taoNgayMoi_() {
  const team = {};
  DOI_NGU.forEach(t => { team[t] = { handled: 0, sl: 0, talk: 0, ext: {} }; });
  return { answered: 0, abandoned: 0, nhoNgan: 0, talk: 0, boQua: 0, team, queue: {}, slot: {}, agent: {},
           ngheLuc: {}, nhoCuoi: {}, trangThaiNho: {} };
}

function layNgay_(ketQua, ngay) {
  return ketQua.ngay[ngay] = ketQua.ngay[ngay] || taoNgayMoi_();
}

function themCuocNghe_(d, tg, get) {
  const status = chuanHoa_(get('status'));
  if (status && status.indexOf('answer') < 0) return;              // chỉ tính cuộc Answered
  const dir = chuanHoa_(get('direction'));
  if (dir && dir.indexOf('inbound') < 0) return;                   // chỉ tính cuộc gọi vào
  const agentRaw = String(get('agent') || '').trim();
  const queueRaw = String(get('queue') || '').trim();
  if (/voicemail/i.test(agentRaw) || /voicemail/i.test(queueRaw)) { d.boQua++; return; }

  const q = docQueue_(queueRaw);
  const laAI = q.ext.indexOf(CAU_HINH.TIEN_TO_AI) === 0 || agentRaw.indexOf(CAU_HINH.TIEN_TO_AI) === 0;
  let nv, team;
  if (laAI) {
    const ext = q.ext || agentRaw;
    nv = { ten: 'Voice AI ' + ext, site: 'AI', ext };
    team = 'Voice AI Bot';
  } else {
    nv = docNhanVien_(agentRaw);
    if (!nv) { d.boQua++; return; }
    team = CAU_HINH.SITE_OUTSOURCE.some(s => nv.site === s || nv.site.indexOf(s + ' ') === 0) ? 'OS Partner' : 'Inhouse';
  }
  const cho = docGiay_(get('wait')) + docGiay_(get('ring'));
  const datSL = cho <= CAU_HINH.NGUONG_SL_GIAY ? 1 : 0;
  const talk = docGiay_(get('talk'));

  d.answered++; d.talk += talk;
  const t = d.team[team]; t.handled++; t.sl += datSL; t.talk += talk; t.ext[nv.ext] = 1;

  const qKey = laAI ? CAU_HINH.QUEUE_AI : (q.ten || '(không rõ)');
  const qq = d.queue[qKey] = d.queue[qKey] || { ext: laAI ? '' : q.ext, offered: 0, abandoned: 0, ih: 0, os: 0, ai: 0, sl: 0, talk: 0 };
  qq.offered++; qq.sl += datSL; qq.talk += talk;
  if (team === 'Inhouse') qq.ih++; else if (team === 'OS Partner') qq.os++; else qq.ai++;

  const s = layKhung_(d, tg); s.offered++; s.answered++; if (laAI) s.ai++;

  const a = d.agent[nv.ext] = d.agent[nv.ext] || { ten: nv.ten, team, site: nv.site, handled: 0, sl: 0, talk: 0 };
  a.handled++; a.sl += datSL; a.talk += talk;

  const sdt = String(get('phone') || '').replace(/\D/g, '');
  if (sdt) (d.ngheLuc[sdt] = d.ngheLuc[sdt] || []).push(tg.phutTrongNgay);
}

function themCuocNho_(d, tg, get) {
  const st = String(get('status') || '').trim() || '(trống)';
  d.trangThaiNho[st] = (d.trangThaiNho[st] || 0) + 1;
  // Khách gác máy khi chờ ≤ 5 giây: vẫn tính vào tổng cuộc đến và khách cần gọi lại, nhưng không tính là nhỡ
  const laNho = docGiay_(get('wait')) > CAU_HINH.NGUONG_NHO_GIAY ? 1 : 0;
  if (laNho) d.abandoned++; else d.nhoNgan++;
  const q = docQueue_(String(get('queue') || '').trim());
  const laAI = q.ext.indexOf(CAU_HINH.TIEN_TO_AI) === 0;           // nhỡ ở máy AI 84000xx
  const qKey = laAI ? CAU_HINH.QUEUE_AI : (q.ten || '(không rõ)');
  const qq = d.queue[qKey] = d.queue[qKey] || { ext: laAI ? '' : q.ext, offered: 0, abandoned: 0, ih: 0, os: 0, ai: 0, sl: 0, talk: 0 };
  qq.offered++; qq.abandoned += laNho;
  const s = layKhung_(d, tg); s.offered++; s.abandoned += laNho;
  const sdt = String(get('phone') || '').replace(/\D/g, '');
  if (sdt) d.nhoCuoi[sdt] = Math.max(d.nhoCuoi[sdt] || 0, tg.phutTrongNgay);
}

function layKhung_(d, tg) {
  const k = hai_(tg.gio) + ':' + (tg.phut < 30 ? '00' : '30') + ':00';
  return d.slot[k] = d.slot[k] || { offered: 0, answered: 0, ai: 0, abandoned: 0 };
}

/** Chuyển số liệu 1 ngày thành các dòng ghi vào từng bảng Supabase. */
function taoDongGhi_(ngay, d) {
  const now = new Date().toISOString();
  const src = CAU_HINH.NGUON;
  // Khách nhỡ cần gọi lại: số khác nhau bị nhỡ, và sau lần nhỡ cuối không có cuộc nào được nghe
  let canGoiLai = 0;
  Object.keys(d.nhoCuoi).forEach(sdt => {
    const nghe = d.ngheLuc[sdt] || [];
    if (!nghe.some(p => p >= d.nhoCuoi[sdt])) canGoiLai++;
  });
  const daily = [{ report_date: ngay, offered: d.answered + d.abandoned + d.nhoNgan, answered: d.answered,
    abandoned: d.abandoned, callback_needed: canGoiLai, talk_seconds: d.talk, source: src, updated_at: now }];
  const team = DOI_NGU.map(t => ({ report_date: ngay, team: t,
    agents_on_duty: t === 'Voice AI Bot' ? null : Object.keys(d.team[t].ext).length,
    handled: d.team[t].handled, answered_within_sl: d.team[t].sl, talk_seconds: d.team[t].talk,
    source: src, updated_at: now }));
  const queue = Object.keys(d.queue).map(k => {
    const q = d.queue[k];
    return { report_date: ngay, queue: k, offered: q.offered, abandoned: q.abandoned, handled_inhouse: q.ih,
      handled_os: q.os, handled_ai: q.ai, answered_within_sl: q.sl, handle_seconds: q.talk, source: src, updated_at: now };
  });
  const slot = Object.keys(d.slot).sort().map(k => ({ report_date: ngay, slot_start: k,
    offered: d.slot[k].offered, answered: d.slot[k].answered, answered_ai: d.slot[k].ai,
    abandoned: d.slot[k].abandoned, updated_at: now }));
  const agent = Object.keys(d.agent).map(ext => {
    const a = d.agent[ext];
    return { report_date: ngay, ext, agent_name: a.ten, team: a.team, handled: a.handled,
      answered_within_sl: a.sl, talk_seconds: a.talk, source: src, updated_at: now };
  });
  const dmAgent = Object.keys(d.agent).map(ext => ({ ext, agent_name: d.agent[ext].ten,
    team: d.agent[ext].team, site: d.agent[ext].site }));
  const dmQueue = Object.keys(d.queue).map(k => ({ queue: k, queue_ext: d.queue[k].ext || null,
    display_name: k === CAU_HINH.QUEUE_AI ? 'Voice AI Bot' : k.replace(/^CS_/, '').replace(/_/g, ' ') }));
  return { daily, team, queue, slot, agent, dmAgent, dmQueue };
}

// =====================================================================
// 4. ĐỌC DỮ LIỆU
// =====================================================================

function docThoiGian_(s) {
  s = String(s || '').trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})[ T]+(\d{1,2}):(\d{2})/);
  let y, mo, d, h, mi;
  if (m) { y = m[1]; mo = m[2]; d = m[3]; h = m[4]; mi = m[5]; }
  else {
    m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})[ T]+(\d{1,2}):(\d{2})/);   // dd/mm/yyyy hh:mm
    if (!m) return null;
    d = m[1]; mo = m[2]; y = m[3]; h = m[4]; mi = m[5];
  }
  return { ngay: y + '-' + hai_(mo) + '-' + hai_(d), gio: Number(h), phut: Number(mi),
           phutTrongNgay: Number(h) * 60 + Number(mi) };
}

function docGiay_(s) {
  s = String(s || '').trim();
  if (!s) return 0;
  const p = s.split(':').map(Number);
  if (p.some(isNaN)) return 0;
  if (p.length === 3) return Math.round(p[0] * 3600 + p[1] * 60 + p[2]);
  if (p.length === 2) return Math.round(p[0] * 60 + p[1]);
  return Math.round(p[0]);
}

/** "Nguyen Hoang Hai, DVKH OUT (8641)" → { ten, site: 'OUT', ext: '8641' } */
function docNhanVien_(s) {
  s = String(s || '').trim();
  if (!s) return null;
  let m = s.match(/^(.*?),\s*DVKH\s+(.+?)\s*\((\d+)\)\s*$/i);
  if (m) return { ten: m[1].trim(), site: m[2].trim().toUpperCase(), ext: m[3] };
  m = s.match(/^(.*?)\s*\((\d+)\)\s*$/);
  if (m) return { ten: m[1].replace(/,\s*$/, '').trim(), site: '', ext: m[2] };
  return { ten: s, site: '', ext: s };
}

/** "CS_Line4_HDDT_CKS (8009)" → { ten: 'CS_Line4_HDDT_CKS', ext: '8009' } */
function docQueue_(s) {
  s = String(s || '').trim();
  const m = s.match(/^(.*?)\s*\((\d+)\)\s*$/);
  if (m) return { ten: m[1].trim(), ext: m[2] };
  return { ten: s, ext: /^\d+$/.test(s) ? s : '' };
}

function chuanHoa_(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd').toLowerCase().replace(/\s+/g, ' ').trim();
}

function timCot_(header, spec) {
  const chuan = header.map(chuanHoa_);
  const viTri = {}, thay = {};
  Object.keys(spec).forEach(k => {
    let i = -1;
    spec[k].ten.some(ten => (i = chuan.indexOf(ten)) >= 0);
    thay[k] = i >= 0;
    if (i < 0 && spec[k].duPhong === null) {
      throw new Error('Không thấy cột "' + spec[k].ten[0] + '" trong dòng tiêu đề. Kiểm tra lại tên cột trong sheet.');
    }
    viTri[k] = i >= 0 ? i : spec[k].duPhong;
  });
  return { viTri, thay };
}

function timSheet_(ss, ten) {
  const sh = ss.getSheets().find(s => chuanHoa_(s.getName()) === chuanHoa_(ten));
  if (!sh) throw new Error('Không thấy sheet "' + ten + '" trong file ' + ss.getName());
  return sh;
}

function docSheet_(ss, tenSheet, spec, xuLy) {
  const sh = timSheet_(ss, tenSheet);
  const last = sh.getLastRow();
  if (last < 2) return;
  const header = sh.getRange(1, 1, 1, sh.getLastColumn()).getDisplayValues()[0];
  const cot = timCot_(header, spec);
  const ds = Object.values(cot.viTri);
  const c0 = Math.min.apply(null, ds), c1 = Math.max.apply(null, ds);
  for (let r = 2; r <= last; r += CAU_HINH.KICH_THUOC_LO) {
    const n = Math.min(CAU_HINH.KICH_THUOC_LO, last - r + 1);
    const vals = sh.getRange(r, c0 + 1, n, c1 - c0 + 1).getDisplayValues();
    vals.forEach(row => xuLy(k => row[cot.viTri[k] - c0]));
  }
}

function timFileThang_(nam, thang) {
  const tenHopLe = ['thang ' + thang, 'thang ' + hai_(thang), 'thang ' + thang + ' ' + nam,
    'thang ' + hai_(thang) + ' ' + nam, 'thang ' + thang + '/' + nam, 'thang ' + hai_(thang) + '/' + nam,
    'thang ' + thang + '.' + nam, 'thang ' + hai_(thang) + '.' + nam];
  const it = DriveApp.getFolderById(CAU_HINH.FOLDER_ID).getFilesByType(MimeType.GOOGLE_SHEETS);
  const thay = [];
  while (it.hasNext()) {
    const f = it.next();
    if (tenHopLe.indexOf(chuanHoa_(f.getName())) >= 0) thay.push(f);
  }
  if (!thay.length) throw new Error('Không tìm thấy file "Thang ' + thang + '" (năm ' + nam + ') trong thư mục data 3CX.');
  thay.sort((a, b) => b.getLastUpdated() - a.getLastUpdated());
  return thay[0];
}

// =====================================================================
// 5. SUPABASE
// =====================================================================

function layKetNoi_() {
  const p = PropertiesService.getScriptProperties();
  const url = String(p.getProperty('SUPABASE_URL') || '').trim().replace(/\/+$/, '');
  const key = String(p.getProperty('SUPABASE_KEY') || '').trim();
  if (!url || !key) throw new Error('Chưa nhập SUPABASE_URL hoặc SUPABASE_KEY trong Project Settings → Script Properties.');
  if (!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url))
    throw new Error('SUPABASE_URL chưa đúng dạng https://<mã-project>.supabase.co (đang là: ' + url + ')');
  return { url, key };
}

function supabase_(method, path, body, prefer) {
  const cfg = layKetNoi_();
  const headers = { apikey: cfg.key };
  if (cfg.key.indexOf('sb_') !== 0) headers.Authorization = 'Bearer ' + cfg.key; // khóa kiểu cũ (service_role)
  if (prefer) headers.Prefer = prefer;
  const opt = { method, headers, muteHttpExceptions: true, contentType: 'application/json' };
  if (body !== undefined) opt.payload = JSON.stringify(body);
  const res = UrlFetchApp.fetch(cfg.url + '/rest/v1/' + path, opt);
  const code = res.getResponseCode();
  const text = res.getContentText();
  if (code >= 300) throw new Error('Supabase báo lỗi ' + code + ' khi ghi "' + path.split('?')[0] + '": ' + text.slice(0, 400));
  return text ? JSON.parse(text) : null;
}

/** Ghi theo lô; 'merge' = cập nhật cột của script, giữ nguyên cột nhập tay; 'ignore' = chỉ thêm dòng mới. */
function ghiBang_(bang, khoa, rows, cheDo) {
  for (let i = 0; i < rows.length; i += 500) {
    supabase_('post', bang + '?on_conflict=' + khoa, rows.slice(i, i + 500),
      'resolution=' + (cheDo === 'ignore' ? 'ignore' : 'merge') + '-duplicates,return=minimal');
  }
}

// =====================================================================
// 6. TIỆN ÍCH
// =====================================================================

function hai_(n) { return ('0' + Number(n)).slice(-2); }
function homNay_() { return Utilities.formatDate(new Date(), CAU_HINH.MUI_GIO, 'yyyy-MM-dd'); }
function congNgay_(ngay, so) {
  const [y, m, d] = ngay.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + so));
  return t.getUTCFullYear() + '-' + hai_(t.getUTCMonth() + 1) + '-' + hai_(t.getUTCDate());
}
function gopTheoKhoa_(rows, khoa) {
  const m = {};
  rows.forEach(r => { m[r[khoa]] = r; });
  return Object.keys(m).map(k => m[k]);
}
function phanTram_(a, b) { return b ? (100 * a / b).toFixed(1) + '%' : '–'; }
function phutGiay_(s) { s = Math.round(s); return Math.floor(s / 60) + 'm' + hai_(s % 60) + 's'; }
function tenCot_(i) { let s = ''; i++; while (i > 0) { const r = (i - 1) % 26; s = String.fromCharCode(65 + r) + s; i = Math.floor((i - 1) / 26); } return s; }
