# Báo cáo CSKH KiotViet – Bối cảnh dự án (bàn giao từ Claude.ai, 30/10/2026)

## Làm việc với người dùng
- Người dùng: quản lý CSKH (tài khoản Google yendao@kiotviet.com), KHÔNG chuyên kỹ thuật.
- Trả lời bằng tiếng Việt, hướng dẫn từng bước một, tránh thuật ngữ; bước nào người dùng phải tự bấm trên giao diện thì chỉ rõ nút/menu.
- Hỏi trước khi: chạy lệnh thay đổi dữ liệu/cấu trúc trên Supabase, push/deploy, xóa file.
- Không bao giờ yêu cầu dán khóa secret Supabase vào chat hay commit vào repo.
- Code từng được sửa trong Google AI Studio. Từ khi chuyển sang Claude Code, chỉ sửa code ở một nơi để tránh ghi đè.

## Mục tiêu
Trang báo cáo vận hành Call Center hotline 1900 6522 (repo này, deploy trên Vercel) hiển thị số liệu THẬT, tự cập nhật hằng ngày, có đối chiếu kỳ này – kỳ trước. Hiện màn Call Center vẫn dùng số giả.

## Luồng dữ liệu (đã chạy được)
3CX → file Google Sheet "Thang M" (vd "Thang 10") → Apps Script → Supabase → web (repo này)

- File nguồn: thư mục Drive `14gIVWTn2Z_XruwgXfN-Ui65ucoBu8GDU`, chủ sở hữu yendao@kiotviet.com. Mỗi tháng 1 file tên "Thang M". Sheet dùng: `Call in` (~140k cuộc đã nghe/tháng) và `Miss call` (~16k cuộc nhỡ/tháng). Người dùng dán data 3CX vào hằng ngày.
- Apps Script "Đồng bộ 3CX Supabase" (chạy bằng tài khoản yendao@kiotviet.com). Mã nguồn: `dong_bo_3cx_supabase.gs`. Khóa Supabase lưu trong Script Properties (SUPABASE_URL, SUPABASE_KEY), không nằm trong code. Hàm `dongBoHangNgay` chạy ~9h30 sáng (±15 phút), đồng bộ lại 3 ngày gần nhất; upsert theo khóa chính nên chạy lại không trùng; lỗi thì gửi email.
- Supabase: project "KiotViet CSKH", ref `hlqtnsjdfvdbfndjmfng`, URL `https://hlqtnsjdfvdbfndjmfng.supabase.co`, region ap-northeast-2 (Seoul), gói Free. Cấu trúc bảng: `buoc1_tao_bang_supabase.sql`.

## Trạng thái (30/10/2026)
- [x] Tạo 9 bảng + bật RLS (chưa có policy nào → web chưa đọc được).
- [x] Apps Script đã kiểm tra: ngày 01/10 khớp sheet TH của người dùng (đến 3.398, nghe 3.234, nhỡ 164; Inhouse 1.345, OS Partner 1.269, Voice AI 620).
- [x] Đã nạp 01/10–29/10: call_daily 29 dòng, call_team_daily 87, call_agent_daily ~2.2k, call_queue_daily ~240, call_timeslot_daily ~880, sync_log 29.
- [x] Đã cài lịch tự động (`caiLichTuDong`): dongBoHangNgay chạy mỗi ngày ~9h30 (Apps Script → Triggers). Kiểm tra lần chạy ở Apps Script → Executions hoặc bảng sync_log.
- [ ] BƯỚC 5: nối web với Supabase (xem cuối file).

