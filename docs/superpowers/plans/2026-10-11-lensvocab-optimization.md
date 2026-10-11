# LensVocab BE + AI + Mobile Optimization Implementation Plan

## Trạng thái triển khai — 2026-10-11

Đã áp dụng code vào **cả hai repo**, nhánh `codex/lensvocab-optimization`; chưa commit/push/deploy. Chỉnh sửa `.gitignore` của người dùng được giữ nguyên. Các checklist phía dưới là kế hoạch gốc; bảng này ghi kết quả thực hiện và phần còn lại.

| Task | Đã thực hiện | Chưa thực hiện / giới hạn |
|---|---|---|
| 1 | `is_admin` riêng; GET/PATCH admin trả 403 cho user thường; lỗi lưu settings không đổi cache, trả 503; HTTP validation trả 422 | Chưa cấp quyền admin cho tài khoản thật |
| 2 | Confirm keyword-only; server lấy exact Mongo/Redis draft, bỏ qua content client; 409 DRAFT_EXPIRED; normalize keyword; test Mongo confirm lặp | Không sửa nội dung cũ đã tồn tại trong kho chung |
| 3 | Exact cache không thay keyword bằng parent; Redis source đúng; schema AI được validate, retry bounded và lỗi 502/SSE | Chưa đánh giá độ chính xác model trên bộ ảnh thật |
| 4 | Ba route dùng service hiện có; bounded file read/validate trước quota; threshold động; quota cập nhật nguyên tử Mongo, preference chỉ ghi field cần thay | Quota chọn Mongo làm nguồn chính thay vì giữ counter Redis + mirror Mongo; guest budget giữ nguyên. Chưa đo ingress/upload ngoài môi trường test |
| 5 | Mongo transaction card+log; review_id UUID optional và partial unique index; replay trả kết quả cũ, conflict 409; UI giữ ID+quality khi retry | Deploy phải có replica set/Atlas và quyền tạo index; client cũ không gửi ID chưa có bảo đảm idempotency |
| 6 | Bỏ gọi Titan khi confirm; giữ vector/index cũ; tái sử dụng AWS client dưới lock, Nova dùng main region; bcrypt chạy thread | Chưa có benchmark AWS/cost/latency production; chưa thêm hệ thống telemetry hoặc khóa chống generation trùng |
| 7 | SWR cập nhật từ response, không refetch toàn kho mỗi thẻ; refresh cuối queue; quiz snapshot/shuffle; state loading/error/empty; timeout qua body; mutation 401 và stale-session guard | Chưa smoke test camera/audio native vì `adb devices` không có thiết bị |
| 8 | Due cap chuyển vào Mongo `.limit` trước materialize | Pagination, audio endpoint, FlatList và index mới giữ ở bước có điều kiện: cần fixture/profiling trên thiết bị; không thay contract full-list hiện tại |

**Kiểm chứng:** BE gốc chạy 83 tests PASS, gồm 6 integration tests trên MongoDB 7 replica set test riêng. UI full suite 15 tests PASS (5 suites), gồm cả guest→login và logout khi scan đang chạy. TypeScript, ESLint và diff whitespace đều pass. Ruff pass khi bỏ qua UP042/UP047 vốn có từ trước; không nâng dependency để xử lý deprecation warning của python-jose.

**Smoke test AWS thật — 2026-10-11:** Đọc `.env` BE và gửi ảnh `assets/scenes/desk.png` qua HTTP route local `/vision/scan/guest`; chỉ Mongo/Redis/settings/quota được mock để không thay đổi dữ liệu production, các lời gọi AWS là thật. Rekognition thành công (4.623 giây). Bedrock `amazon.nova-lite-v1:0` tại `ap-southeast-1` trả `AccessDeniedException`: identity-based policy chưa cho phép `bedrock:InvokeModel`; route trả 502 `AWS_VISION_UNAVAILABLE`, chưa sinh được flashcard. Probe riêng xác nhận cùng lỗi Bedrock; Polly thành công với từ `desk` (0.555 giây), MP3 4,220 bytes, ffprobe xác nhận 0.696 giây. Đây là số đo một lần, không phải benchmark. Cần bổ sung quyền IAM cho model/region đang cấu hình rồi chạy lại toàn luồng. Báo cáo đã ẩn định danh nằm tại `/tmp/lensvocab-live-ai/report.json` và `probe.json`; chưa kiểm tra app native hay server đã deploy.

**Review:** hai lỗi medium được phát hiện và đã sửa: guest scan bị kẹt khi login giữa request; null validation serialize lỗi thành 500. Re-review không còn blocker trong phạm vi đó. Mongo test container đã dừng sau kiểm thử, dữ liệu production không bị truy cập.

