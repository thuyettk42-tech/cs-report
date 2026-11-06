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
  - [x] Code (30/10): đăng nhập Google thật qua Supabase Auth (`authService.startGoogleSignIn` / `completeSupabaseSignIn`, đối chiếu bảng `allowed_users`); bỏ form mật khẩu viết cứng; `callCenterData.ts` + `CallCenterView.tsx` đọc số thật; bỏ fallback "thành công giả" trong googleSheetsSync.ts.
  - [x] SQL quyền đọc: `buoc5_mo_quyen_doc_web.sql` (bảng allowed_users, hàm la_nguoi_xem_hop_le, policy SELECT "web_doc").
  - [x] Người dùng đã chạy `buoc5_mo_quyen_doc_web.sql` thành công (30/10).
  - Đổi phương án (30/10): tài khoản kiotviet.com không được tạo dự án Google Cloud → đăng nhập bằng **email + mật khẩu Supabase Auth** (`signInWithSupabasePassword`). Quản lý tạo tài khoản ở Supabase → Authentication → Users (Auto Confirm), tắt "Allow new users to sign up". Code Google OAuth (`startGoogleSignIn`) vẫn giữ để bật lại khi IT cấp được OAuth client.
  - [x] Người dùng đã thêm env Vercel (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY) và tạo tài khoản Supabase.
  - [x] Push commit 714457f (31/10) → Vercel deploy. Người dùng đăng nhập bằng yendao@kiotviet.com, màn Call Center hiện số thật đến 30/10.
  - [ ] Còn lại: đối chiếu chi tiết số ngày 01/10 với sheet TH; xác nhận đã tắt "Allow new users to sign up".
