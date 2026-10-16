# Tầng 3 — Accessibility/Performance (Lighthouse)

Mục Tầng 3 được người dùng chọn ngày 2026-10-16. Yêu cầu: đo bằng Lighthouse, có số liệu,
sửa ít nhất một vấn đề cụ thể.

## Cách đo (lặp lại được)

1. `npm run build`, rồi chạy backend (`npm run dev:server`) và `npx vite preview --port 4173`
   (bản production, `/api` được proxy sang backend).
2. Lighthouse 12.8.2, cấu hình mặc định (mobile, giả lập mạng chậm), chạy trên Microsoft Edge headless:
   `npx lighthouse@12.8.2 http://localhost:4173/weather/Hanoi --view`
3. Báo cáo gốc (JSON) nằm trong [docs/lighthouse/](lighthouse). Mở bằng
   https://googlechrome.github.io/lighthouse/viewer/ (kéo thả file JSON vào).

Lưu ý: bản "trước" đo trên nhánh `refactor` ngày 2026-10-16 (đã có TanStack Query và backend),
không phải bản cũ trước khi refactor. Trang chủ `/` chỉ có số liệu "sau".

## Kết quả

| Trang | Performance | Accessibility | Best practices | SEO | CLS |
|---|---|---|---|---|---|
| `/weather/Hanoi` trước → sau | 80 → **98** | 100 → 100 | 100 → 100 | 75 → **100** | 0.376 → **0** |
| `/cities` trước → sau | 83 → **98** | 100 → 100 | 100 → 100 | 83 → **100** | 0.300 → **0** |
| `/settings` trước → sau | 99 → 99 | 96 → **100** | 100 → 100 | 83 → **100** | 0 → 0 |
| `/` (chỉ sau) | 99 | 100 | 100 | 100 | 0 |

Điểm Performance dao động vài điểm giữa các lần chạy. Chỉ số CLS ổn định hơn và là thay đổi chính.

## Các vấn đề đã sửa

| Vấn đề Lighthouse báo | Nguyên nhân | Sửa | File |
|---|---|---|---|
| **Cumulative Layout Shift 0.376** (trang Weather, Cities) | Lưới của `App` có `min-h-screen`, mặc định các hàng giãn ra cho đủ chiều cao. Khi đang tải, nội dung còn ngắn nên hàng chứa navbar (trên mobile) bị giãn, đẩy cột nội dung xuống giữa màn hình. Khi dữ liệu về, hàng đó co lại và cả cột nhảy lên. | Thêm `content-start` (CSS `align-content: start`) để hàng không giãn | [App.jsx](../src/App.jsx) |
| **Color contrast** (Settings) | Chữ `text-gray-500` trên nền xanh đậm, và chữ trắng trên nút `bg-blue-500` không đủ tỉ lệ 4.5:1 | Đổi sang `text-gray-400` và `bg-blue-600` | `unitSetting.jsx`, `generalSetting.jsx`, `premiumBoard.jsx`, `LandingPage.jsx`, `RouteError.jsx` |
| **Link text không mô tả** ("See More") | Trình đọc màn hình chỉ đọc "See More", không biết xem gì | Thêm `<span className="sr-only"> air conditions</span>`: giao diện không đổi, trình đọc màn hình đọc "See More air conditions" | [InfoCard.jsx](../src/components/InfoCard.jsx) |
| **Thiếu meta description** | `index.html` không có mô tả | Thêm `<meta name="description">` | [index.html](../index.html) |
| **robots.txt không hợp lệ** | Không có file nên server trả về `index.html` | Thêm `public/robots.txt` | [public/robots.txt](../public/robots.txt) |
| **Chữ quá nhỏ** (trang chủ, Best practices 96) | Nhãn menu `0.7rem` (11.2px) < 12px | Đổi sang `text-xs` (12px) | [Navbar.jsx](../src/components/Navbar.jsx) |

Trong lần refactor trước (chưa đo bằng Lighthouse) cũng đã sửa: thẻ `div`/`img`/`li` có `onClick` thành
`button`/`a`/`NavLink` (dùng được bằng bàn phím), thêm `aria-label`, `role="switch"`, `aria-pressed`.

## Chưa làm (ghi nhận)

- Ảnh icon thời tiết (`public/*.png`) lớn hơn kích thước hiển thị. Lighthouse ước tính tiết kiệm
  ~93 KiB nếu thu nhỏ hoặc dùng WebP. Cần công cụ xử lý ảnh nên để lại.
- ~51 KiB JavaScript chưa dùng ở lần tải đầu (chủ yếu React Router/TanStack). Đã tách trang Map; tách tiếp sẽ ít lợi.

## Giải thích ngắn khi demo

- **CLS** đo mức "nhảy" của bố cục khi trang đang tải. Người dùng định bấm một nút thì nút bị đẩy đi chỗ khác.
  Ở đây nguyên nhân là CSS Grid giãn hàng (`align-content: stretch`), sửa bằng một class.
- **Contrast**: WCAG yêu cầu chữ thường có tỉ lệ tương phản ≥ 4.5:1 so với nền.
- **`sr-only`**: chữ ẩn với mắt nhưng trình đọc màn hình vẫn đọc.