**Triển khai:** BE trước UI vì confirm mới gửi keyword-only. Xem [hướng dẫn rollout BE](../../../../app-LensVocab/docs/05_OPTIMIZATION_ROLLOUT.md) hoặc mở `/home/phong/Môn học/app-LensVocab/docs/05_OPTIMIZATION_ROLLOUT.md`. Không rollout đồng thời phiên bản quota cũ và mới; không coi PREMIUM là admin.

---

> **For agentic workers:** Use `executing-plans` to implement this plan task-by-task. Chỉ triển khai khi người dùng yêu cầu; xem bảng trạng thái triển khai bên trên trước khi tiếp tục.

**Goal:** Làm luồng quét ảnh → lưu từ → ôn tập đúng và an toàn trước, sau đó giảm chi phí AWS, thời gian chờ và dữ liệu truyền về app.

**Architecture:** Giữ React Native + SWR, FastAPI + Beanie Active Record, MongoDB + Redis và AWS hiện có. Sửa tại router/service/hook đang sở hữu luồng; chỉ gom logic scan đang lặp vào service đã tồn tại. Chưa cần microservice, queue, framework mới hay đổi model AI.

**Tech Stack:** React Native 0.87.1, React 19.2.3, TypeScript, SWR; FastAPI, Pydantic v2, Beanie/Motor, Redis; Rekognition, Bedrock Nova, Titan embedding, Polly.

**Spec:** Yêu cầu khảo sát hai repository và đưa plan tối ưu ngày 2026-10-11; phạm vi và tiêu chí nằm trong tài liệu này.

## Phạm vi và nguyên tắc

- UI: `/home/phong/Môn học/lenvocab-ui`; BE: `/home/phong/Môn học/app-LensVocab`. Trong các task, đường dẫn có tiền tố `UI/` hoặc `BE/` tính từ hai root này.
- Không thay công thức SM-2, mức quota, quyền lợi gói hoặc ý nghĩa tính năng khi chưa chốt nghiệp vụ.
- BE tiếp tục JSON `snake_case`, Beanie Active Record; không thêm repository layer.
- Không đổi model embedding hoặc dimension/index. Chỉ đề xuất bỏ lời gọi embedding không có consumer sau khi xác nhận nhu cầu tìm kiếm.
- Tài khoản PREMIUM không đồng nghĩa với admin.
- Mọi API mới bên dưới đều là đề xuất, chưa tồn tại trong source.
- Test offline mock AWS/Mongo/Redis; test DB transaction cần replica set riêng có dữ liệu test. Không dùng endpoint production để thử quyền admin hay thay đổi cấu hình.
- Dùng `rtk git` khi thao tác Git trong BE. Unit test Beanie dùng `model_construct` như AGENTS.md yêu cầu.
- Ước lượng bên dưới dành cho một lập trình viên đã quen project, không phải cam kết deadline.

## Flow đã đọc

```text
React Native: chọn/chụp ảnh
  → POST /vision/scan/guest hoặc /vision/scan
  → quota + Rekognition
  → chọn nhãn / fallback Bedrock từ mô tả nhãn
  → Redis / Mongo exact cache
  → cache miss: Bedrock tạo nội dung + Polly chạy song song
  → trả một flashcard và danh sách nhãn nhận diện
  → POST /flashcards/confirm
  → GlobalFlashcard dùng chung + UserFlashcard riêng
  → GET /review/today
  → POST /review/{id}: SM-2 + ReviewLog
```

Guest sử dụng `execute_vision_scan`; scan có đăng nhập và SSE vẫn chứa pipeline riêng trong router. `execute_vision_stream` đã tồn tại nhưng chưa được router gọi. UI đang dùng JSON scan, chưa dùng SSE.

Các phần nên giữ: AWS đã chạy qua `asyncio.to_thread`; Bedrock/Polly đã song song; list/review đã batch lấy global cards bằng `$in`, không phải N+1; có unique user-card index và xử lý duplicate confirm; token mobile nằm trong Keychain. Không đề xuất làm lại các phần này.

## Phát hiện theo ưu tiên