- [x] (31/10) Quy tắc nhỡ > 5 giây: người dùng đã dán script mới vào Apps Script và nạp lại tháng 10.
- [x] (31/10) Bộ lọc màn Call Center: Ngày / Khoảng ngày / Tháng (`buildPeriod` trong CallCenterView). Kỳ so sánh: hôm trước / số ngày bằng nhau liền trước / cùng kỳ tháng trước. Hàng đợi, khung giờ, ĐTV cộng dồn cả kỳ trong `loadCallCenterData`.
- [x] (02/11) Đã nạp đủ tháng 1–10/2026. Mỗi đầu tháng phải có file "Thang M" mới (2 sheet Call in, Miss call) trước sáng ngày 02, nếu không lượt đồng bộ lỗi cả các ngày cuối tháng trước (chưa sửa script).
- [x] (02/11) Biểu đồ: xu hướng 12 tháng theo line (`StackedBarChart`) + tỷ lệ nhỡ/SL theo tháng; kỳ này vs kỳ so sánh theo ngày; Cuộc gọi theo Line (bảng + biểu đồ). Lọc thêm Quý; ô "So sánh với": kỳ liền trước / cùng kỳ quý trước / cùng kỳ năm trước (`shiftMonths`). Biểu đồ SVG tự vẽ trong `callCenterCharts.tsx`, không dùng thư viện.
- [x] (02/11) Sắp lại màn Call Center: KPI → xu hướng tháng → kỳ so sánh → Line (đã gộp bảng hàng đợi, có CSAT) → 3 đội → khung giờ (tỷ lệ nhỡ từng giờ) → Chi tiết thu gọn (bảng ngày, xếp hạng ĐTV). Người dùng muốn GIỮ các chỉ tiêu chưa có nguồn (QA, gọi lại, ACW, CSAT, FCR) và KHÔNG muốn mục "Điểm cần chú ý". Luôn cho xem bản chạy thử trên máy trước khi đẩy lên.
- (02/11) Hai cặp biểu đồ cạnh nhau trên màn rộng (xl): Xu hướng tháng | Kỳ so sánh; Line | Khung giờ. Bảng theo Line là khung riêng rộng hết màn hình.
- (02/11) Gọi lại cuộc nhỡ: nguồn là Power BI "QA call" (bảng "Chi tiết cuộc gọi MissCall"; Power BI lấy từ 3CX + CRM, quản lý không được truy cập nguồn gốc). Người dùng xuất file vào thư mục Drive `1I06bR68nFpj8k5seIZGCZnr7izWkouNr`: tháng 1–10 mỗi tháng 1 file "Goi lai Thang M", từ tháng 11 mỗi ngày 1 file "Goi lai yyyy-mm-dd". Script `dong_bo_goi_lai.gs` (file thứ 2 trong cùng dự án Apps Script, cần bật dịch vụ Drive API để đọc .xlsx) → bảng `call_callback_daily` (`buoc6_tao_bang_goi_lai.sql`), lịch ~10h. Quy tắc Power BI: hạn = kết thúc cuộc nhỡ + 30 phút, nhỡ giờ trưa hạn 14:00; "sai quy định" gồm cả không gọi lại. Tháng 10 kiểm tra: 3.232 cuộc nhỡ, sai 407 (12,59%) khớp Power BI. Web: thẻ "Gọi lại đúng hạn" + cột "Gọi lại sai QĐ" ở bảng Line. Khác "khách cần gọi lại" (đếm số điện thoại) – giữ cả hai.
- (02/11) Điểm QA: đọc thẳng file "QC Call Center (Responses)" (`1_y3S_8XmvBBbCjcZhhvnZhHbcv98IvVH7KOKF4Gt06g`, chủ mo.tt3@kiotviet.com), CHỈ sheet "Form Responses 2", chỉ Kênh hỗ trợ = Call, chấm từ tháng 4/2026. Điểm 1 cuộc = 100 + 10×số mục "Điểm thưởng" − Σ số lỗi × trọng số (Chào hỏi/Xưng hô/Ngữ điệu/Lắng nghe/Ngôn từ 2; Thái độ 1 10; Thái độ 2 20; Điểm liệt thái độ 100; Khai thác/Ghi nhận/Lỗi khác 5; Đưa ra phương án 100); số lỗi = số dấu phẩy + 1 (giống "Data Check Call" cột AP). Ngày = Timestamp (ngày QA chấm, không phải ngày gọi). Script `dong_bo_qa.gs` → bảng `call_qa_daily` (`buoc7_tao_bang_qa.sql`), lịch ~10h30. Web: thẻ "Điểm Chất Lượng QA" + cột Điểm QA ở xếp hạng ĐTV. Có sẵn resolved_count ("Đã giải quyết vấn đề") – chưa dùng làm FCR, hỏi người dùng. Người dùng chốt CHỈ kênh Call (số QA của họ đếm cả Chat – đã giải thích).
- (02/11) Phân tích lỗi QA (`buoc8_phan_tich_loi_qa.sql`, `QaAnalysis.tsx`): cuộc lỗi = có ghi nhận ở cột G–R, W, X (1 cuộc nhiều cột = 1 cuộc lỗi), xếp theo nhóm nặng nhất: 1 Thái độ (K, W, X) > 2 Không xử lý được (O) > 3 Quy trình (N, P, Q, R) > 4 Giao tiếp (G, H, I, J, L, M). Cột S = KH khen/hài lòng/5 sao. Lý do lỗi (tách theo dấu phẩy) ở bảng `call_qa_reason_daily` (script xóa rồi ghi lại mỗi lần).
- (02/11) Phân tích Voice AI (`AiAnalysis.tsx`): kết quả chấm call AI từ file "[OM] Báo cáo chất lượng call của AI Agent" (`1yUa-aue-5hn4eHAwvH-ian66CGuCmzvGpy_UOI1vRLc`), chỉ 4 sheet "Call Retail", "Call FnB ", "Call Kỹ thuật", "Call HDDT" (cột cố định: A Tháng, B Ngày, I Phân loại, V Action, W Action Result; tiêu đề ở dòng 2). Công thức như sheet "BÁO CÁO CALL": check = I khác rỗng; ngắt máy = I "KH ngắt máy ngang"; tự xử lý = V "Tự xử lý"; đúng = V "Tự xử lý" và W "Pass"; tỷ lệ tự xử lý = tự xử lý/(check − ngắt máy); đúng = đúng/tự xử lý. Script `dong_bo_ai.gs` → `call_ai_qa_daily` (`buoc9_tao_bang_ai.sql`, thêm KPI TARGET_AI_SELF_RESOLVE 0.5, TARGET_AI_CORRECT 0.8), lịch ~10h45. Cuộc AI tiếp nhận lấy từ 3CX (AI_EXT_QUEUE), không dùng cột B nhập tay trong "BÁO CÁO CALL".
- (03/11) Phân hệ KAT (`ProjectKatView.tsx` → phần đầu thay bằng `KatTicketReport.tsx`, các mục bên dưới vẫn số mẫu, có ghi chú). Nguồn: file xuất ticket CRM (cột: Số thứ tự ticket, Tiêu đề, Kênh hỗ trợ, Mô tả, Nguồn tiếp nhận, Trạng thái, Người tạo, Thời gian tạo, Người xử lý, Tổng thời gian xử lý (giây), AI summary history; cột "SLA xử lý" thực ra = thời gian xử lý dạng phút:giây). Người dùng thả file hằng ngày vào thư mục Drive `1-VoFs6q4Z0--M1DmEXu507WINLc_ZWrx`; script `dong_bo_kat.gs` → bảng `kat_ticket` (1 dòng/ticket, ghi đè theo mã) + view `kat_ticket_daily` (`buoc10_tao_bang_kat.sql`), lịch ~11h. Quy tắc người dùng chốt: Trạng thái Hoàn thành = Đã xử lý xong/Đã báo KH; Không xử lý = Từ chối/Trùng lặp; còn lại Đang treo. SLA chỉ kênh Ticket ≤4h (Call/Chat xử lý ngay). Kênh trống: người tạo = người xử lý → kênh NV dùng nhiều nhất ngày đó (không có thì cả kỳ), khác người → Ticket. Nhóm nội dung: đọc mô tả + AI summary (từ khóa), hòa → Thuế → HĐĐT → CKS → Khác, không có dấu hiệu → tiêu đề. T10: 23.914 ticket, HĐĐT 63,6%, Thuế 14,8%, CKS 11,8%, Khác 9,8%. Không lưu tên gian hàng / SĐT / mô tả (mô tả có cả mật khẩu CKS của KH). `buoc11_kat_tong_hop.sql`: view `kat_ticket_daily` (ngày × kênh × nhóm × trạng thái, không chia giờ) + `kat_ticket_hourly`. Màn KAT: bộ lọc Ngày/Khoảng ngày/Tháng/Quý/Năm (so kỳ trước cùng độ dài), GIỮ đủ 6 thẻ thiết kế cũ (Tổng yêu cầu, Tỷ lệ gọi nhỡ, Phản hồi chat TB, Ticket đúng SLA, Khiếu nại, Jira) – chưa có nguồn thì "Chưa có dữ liệu"; người dùng sẽ xuất ticket từ T1/2026. (04/11) `dong_bo_kat.gs` đọc từng file một, nhớ file đã đọc trong Script Properties `KAT_FILE_DA_DOC`, sau 4,5 phút thì dừng và báo "Còn N file" → người dùng bấm Run `dongBoKATHangNgay` tiếp. Đừng chạy `kiemTraKAT` khi thư mục nhiều file (đọc tất cả, quá 6 phút). (04/11) Tỷ lệ gọi nhỡ KAT = line HĐĐT 8009 trên 3CX (gồm cuộc AI, `loadKatCalls`). Phản hồi chat chưa có nguồn (màn Freshchat vẫn số mẫu). Năng suất nhân sự (`KatAgentProductivity.tsx`, `buoc12_kat_nang_suat.sql`: cột handler_code/name/team + view `kat_agent_daily`): đội KAT = người xử lý mã tổng đài **88xx** (KHÔNG lọc theo chữ "KAT" vì có NV chưa đổi nhãn), tính theo người xử lý, năng suất = ticket / ngày có ticket, mục tiêu **30 ticket/ngày** (kpi_targets KAT_TARGET_TICKETS_PER_DAY). T10: 19 người, 12.450 ticket, TB 25,2/ngày. (05/11) Jira chuyển sản phẩm (`KatJiraSection.tsx`, `buoc13_kat_jira.sql` bảng `kat_jira_issue`, script `dong_bo_jira.gs` đọc file **CSV** xuất Jira trong cùng thư mục KAT, lịch ~11h30, không có file mới thì giữ số cũ): Issue Type → Bug (Production Bug, Sub_Bug) / Support (Support, Sub_Support) / Case (New Feature, Sub_Case); liên kết **KVEIN-… = KVE, KAT-… = HKD**; đang mở = Status category ≠ Done; SLA Dev 5 ngày (KAT_JIRA_SLA_DAYS). "Vấn đề nổi cộm" = Bug+Support khái quát thành 11 nhóm theo từ khóa tiêu đề + mô tả (người dùng muốn KHÁI QUÁT, không hiện tiêu đề gốc); chỉ lưu tiêu đề cho Case, đã cắt phần [ … ] đầu (tên gian hàng); không lưu mô tả. Jira xuất tối đa 10.000 dòng/lần → người dùng xuất theo QUÝ vào thư mục Drive riêng `1ToEDBdkEGnRvFoYWdIkORqGHcs8AlotL` (script đọc thư mục này). Chốt thêm: Incident = "Sự cố"; trạng thái Đã xong = Done + Waiting for customer + Đã xử lý tạm, Từ chối = Rejected/Invalid/Duplicated, còn lại Đang treo (cột status_group); thời gian xử lý = Created → Resolved (không có thì Status category changed = cột "thời gian cập nhật"); số gian hàng ảnh hưởng = Impact scope. 4 file quý: 12.368 issue 01/01–03/11. (05/11) Từ Q4 có thêm file "Quy 4.2026 BS case" = Case dự án **PST** (New Feature, liên kết KVEIN/KAT ở cột "Outward issue link (Duplicate)", KHÔNG có Impact scope → web hiện "—"), không trùng Case KTS. File quý xuất lại có cả dòng của dự án Dev (KVEIN-…, KAT-…, ~4.000 dòng, 93% là bản Dev của chính ticket KTS) → script bỏ qua, chỉ đếm KTS + PST (chờ người dùng xác nhận). Tiêu đề Case bỏ cả "[TTxxxx]" và tên gian hàng viết liền "shopmepi - ". Người dùng đã xuất lại 4 file quý chỉ có KTS. Tạm ẨN SLA Dev xử lý Bug (chưa có tài liệu SLA KAT). Thêm luật nhóm vấn đề đặt SAU 11 nhóm cũ (chỉ gom ticket từng rơi vào "Khác": 569 → ~51): Chuyển HĐ nháp, Gửi email/import/xuất file, Thông tin người mua. Case chỉ có tên trong ngoặc → lấy nội dung ngoặc (bỏ tên gian hàng). Bỏ ticket test/tạo nhầm. `napJiraTatCa` xóa bảng trước khi ghi. (05/11 chiều) Bỏ biểu đồ "Lưu lượng ticket theo giờ tạo"; bỏ ô Sự cố (Incident tính vào Bug, cả script lẫn web); "Tạo trong kỳ" tách Bug / Support / Tổng (tình trạng, so kỳ trước, TG xử lý TB); vấn đề nổi cộm chỉ 6 nhóm đầu + "Khác (gồm …)"; khung Jira trên ghi rõ "số tồn đến hôm nay, không đổi theo kỳ lọc". Lỗi "statement timeout" khi chọn Quý/Năm: do view kat_ticket_daily tổng hợp lại toàn kỳ mỗi trang 1.000 dòng → `perMonth` trong katData.ts đọc từng tháng (đã hết lỗi, chưa cần SQL). `buoc14_tang_toc_doc.sql` (đổi policy web_doc thành `(select la_nguoi_xem_hop_le())`) – người dùng ĐÃ chạy 05/11 (15 bảng đổi xong). (06/11) Sắp lại màn KAT: KPI → Tình trạng → Sản lượng → Năng suất → Jira → "Chi tiết: theo kênh" (thu gọn, bỏ 4 cột dịch vụ). Đầu trang "Ticket CRM có đến … · đồng bộ lúc …" (vàng ⚠ nếu thiếu dữ liệu từ hôm qua, `loadKatLastSync`), ghi chú mùa vụ khi một trong 2 kỳ là tháng đầu quý; bỏ chữ mẫu cuối trang. Thẻ "Ticket Jira mở" có số thật. Jira: bảng tuổi ticket (Bug+Support tô đỏ dần / Case xám) + bảng "Tạo trong kỳ" 7 cột (bỏ Gian hàng). Kỳ trước < 10 ticket → so sánh ghi "+3" thay %. Tỷ trọng dịch vụ bỏ ticket "Call – Miss call". Năng suất có ô "Đội KAT tự xử lý %" / "Do đội khác xử lý %". (06/11) Sửa phân loại Jira theo phản hồi người dùng: dịch vụ, KVE/HKD và nhóm vấn đề đều đọc TIÊU ĐỀ trước (`dichVuTieuDeJira_`): tiêu đề Thuế–Kế toán (sổ doanh thu/sổ kế toán/S2a/tờ khai thuế/doanh thu…) → HKD + Thuế–KT; tiêu đề HĐĐT → KVE + HĐĐT; tiêu đề không rõ mới dùng mô tả + liên kết Dev. "Nộp tờ khai… lỗi 10xx", "tờ khai chờ CQT duyệt", tờ khai đăng ký/ngừng sử dụng HĐĐT = KVE/HĐĐT, nhóm mới "Tờ khai đăng ký sử dụng HĐĐT" (người dùng chốt). Nhóm "Sổ doanh thu" ép Thuế–KT. Case tiêu đề chỉ là mã ticket khác → mượn tên ticket đó. Cần dán script + chạy napJiraTatCa.
- (06/11) Sự cố sản phẩm KAT thay khung khiếu nại mẫu: nguồn sheet "Sự cố KAT" trong file "Thống kê vấn đề sản phẩm" (`1FbY01DVNF_zhrCnHrUx4GIRHcE4WNTi_YELeyID-S7A`; KHÔNG đọc sheet "KH gay gắt" – có SĐT/MST). Cột A–G người dùng ghi; đã thêm H Mức độ (Nghiêm trọng / Ảnh hưởng vận hành / Nhẹ, ô chọn), I Thời gian xử lý (gọn), J Tóm tắt đánh giá – người dùng tự ghi cho sự cố mới, trống thì web lấy nguyên văn C / G, mức độ "Chưa đánh giá". Script `dong_bo_su_co.gs` (xóa rồi ghi lại cả bảng, lịch ~11h45; `taoCotBaoCaoSuCo` chạy 1 lần đã điền 12 sự cố đến 05/11) → bảng `kat_incident` (`buoc15_tao_bang_su_co.sql`, người dùng đã chạy). Số GH: số đầu ở cột F = báo lỗi, có "query/phát hiện/tổng" thì số cuối = thực tế; nhiều số theo sản phẩm thì cộng. Web: thẻ "Sự cố phát sinh" (số trong kỳ, so kỳ trước tuyệt đối) + `KatIncidentSection.tsx` kê từng sự cố, KHÔNG dòng tổng; kỳ không có → "Không ghi nhận sự cố phát sinh trong kỳ". Kỳ lọc bị giới hạn bởi ngày ticket CRM mới nhất. Mục Hủy hợp đồng vẫn số mẫu (người dùng sẽ bổ sung).
- Line: Phần mềm = 8024/8025/8026/8028, Kỹ thuật = 8001/8027, HĐĐT = 8009 (`LINES`). Cuộc AI gán line theo máy (`AI_EXT_QUEUE`): 8400001–04 → 8024/8025/8026/8028, 8400006 → 8001, 8400007 → 8009; 8400005 = Knote, không thống kê. Mùa vụ: tháng đầu quý (T1, T4, T7, T10) tăng mạnh do kê khai HĐĐT.
- (03/11) Vercel: trang `cs-report-sage.vercel.app` thuộc dự án Vercel **cs-report** (tài khoản minhthuyet-s-projects, người dùng đăng nhập được bằng tài khoản của anh Thuyết). Dự án từng gắn Supabase cũ "supabase-chestnut-harbor" (tạo 27/10, KHÔNG dùng) – bị Supabase free tạm dừng làm mọi lần deploy lỗi "integration resources failed to provision"; đã gỡ kết nối 03/11. Nếu deploy lỗi kiểu này lại: kiểm tra Vercel → Storage/Integrations. Dự án phụ "cs-report-l4na" cũng tự deploy từ repo.
- Chạy thử trên máy: `.env.local` (đã gitignore) chứa URL + khóa publishable lấy từ web thật.
- Cài đặt máy: Node 24 bản di động ở `%LOCALAPPDATA%\Programs\nodejs-portable` (không cần Admin). `npm install` cần `--legacy-peer-deps --no-package-lock` (xung đột esbuild có sẵn; Vercel dùng bun.lock).