## Quy tắc nghiệp vụ đã chốt (script đang áp dụng)
- Tổng cuộc đến = cuộc Answered/Inbound trong `Call in` (bỏ hộp thư thoại "Voicemail", 1–4 cuộc/ngày) + mọi dòng `Miss call`.
- Đội ngũ lấy từ cột "Nhân Viên Tiếp Nhận" dạng `Tên, DVKH <SITE> (<EXT>)`: SITE `OUT` → **OS Partner**; HNI, HCM, DNG, CTO, KAT, `HNI CTV` → **Inhouse** (CTV đang tính Inhouse – có thể tách sau).
- Máy **8400001–8400007 = tổng đài AI trả lời → Voice AI Bot**, tính là đã phục vụ. Cuộc AI không có thời gian đàm thoại trong 3CX; đa số chờ trong queue ~30 giây rồi mới sang AI. Cuộc nhỡ ở máy 84000xx gộp vào hàng đợi `VOICE_AI_BOT`.
- SL: (Chờ trong queue + Đổ chuông) ≤ 20 giây, lưu theo đội (`call_team_daily.answered_within_sl`).
- `Miss call` có 3 trạng thái ("Miss Call(Abandoned Queue)", "NoAnswer (Abandoned Queue)", "NoAnswer") – đều tính là nhỡ.
- `callback_needed` = số điện thoại khác nhau bị nhỡ trong ngày mà sau lần nhỡ cuối không có cuộc nào được nghe.
- Khung giờ: 30 phút (`call_timeslot_daily.slot_start` = 09:00, 09:30…). Tổng đài chạy ~7h–22h.
- Không lưu số điện thoại khách ở Supabase.
- Cột 3CX không có → để NULL, nhập từ nguồn khác sau: callback_on_time, hold_seconds, acw_seconds, qa_*, csat_*, fcr_count, transferred_to_agent. Script ghi kiểu merge nên không ghi đè các cột này.

## Bảng Supabase (schema public)
| Bảng | Khóa | Nội dung |
|---|---|---|
| call_daily | report_date | offered, answered, abandoned, callback_needed, talk_seconds (+ cột chưa có nguồn) |
| call_team_daily | report_date, team | team ∈ Inhouse / OS Partner / Voice AI Bot; agents_on_duty, handled, answered_within_sl, talk_seconds |
| call_queue_daily | report_date, queue | offered, abandoned, handled_inhouse/os/ai, answered_within_sl, handle_seconds (= đàm thoại) |
| call_timeslot_daily | report_date, slot_start | offered, answered, answered_ai, abandoned |
| call_agent_daily | report_date, ext | agent_name, team, handled, answered_within_sl, talk_seconds (máy AI cũng có dòng, team = Voice AI Bot) |
| agents | ext | danh mục ĐTV (script tự thêm) |
| call_queues | queue | danh mục hàng đợi + display_name để hiển thị (người dùng có thể sửa) |
| kpi_targets | code | mục tiêu KPI; tỷ lệ lưu dạng 0.03 = 3% |
| sync_log | id | nhật ký mỗi lần đồng bộ (status success/skipped/error) |

Mục tiêu KPI hiện có: tỷ lệ nhỡ ≤ 3%, CSAT ≥ 92%, FCR ≥ 83% (theo bảng tổng hợp khối tổng đài 2026 của công ty); phục vụ ≥ 95%, SL ≥ 80%, AHT ≤ 210 giây, QA ≥ 90 là mặc định, chờ xác nhận.

## Công thức chỉ số (tính từ tổng các ngày trong kỳ, không lấy trung bình của tỷ lệ)
- Tỷ lệ phục vụ = answered / offered; Tỷ lệ nhỡ = abandoned / offered
- SL = Σ answered_within_sl / Σ handled (quyết định còn mở: có tính Voice AI vào SL toàn kênh không – nên hiển thị SL của ĐTV (Inhouse + OS) làm số chính)
- Thời gian đàm thoại TB = talk_seconds / số cuộc ĐTV nghe (không chia cho cuộc AI). AHT hiện = đàm thoại vì chưa có ACW.
- Tỷ trọng đội = handled đội / Σ handled; Cuộc / ĐTV / ngày = handled / Σ agents_on_duty
- Tiết kiệm Voice AI = cuộc AI tự giải quyết × COST_PER_AGENT_CALL (chưa có số cuộc AI chuyển ĐTV → ghi rõ là ước tính)
- So sánh kỳ: Ngày vs ngày trước, Ngày vs cùng thứ tuần trước, 7 ngày vs 7 ngày trước, MTD vs cùng kỳ tháng trước, Tùy chọn.