| Mức | Root cause và bằng chứng | Ảnh hưởng | Task |
|---|---|---|---|
| P0 / blocker | `BE/app/routers/admin.py:14,22` chỉ dùng `get_current_user`; không có kiểm tra role. Request ASGI mock bằng user FREE trả 200 và gọi service ghi settings. | Bất kỳ user đăng nhập nào có thể thay quota/bật bảo trì toàn hệ thống. | 1 |
| P0 / high | `BE/app/services/flashcard_service.py:25` lấy nguyên nội dung confirm từ client, `cache_service.py:489` ghi vào GlobalFlashcard nếu keyword mới. Schema không giới hạn chuỗi/normalize. | Có thể đưa nghĩa/ví dụ/audio tùy ý vào kho dùng chung, gây sai nội dung cho người khác. | 2 |
| P1 / high | `cache_service.py:182` tra parent/alias Redis trước exact Mongo; callers truyền cả `top_parents`. Mock `chair` với cache `furniture` trả `furniture`, không gọi exact Mongo. | Cache làm đổi từ đang học dù nhận diện đúng. | 3 |
| P1 / high | `ai_service.py:286` parse JSON rồi `.get(..., '')`; JSON `{}` tạo flashcard rỗng, không retry. | UI nhận thành công nhưng không lưu được; lỗi schema khác có thể thành 500. | 3 |
| P1 / high | `routers/vision.py:105,284` trừ quota trước validate file; `file.read()` đọc toàn bộ. Mock file text trả 400 sau một lần consume quota. | Mất lượt vì input sai; memory tăng theo upload ở hai route đăng nhập. | 4 |
| P1 / high | `review_service.py:105,119` save card rồi insert log riêng, không transaction/idempotency. Mock log lỗi vẫn ghi card trước khi request thất bại. | Client retry có thể chấm hai lần, lịch ôn lệch và log không nhất quán. | 5 |
| P1 / medium | `cache_service.py:500` vẫn tạo Titan embedding mỗi từ mới; `_search_mongodb_vector` không có caller. | Tốn lời gọi AWS và tăng thời gian lưu từ cho dữ liệu chưa được sử dụng. | 6 |
| P1 / medium | `UI/src/app/AppContent.tsx:114` mỗi grade lại GET toàn bộ cards + due; cả hai BE response chứa audio base64. | Một buổi ôn tải lặp cùng dữ liệu âm thanh và kho từ. | 7 |
| P2 / medium | `flashcard_service.py:91` lấy toàn bộ kho; `review_service.py:33` tải toàn bộ due rồi cắt; `SavedScreen.tsx:148` render `.map` bên trong ScrollView của AppContent. | Tăng DB work, payload và số native view khi kho lớn. Chưa đo mức chậm thực tế. | 8 |
| P2 / medium | `ReviewScreen.tsx:20` coi due rỗng là hoàn thành dù đang loading; `useQuiz.ts:17,23` fallback dữ liệu mẫu và reset khi danh sách đổi. | Trạng thái học hiển thị sai hoặc quiz đổi giữa buổi khi dữ liệu đến. | 7 |

### Các điểm cần xử lý tiếp hoặc xác nhận nghiệp vụ

- `quota_service.py:48–76`: reset ngày xóa Redis key, đồng thời save cả User. Hai request giữ bản User cũ có thể reset lại counter hoặc save số dư sai thứ tự. Cần regression test concurrency; chưa đo trên Redis/Mongo thật. Compose dùng `allkeys-lru`, nên không coi counter cùng cache có độ bền tuyệt đối.
- `degradation_service.py:52` đọc threshold từ env, không dùng `SystemSetting.vision_confidence_threshold`; hot reload admin hiện không đi hết pipeline.
- `system_setting_service.py`: lỗi save Mongo bị nuốt nhưng trả kết quả thành công từ memory. Khi DB không lưu được, API phải báo thất bại; không quảng cáo đã cập nhật hệ thống.
- `ai_service.py:57`: Nova đang lấy embedding session. Chỉ sai region khi `AWS_EMBEDDING_REGION` khác region phục vụ Nova; cần test cấu hình hai region riêng.
- `auth_service.py:80,93`: bcrypt đồng bộ trong async service, chặn event loop trong lúc hash/verify. Chuyển qua thread như pattern AWS đang dùng, đo latency đồng thời với `/health`.
- Polly không nhận preferences/tier từ pipeline; default neural kể cả Free. `voice_speed` và `target_language` chưa được áp dụng; UI profile chỉ hiển thị, hai endpoint wrapper preferences chưa có caller. Chưa nên mở UI bán quyền lợi này trước khi BE thực thi đúng.
- `useQuiz` chỉ tính điểm local, không ghi SM-2; xem là chế độ luyện tập riêng cho đến khi chốt quy tắc chuyển đúng/sai sang quality 0–5.
- History chỉ nằm trong `useState`, mất khi app đóng. `daily_review_cap` hiện là giới hạn mỗi lần lấy queue, không phải tổng số từ trong ngày. Hai điều này là phạm vi sản phẩm cần xác nhận, không tự động coi là bug.
- `request.ts` kết thúc timeout khi có headers, trước đọc JSON; JSON lỗi trả `null as T`. Cần phân biệt lỗi response không hợp lệ, timeout đọc body và lỗi HTTP.
- GET data xử lý 401; mutation scan/save/grade chưa cùng cơ chế. Khi logout trong lúc scan, response cũ vẫn có thể cập nhật history/navigation. Cần invalidate request khi phiên thay đổi.