## Quy tắc nghiệp vụ đã chốt (script đang áp dụng)
- Tổng cuộc đến = cuộc Answered/Inbound trong `Call in` (bỏ hộp thư thoại "Voicemail", 1–4 cuộc/ngày) + mọi dòng `Miss call`.
- Đội ngũ lấy từ cột "Nhân Viên Tiếp Nhận" dạng `Tên, DVKH <SITE> (<EXT>)`: SITE `OUT` → **OS Partner**; HNI, HCM, DNG, CTO, KAT, `HNI CTV` → **Inhouse** (CTV đang tính Inhouse – có thể tách sau).
- Máy **8400001–8400007 = tổng đài AI trả lời → Voice AI Bot**, tính là đã phục vụ. Cuộc AI không có thời gian đàm thoại trong 3CX; đa số chờ trong queue ~30 giây rồi mới sang AI. Cuộc nhỡ ở máy 84000xx gộp vào hàng đợi `VOICE_AI_BOT`.
- SL: (Chờ trong queue + Đổ chuông) ≤ 20 giây, lưu theo đội (`call_team_daily.answered_within_sl`).
- `Miss call` có 3 trạng thái ("Miss Call(Abandoned Queue)", "NoAnswer (Abandoned Queue)", "NoAnswer") – đều có thể là nhỡ.
- (31/10) Chỉ tính **nhỡ** khi "Chờ trong queue" > 5 giây (`NGUONG_NHO_GIAY`). Cuộc gác máy ≤ 5 giây vẫn tính vào **tổng cuộc đến** và **khách cần gọi lại** (người dùng chọn), nên offered = nghe + nhỡ + gác máy ≤5s (offered ≠ answered + abandoned).
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