## Hiện trạng code web (repo này)
- React 19 + Vite + Tailwind, sinh từ Google AI Studio, deploy Vercel.
- `src/components/views/CallCenterView.tsx` lấy số từ `src/data/mockData.ts` (callDailyRecords, ivrQueuesData, agentCallRanks…) – số giả.
- `src/services/googleSheetsSync.ts`: trình duyệt fetch CSV công khai; lỗi thì dùng `DEFAULT_RAW_CSV` viết cứng mà vẫn báo "thành công", lưu `localStorage` → phải bỏ cơ chế này.
- `src/services/supabaseClient.ts`: URL/khóa giả đọc từ localStorage; có SQL mẫu cho allowed_users, multichannel_metrics, sync_audit_logs (CHƯA tạo trên Supabase).
- Đăng nhập/whitelist hiện chỉ lưu localStorage → chưa bảo vệ dữ liệu thật.

## BƯỚC 5 – việc cần làm tiếp (đề xuất thứ tự, xác nhận với người dùng trước)
1. Thiết kế đăng nhập + quyền đọc: Supabase Auth (Google, giới hạn tài khoản @kiotviet.com hoặc danh sách cho phép) và RLS policy chỉ cho người đã đăng nhập hợp lệ được SELECT các bảng call_*, agents, call_queues, kpi_targets, sync_log. Viết SQL, giải thích, người dùng chạy trong SQL Editor (hoặc chạy giúp nếu có quyền).
2. Supabase client đọc từ biến môi trường `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (khóa publishable, không phải secret); hướng dẫn người dùng thêm vào Vercel → Settings → Environment Variables.
3. Lớp dữ liệu: hàm lấy số theo kỳ này/kỳ trước (có thể dùng SQL view/function) và tính chỉ số theo công thức trên.
4. Thay mockData ở màn Call Center: 8 thẻ KPI, phân bổ 3 đội, bảng 7 ngày, bảng hàng đợi (dùng call_queues.display_name), biểu đồ khung giờ, bảng xếp hạng ĐTV. Hiển thị "chưa có dữ liệu" khi trống, và thời điểm đồng bộ gần nhất từ sync_log.
5. Bỏ fallback "thành công giả" trong googleSheetsSync.ts.
6. `npm run build` cho sạch lỗi, commit, push → Vercel tự deploy; người dùng kiểm tra số trên web khớp sheet TH ngày 01/10.

## Câu hỏi còn mở với người dùng
- SL toàn kênh có tính cuộc Voice AI không?
- CTV (site "HNI CTV") giữ trong Inhouse hay tách riêng?
- Máy AI 8400001–7 có ứng với hàng đợi/line cụ thể không?
- Nguồn cho: gọi lại cuộc nhỡ đúng hạn (log Outbound 3CX), QA, CSAT, ACW, số cuộc AI chuyển ĐTV.
- Cột dạng "14/14", "12/13" trong bảng xếp hạng ĐTV trên thiết kế là chỉ số gì?
- Giờ người dùng dán data 3CX mỗi ngày (để chỉnh giờ chạy tự động).

## Tệp tham chiếu đi kèm
- `buoc1_tao_bang_supabase.sql` – SQL tạo bảng (đã chạy).
- `dong_bo_3cx_supabase.gs` – Apps Script đồng bộ (bản đang chạy).
- Biểu mẫu Google Sheet thiết kế ban đầu (cấu trúc chỉ số, kiểm tra khớp số): https://docs.google.com/spreadsheets/d/1nlpWYLbP2GjcTxz4BknEMrx6kJMwboit5DsYCdQXz6w