## Task 1 — Chặn quyền admin và không báo lưu settings thành công giả

**Ưu tiên/ước lượng:** P0, 0.5–1 ngày. Làm trước các tối ưu khác.

**Files:** BE `app/models/user.py`, `app/dependencies/auth.py`, `app/routers/admin.py`, `app/services/system_setting_service.py`, `tests/test_tier_and_settings.py`, `tests/test_api_auth_and_protection.py`.

**Contract:** thêm `User.is_admin: bool = False` ở server; không nhận field này qua register/preferences. Dependency `get_current_admin` sử dụng `get_current_user`, trả 403 `ADMIN_REQUIRED` nếu thiếu quyền. Route giữ nguyên request/response. User cũ mặc định không có quyền; cấp quyền cho account quản trị bằng thao tác vận hành riêng có kiểm soát.

- [ ] Viết test guest → 401; FREE/PREMIUM không admin → 403 và service settings không được gọi; admin → 200.
- [ ] Thêm dependency đơn giản trong file auth hiện tại:

```python
async def get_current_admin(user: User = Depends(get_current_user)) -> User:
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="ADMIN_REQUIRED")
    return user
```

- [ ] Thay dependency của cả GET/PATCH admin; giữ auth token hiện có.
- [ ] Khi Mongo save lỗi, không cập nhật `_cached_setting` sang giá trị chưa persist; map lỗi thành 503. Test save thất bại không trả 200 và không làm đổi cache cũ.
- [ ] Chạy focused tests, cập nhật docs quyền admin và rà diff; commit riêng.

## Task 2 — Server sở hữu nội dung flashcard dùng chung

**Ưu tiên/ước lượng:** P0, 1–2 ngày; có thay đổi contract cần rollout BE trước UI.

**Files:** BE `app/schemas/flashcard.py`, `app/services/flashcard_service.py`, `app/services/cache_service.py`, `app/routers/flashcards.py`, `tests/test_services_layer.py`; UI `src/api/endpoints/confirmFlashcard.ts`, `__tests__/api-contract.test.ts`.

**Contract tối giản:** confirm nhận keyword chuẩn hóa; nội dung authoritative lấy từ exact Mongo hoặc draft Redis do server tạo. Trong giai đoạn tương thích vẫn nhận các field cũ nhưng không dùng chúng để ghi GlobalFlashcard. Không tự gọi AI từ confirm nếu không tìm thấy draft; trả 409 `DRAFT_EXPIRED`, UI hướng dẫn quét lại. Cách này giữ luồng guest quét → login → lưu mà không cần thêm draft database/ownership transfer.

- [ ] Test giả mạo `meaning_vi`, ví dụ và audio không thay nội dung authoritative; keyword không tồn tại trả 409, không gọi Titan/Bedrock/insert.
- [ ] Normalize keyword ở boundary bằng `strip().lower()`, giới hạn đề xuất 100 ký tự, không chấp nhận rỗng. Test `" Chair "` và `"chair"` liên kết cùng một từ.
- [ ] Lookup **exact** keyword, không dùng resolver có parent/alias ở task này. Giữ behavior confirm lặp trả cùng user-card.
- [ ] Đổi UI gửi `{ keyword: draft.keyword }` khi BE đã triển khai; thêm mapping `DRAFT_EXPIRED`.
- [ ] Kiểm tra bằng test contract:

```ts
expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ keyword: 'chair' });
```

- [ ] Chạy tests cả hai repo, cập nhật schema/docs; rà các record đã có nội dung sai riêng, không tự xóa/sửa hàng loạt dữ liệu cũ.

## Task 3 — Giữ đúng keyword và validate đầu ra AI

**Ưu tiên/ước lượng:** P1, 1–2 ngày.

**Files:** BE `app/services/cache_service.py`, `app/services/ai_service.py`, `app/services/vision_service.py`, `app/routers/vision.py`, `tests/test_vision_pipeline.py`; tạo `tests/test_cache_service.py`, `tests/test_ai_service.py` vì đây là hai service còn thiếu kiểm thử trực tiếp.

**Contract:** giữ ScanResponse. Bản đầu chỉ dùng exact keyword đã normalize; bỏ parent fallback khỏi resolver. Nếu sau này cần aliases, dùng alias tương đương đã kiểm chứng và chỉ sau exact Redis + exact Mongo. Không coi quan hệ cha/con là đồng nghĩa.

- [ ] Viết regression `chair` miss Redis nhưng tồn tại Mongo, `furniture` hit Redis: kết quả phải là `chair`. Test tương đương cho JSON/SSE và fallback keyword đã đổi.
- [ ] Sửa hai resolver theo exact Redis → exact Mongo → generate. Cache Redis hit phải báo `source="redis"`, không giữ source cũ từ payload đã serialize.
- [ ] Dùng Pydantic đang có để validate dữ liệu AI ngay sau parse: object, pronunciation/meaning/examples không rỗng, related_words là list chuỗi hợp lệ. Model schema đặt ngay trong `ai_service.py`, không thêm tầng mới.
- [ ] JSON parse đúng nhưng schema sai phải thành `BedrockOutputError` để retry có giới hạn; exhausted trả 502 `AI_CONTENT_INVALID`; không cache nội dung hỏng. SSE trả event error thay vì đứt stream không rõ lý do.
- [ ] Regression tối thiểu, có mock client để không gọi AWS:

```python
client.converse.return_value = {"output": {"message": {"content": [{"text": "{}"}]}}}
with patch("app.services.ai_service._get_bedrock_client", return_value=client):
    with self.assertRaises(BedrockOutputError):
        _sync_generate_content.__wrapped__("chair")
```

- [ ] Thêm trường hợp output list/null, thiếu field, field sai type, Polly lỗi nhưng text hợp lệ. Cập nhật docs bỏ cam kết parent lookup “0 rủi ro sai lệch”.

## Task 4 — Một pipeline scan, quota đúng và upload có giới hạn

**Ưu tiên/ước lượng:** P1, 1–2 ngày; quota concurrency có thể cần thêm 1 ngày integration.

**Files:** BE `app/routers/vision.py`, `app/services/vision_service.py`, `app/services/quota_service.py`, `app/services/degradation_service.py`, `tests/test_vision_pipeline.py`, `tests/test_guest_scan.py`; tạo `tests/test_quota_service.py`.

**Interfaces:** router validate upload và consume quota đúng một lần; `execute_vision_scan(image_bytes, current_user, redis)` và `execute_vision_stream(...)` không tự consume lại. Guest giữ budget riêng. Đây là refactor có ích cụ thể: ba route dùng cùng luật chọn nhãn/cache/lỗi, tránh sửa một nhánh bỏ sót nhánh khác.

- [ ] Thêm assertion `mock_quota.assert_not_awaited()` vào test file sai MIME/rỗng/quá 5 MB. Giữ test valid request consume đúng một lần.
- [ ] Cho route đăng nhập đọc giới hạn như guest: `await file.read(MAX_IMAGE_SIZE_BYTES + 1)`; validate trước consume. Giới hạn multipart/request tại hạ tầng cũng cần kiểm tra vì đọc giới hạn không thay thế giới hạn body tại ingress.
- [ ] Route JSON gọi service hiện có, SSE gọi generator hiện có. Bỏ consume trong service JSON khi chuyển trách nhiệm vào router. Test parity guest/auth và event error.
- [ ] Truyền threshold từ SystemSetting vào bước degradation; test đổi threshold ảnh hưởng kết quả mà không restart. Lấy settings một lần trong phạm vi request khi đủ context, không thêm cache TTL làm lệch yêu cầu hot reload.
- [ ] Reproduce hai request đầu ngày bằng hai bản User cũ. Thiết kế counter theo ngày và thao tác check/consume atomic như guest; không xóa key đang được request khác sử dụng. Chốt nguồn quota authoritative và cách phục hồi khi Redis mất key trước khi code, tránh double truth Mongo/Redis.
- [ ] Test quota hết không gọi AWS; không âm; reset ngày không cộng lại lượt đã tiêu; Redis lỗi đóng luồng có mã 503. Không thay chính sách tính lượt khi AWS lỗi nếu chưa chốt.

## Task 5 — Lưu review nhất quán và retry không chấm hai lần

**Ưu tiên/ước lượng:** P1, 1–2 ngày.

**Files:** BE `app/services/review_service.py`, `app/routers/review.py`, `app/schemas/review.py`, `app/models/review.py`, `tests/test_services_layer.py`; UI `src/api/endpoints/gradeReview.ts`, `src/screens/learn/hooks/useFlashcards.ts`.

**Contract đề xuất:** UI gửi `review_id` UUID cho một lần trả lời, giữ nguyên khi retry lần đó; BE unique `(user_id, review_id)` và trả lại kết quả đã lưu khi replay. Response SM-2 hiện có giữ nguyên. Field có thể optional trong giai đoạn chuyển tiếp, nhưng chỉ client gửi ID mới có bảo đảm idempotency.

- [ ] Test ghi ReviewLog lỗi phải rollback UserFlashcard; gửi cùng review_id hai lần chỉ đổi SM-2 một lần; cùng ID nhưng khác card/quality trả 409.
- [ ] Bao read card + update card + insert log trong Mongo transaction dùng session của Motor/Beanie hiện có; xác nhận replica set trong môi trường test/deploy trước. Không thêm abstraction transaction chung.
- [ ] Lưu đủ kết quả response vào log để replay không tính SM-2 lại; unique conflict phải đọc kết quả committed.
- [ ] UI không tạo ID mới khi retry do timeout; không tự động retry POST bằng global fetch wrapper.
- [ ] Test integration transaction trên DB test riêng; test unit mock không được xem là bằng chứng rollback thật.

MongoDB hỗ trợ transaction khi nhiều document cần ghi nguyên tử, nhưng có overhead; chỉ áp dụng vào boundary review này, không bọc mọi read/write. [MongoDB transactions](https://www.mongodb.com/docs/manual/core/transactions/).

## Task 6 — Cắt công việc AI không cần thiết, đo trước/sau

**Ưu tiên/ước lượng:** P1, 1–2 ngày.

**Files:** BE `app/services/cache_service.py`, `app/services/ai_service.py`, `app/services/auth_service.py`, `app/main.py`, tests tương ứng, `docs/02_VISION_AND_CACHE_PIPELINE.md`.

- [ ] Ghi baseline cho cache hit/miss và confirm: thời gian Rekognition, cache/DB, Bedrock, Polly, embedding; số lần gọi AWS; tỷ lệ cache hit; tổng p50/p95 trên cùng bộ ảnh. Không log token, ảnh hoặc audio base64.
- [ ] Sau khi xác nhận chưa có consumer vector, bỏ `await create_titan_embedding(...)` khỏi save đường chính, lưu `embedding=None` như schema hiện hỗ trợ; không xóa embedding/index cũ hoặc đổi model. Test confirm mới không gọi Titan.
- [ ] Tái sử dụng AWS clients trong process, khởi tạo tuần tự trước khi dùng qua các worker thread, đóng lúc shutdown. Hiện code cache Session nhưng tạo client lại ở mỗi lời gọi; không chỉ thêm lazy cache rồi bỏ qua race lúc khởi tạo.
- [ ] Nova dùng session theo region cấu hình cho Nova; Titan dùng embedding region. Test hai region khác nhau mà không truy cập AWS.
- [ ] Chuyển bcrypt trong async service qua `asyncio.to_thread`, giữ thuật toán hash hiện tại. Test concurrent health/login và mật khẩu đúng/sai; không đổi auth semantics.
- [ ] Đo cùng cache state, cùng concurrency trước/sau. Chỉ thêm khóa chống nhiều request cùng sinh một keyword nếu đo thấy generation trùng đáng kể; chưa cần queue.

AWS nêu Session không thread-safe, còn clients thường có thể dùng chung giữa threads với các điều kiện trong tài liệu. [Boto3 sessions](https://docs.aws.amazon.com/boto3/latest/guide/session.html), [Boto3 clients](https://docs.aws.amazon.com/boto3/latest/guide/clients.html).

## Task 7 — Giảm refetch và ổn định trạng thái học trên UI

**Ưu tiên/ước lượng:** P1/P2, 1–2 ngày. Có thể triển khai độc lập sau khi kiểm tra contract review.

**Files:** UI `src/app/hooks/useLearningData.ts`, `src/app/AppContent.tsx`, `src/screens/learn/ReviewScreen.tsx`, `src/screens/learn/hooks/useQuiz.ts`, `src/screens/learn/QuizScreen.tsx`, `src/api/client/request.ts`, `__tests__/App.test.tsx`, `__tests__/api-contract.test.ts`.

- [ ] Sau grade thành công, dùng `SubmitReviewResponse` cập nhật card interval/repetitions/efactor/next_review_date trong SWR và bỏ card khỏi queue local; revalidate khi kết thúc buổi/thao tác refresh. Không GET toàn bộ kho sau từng thẻ; lỗi refresh không biến một grade đã lưu thành lần chấm thất bại.
- [ ] Test một buổi N thẻ có N POST grade; GET cards/due không tăng theo N; quiz và kho từ thấy SM-2 mới sau cập nhật cache.
- [ ] Loading, error, empty, done là bốn trạng thái riêng. Khi `/auth/me` xong trước `/review/today`, không hiện “Đã hoàn thành”. Logged-in chưa có từ không âm thầm chuyển sang quiz demo.
- [ ] Snapshot bộ câu hỏi khi bắt đầu quiz, giữ nguyên đến finish/restart; không reset do refetch. Xáo đáp án một lần mỗi câu thay cách sort `charCodeAt(0) % 5`; mock random trong test. Chặn chấm lặp trong handler, không chỉ ở disabled của UI.
- [ ] Test delayed data, refetch giữa câu, trả lời nhanh hai lần, restart và bộ từ rỗng. Giữ quiz là luyện tập local, chưa chuyển kết quả sang SM-2.
- [ ] Giữ timeout tới khi đọc xong JSON; response không hợp lệ phải là ApiError rõ ràng. Bổ sung test HTTP 200 invalid JSON, body trì hoãn, 401 mutation và logout khi scan còn pending.
- [ ] Native smoke test: guest scan → login → save → ôn → mở lại app; không coi Jest renderer là kiểm tra camera/audio thật.

## Task 8 — Kho lớn: pagination, audio theo nhu cầu và list ảo hóa

**Ưu tiên/ước lượng:** P2, 2–3 ngày; làm khi có fixture/baseline 50, 500, 2.000 cards.

**Files:** BE `app/routers/flashcards.py`, `app/schemas/flashcard.py`, `app/services/flashcard_service.py`, `app/services/review_service.py`, `app/models/flashcard.py`; UI `src/api/contracts.ts`, `src/api/endpoints/listFlashcards.ts`, `src/app/hooks/useLearningData.ts`, `src/app/AppContent.tsx`, `src/screens/learn/SavedScreen.tsx`, `src/hooks/useAudio.ts`.

- [ ] Tính effective_cap trước query due và dùng `.limit(effective_cap)` trước `.to_list()`. Trường hợp cap 0 trả [] trước query; không dùng Mongo limit(0) vì mang nghĩa không giới hạn. Giữ thứ tự ưu tiên và batch `$in`.
- [ ] Chạy explain trên fixture DB; chỉ thêm index `(user_id, status, next_review_date)` nếu cải thiện query thực tế và xét index đang có.
- [ ] Contract pagination đề xuất: opt-in `GET /flashcards?limit=30&cursor=...&q=...&status=...` → `{items, next_cursor, total}`; cursor theo sort ổn định `(added_at, _id)`. `limit` 1–100, cursor sai → 422, owner filter luôn lấy từ token. Request legacy không có pagination giữ response cũ trong giai đoạn migration.
- [ ] Search/filter/count phải chạy trên toàn kho ở BE; không chỉ trên các trang đã tải. Không dùng `cards.length` làm tổng từ sau pagination.
- [ ] Bản paginated không nhúng audio; đề xuất `GET /flashcards/{user_flashcard_id}/audio` trả `audio/mpeg`, kiểm tra owner, cache file local theo card/voice/version. Chưa cần S3/CDN nếu traffic chưa chứng minh cần.
- [ ] Cập nhật UI hooks/mappers và word detail để tải chi tiết theo ID khi card chưa ở trang hiện tại; không fallback nhầm sang từ demo.
- [ ] SavedScreen sở hữu FlatList với header/footer; AppContent bỏ ScrollView bọc bên ngoài riêng màn này. Không lồng FlatList cùng chiều vào ScrollView.
- [ ] Test pagination không trùng/mất mục trên dataset cố định, invalid cursor, cross-user access, tìm từ ở trang chưa load, tổng count và audio không có. Profile frame/memory/payload trước/sau trên máy Android thực hoặc emulator.

React Native xác nhận ScrollView render tất cả children; FlatList phù hợp danh sách dài. Đây là cơ sở chọn component, chưa phải số liệu tốc độ của app. [React Native ScrollView](https://reactnative.dev/docs/scrollview).

## Sau nền tảng: chọn theo mục tiêu sản phẩm

| Hạng mục | Đề xuất tối giản | Điều kiện trước khi triển khai |
|---|---|---|
| Scan thấy tiến trình sớm | Dùng SSE đã có sau khi sửa parity/error; tách thời điểm emit text khỏi thời gian Polly hoàn tất. | Xác minh POST multipart streaming trên RN 0.87 và proxy; chưa thêm thư viện chỉ vì BE có SSE. |
| Chọn vật thể trong ảnh | Hiển thị bbox/nhãn và cho chọn một vật thể; chỉ tạo nội dung cho vật thể được chọn. | Chốt giá trị tính năng và quota, tránh tự gọi AI cho mọi nhãn làm tăng chi phí. |
| Preferences | Nối UI tới API hiện có, thực thi voice/tier thật; speed ưu tiên ở playback nếu native API đáp ứng. | Audio cache key phải gồm voice/engine; giữ nội dung tiếng Việt cho MVP thay vì mở target_language chưa hỗ trợ. |
| History | Ghi rõ “trong phiên này” nếu chưa cần lưu; nếu cần đồng bộ thì lưu metadata scan có owner/retention, ảnh là tùy chọn. | Chốt nhu cầu offline, nhiều thiết bị và lưu ảnh. |
| Độ chính xác AI | Bộ 50–100 ảnh được gán nhãn thủ công, gồm nhiều vật thể, ánh sáng kém, vật thể dễ nhầm; kiểm tra nhãn, nghĩa, IPA, ví dụ. | Không đổi model/ngưỡng chỉ từ vài ảnh. Dùng cùng bộ đánh giá để so sánh chất lượng và cost/latency. |
| Vận hành | CI lint/typecheck/unit/API contract, readiness Mongo/Redis, giới hạn auth, dependency audit riêng. | Chưa kết luận dependency có CVE chỉ dựa trên phiên bản; chưa cần nâng framework hàng loạt. |

## Thứ tự triển khai và tiêu chí nghiệm thu

1. **Task 1–2:** khóa admin và bảo vệ kho dùng chung trước khi mở rộng người dùng.
2. **Task 3–5:** sửa correctness cache/AI, scan/quota và review. Mỗi task là một PR có regression tests riêng.
3. **Task 6–7:** giảm số gọi AWS và GET lặp, ổn định trải nghiệm học. Ghi kết quả đo thay vì hứa “nhanh hơn X%”.
4. **Task 8:** chỉ mở rộng payload/list khi fixture và profiling xác nhận nhu cầu; không làm trước lỗi P0.
5. Chọn tính năng nâng cao từ bảng trên theo mục tiêu MVP. Không đưa tất cả vào một đợt refactor.

Ước lượng tổng phần cốt lõi khoảng 8–15 ngày công, phụ thuộc test DB/thiết bị và rollout contract. Có thể dừng sau từng task với một thay đổi kiểm chứng độc lập.

## Kiểm chứng thực tế trong phiên khảo sát

| Check | Kết quả |
|---|---|
| UI `npm test -- --runInBand --silent` | PASS: 2 suites, 5 tests |
| UI `./node_modules/.bin/tsc --noEmit` | PASS |
| UI `npm run lint -- --quiet` | PASS; lệnh này chỉ dùng để kiểm tra ESLint errors, không kết luận zero warnings |
| BE unit auth + SM-2 + degradation + services layer | PASS: 19 tests; có DeprecationWarning từ python-jose |
| BE toàn bộ `unittest discover tests` | Chưa hoàn tất: treo ở test đầu có Starlette TestClient. Lần chạy có faulthandler dừng sau 20 giây, stack nằm ở AnyIO thread portal; chưa kết luận lỗi app hay môi trường |
| ASGITransport + user FREE + mock settings service | PATCH admin trả 200, gọi service ghi một lần — xác nhận thiếu authorization |
| Mock cache chair/furniture | Trả furniture, số lần exact Mongo = 0 |
| Mock Bedrock trả `{}` | Tạo flashcard nghĩa rỗng, gọi model một lần |
| ConfirmFlashcardRequest | Chấp nhận nghĩa/ví dụ rỗng và keyword `" Chair "` không normalize |
| Gọi scan router trực tiếp, quota mocked | File text trả 400 nhưng quota bị consume một lần |
| Mock ReviewLog insert lỗi | Card save chạy trước, request raise sau đó |

Lệnh unit BE đã chạy (không ghi bytecode vào repo BE):

```bash
PYTHONDONTWRITEBYTECODE=1 SECRET_KEY=offline-review-test-key .venv/bin/python -m unittest tests.test_auth_service tests.test_sm2_service tests.test_degradation_service tests.test_services_layer -v
```

Chưa chạy AWS thật, Mongo/Redis integration, mobile build hoặc kiểm tra native camera/audio; chưa có baseline production latency/cost. File `api-contract.test.ts` hiện mới kiểm tra mapping error và scanWord; chưa so sánh toàn bộ schema BE/UI. Không được diễn giải test xanh hiện tại thành đã xác nhận end-to-end.

## Rà soát plan

- [x] Phân biệt lỗi xác nhận bằng mock/đọc code với giả thuyết cần profiling.
- [x] Có file và contract chịu ảnh hưởng, trình tự rollout và test cần thiết.
- [x] Giữ stack, SM-2, quota/tier policy và dữ liệu cũ ngoài các thay đổi đã chỉ rõ.
- [x] Không sửa application code, cài dependency, gọi AWS có phí hoặc thay dữ liệu thật trong phiên khảo sát.
