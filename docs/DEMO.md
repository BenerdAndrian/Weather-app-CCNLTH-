# Hướng dẫn demo và giải thích (React 19 + Vite + TanStack)

Chuẩn bị: chạy `npm run dev:server` và `npm run dev`, mở http://localhost:5173.
Mở **React Query Devtools** (nút hình hoa ở góc dưới phải, chỉ có ở chế độ dev) và tab **Network** của trình duyệt.

## 1. Client state và server state

| Dữ liệu | Loại | Nằm ở đâu | Vì sao |
|---|---|---|---|
| Dự báo thời tiết của một thành phố | **Server state** | TanStack Query, key `['weather', 'hanoi']` ([weatherQueries.js](../src/queries/weatherQueries.js)) | Nguồn gốc ở server, có thể cũ đi, nhiều component dùng chung |
| Danh sách thành phố đã lưu | **Server state** | TanStack Query, key `['saved-cities']` ([cityQueries.js](../src/queries/cityQueries.js)); dữ liệu thật ở SQLite | Server là nguồn sự thật, bị thay đổi bằng mutation |
| Thành phố đang xem | URL (route param) | `/weather/:city` ([routes.jsx](../src/routes.jsx)) | Chia sẻ được link, F5 không mất |
| Chữ đang gõ trong ô tìm kiếm | Client/UI state | `useState` trong [Input.jsx](../src/components/Input.jsx) | Chỉ component đó cần |
| Thẻ thành phố đang chọn ở trang Cities | Client/UI state | `useState` trong [Cities.jsx](../src/components/Cities.jsx) | Chỉ là lựa chọn giao diện |
| Đơn vị (°C/°F…), định dạng 12h | Client state lưu bền | Context + `localStorage` ([SettingsProvider.jsx](../src/settings/SettingsProvider.jsx)) | Thuộc về trình duyệt này, không cần server |
| Nhiệt độ đã đổi đơn vị, "đã lưu chưa", mục menu đang active | **Derived state** | Tính khi render, không lưu vào state | Tránh state dư thừa và lệch dữ liệu |

## 2. Vòng đời cache của `['weather', city]`

Cấu hình: `staleTime` 10 phút (trong `useWeather`), `gcTime` 30 phút, retry 2 lần trừ lỗi 4xx ([queryClient.js](../src/queries/queryClient.js)).

1. Mở `/weather/Hue` lần đầu: chưa có cache → `isPending` → hiện màn "Fetching Data" → gọi `GET /api/weather/Hue` → **success**, dữ liệu vào cache (trạng thái *fresh*).
2. Bấm **See More** (trang Air Conditions): cùng key → đọc cache, **không có request mới** (xem Network). Có test chứng minh: [Weather.test.jsx](../src/components/Weather.test.jsx) "reuses the cached forecast".
3. Sau 10 phút dữ liệu thành *stale*. Lần sau component dùng nó (mở lại trang, focus lại cửa sổ) thì dữ liệu cũ **hiện ngay**, đồng thời refetch ngầm. Lúc đó có chữ "Updating…" (`isFetching && !isPending`).
4. Không còn component nào dùng key đó (*inactive*) → sau 30 phút (`gcTime`) cache bị xoá.
5. Lỗi: thành phố không tồn tại → backend trả 404 `CITY_NOT_FOUND` → **error state** "City not found", không retry (vì 4xx). Lỗi mạng/5xx thì retry 2 lần rồi hiện nút "Try again" (`refetch`).

Key được chuẩn hoá (`normalizeCity`) nên "Hanoi", "hanoi " và "HANOI" dùng chung một mục cache. Mỗi thành phố là một mục cache riêng: **cache tách theo tham số**.

## 3. Mutation và xử lý cache sau mutation

`useAddCity` / `useDeleteCity` ([cityQueries.js](../src/queries/cityQueries.js)):

1. `onMutate`: `cancelQueries` (để refetch đang chạy không ghi đè) → lưu bản cũ → `setQueryData` cập nhật **lạc quan** (optimistic): thành phố xuất hiện ngay, mờ, có chữ "Saving…".
2. `onError`: server từ chối → **rollback** về bản cũ, hiện hộp thoại lỗi.
3. `onSettled`: `invalidateQueries(['saved-cities'])` → refetch danh sách để cache khớp với database (id thật, địa chỉ đã chuẩn hoá).

**Vì sao phải invalidate sau mutation?** Danh sách trong cache là bản sao dữ liệu server. Sau khi server thay đổi, bản sao đó đã cũ. Bản lạc quan dùng id tạm và tên người dùng gõ, nên phải lấy lại bản thật.

Demo: trang **Cities** → gõ `Atlantisxyz` → Enter. Thẻ hiện ngay ("Saving…"), rồi server trả 404 → thẻ biến mất (rollback) và hiện lỗi. Gõ `Da Nang` → được lưu. Rê chuột lên thẻ → nút cam → xoá (biến mất ngay, rồi danh sách được refetch).

## 4. Nếu bỏ TanStack Query, nhóm phải tự làm gì?

Phiên bản cũ (`DataContext.jsx` + `FetchAPI.jsx`, đã xoá, xem lịch sử git ở commit `511671b`) cho thấy điều đó: tự giữ `data/error/loading` cho từng request bằng `useState` + `useEffect`; tự cache (trước đây phải chép vào `localStorage`); tự chống request trùng khi nhiều component cần cùng dữ liệu; tự refetch khi dữ liệu cũ; tự retry; tự huỷ request cũ khi đổi thành phố (race condition); tự cập nhật danh sách sau khi thêm/xoá và rollback khi lỗi; tự dọn bộ nhớ.

## 5. Vite

- Dev server có HMR; `server.proxy` chuyển `/api` sang Express ([vite.config.js](../vite.config.js)), nên frontend không cần biết host backend và không bị CORS khi dev.
- Build: `npm run build` → `dist/`. Biến môi trường phía client phải có tiền tố `VITE_` (`import.meta.env.VITE_API_BASE_URL`); API key **không** nằm ở frontend.
- Vitest dùng chung cấu hình Vite (khối `test`).

## 6. Code splitting (số liệu đo)

`MapPage` (kèm Leaflet) được tải bằng `React.lazy` + `<Suspense>` ([routes.jsx](../src/routes.jsx)).

| Build (`npm run build`) | JS tải khi mở app | Ghi chú |
|---|---|---|
| Trước (2026-10-16, chưa có TanStack) | 471.95 kB (gzip 144.89 kB), 1 file | Leaflet nằm trong bundle chính |
| Sau | 359.83 kB (gzip 112.76 kB) + `MapPage` 155.61 kB (gzip 45.78 kB) chỉ tải khi mở /map | Đã thêm TanStack Query mà bundle đầu vẫn nhỏ hơn ~24% |

Kiểm tra: tab Network, mở `/weather` rồi `/map` → thấy file `MapPage-*.js` chỉ tải lúc vào /map.

## 7. Error boundary

`errorElement: <RouteError />` ở route gốc: lỗi khi render bất kỳ trang nào sẽ hiện "Something went wrong" thay vì trang trắng. URL không tồn tại (`/abc`) hiện "Page not found". Lỗi dữ liệu (query/mutation) được xử lý tại chỗ bằng `isError` / hộp thoại.

## 8. Backend

- `GET /api/health` → kiểm tra sống.
- Log mỗi request: `GET /api/weather/hanoi 200 1897ms`.
- Kiểm tra đầu vào (`validation.js`), SQL dùng tham số (chống SQL injection), CORS chỉ cho origin cấu hình, API key chỉ ở `server/.env`.

## Checklist demo nhanh

- [ ] `npm run lint`, `npm test`, `npm --prefix server test`, `npm run build` đều chạy được
- [ ] Mở `/weather/Hue` → loading → dữ liệu
- [ ] See More → không có request mới (Network / Devtools)
- [ ] Tìm thành phố sai → "City not found"
- [ ] Save city → nút thành "Saved ✓"; trang Cities có thành phố đó
- [ ] Thêm thành phố sai ở Cities → hiện ngay rồi rollback
- [ ] Xoá thành phố → biến mất ngay; `GET /api/cities` xác nhận
- [ ] Đổi °C/°F trong Settings → mọi trang đổi theo, F5 vẫn giữ
- [ ] Mở /map → chunk `MapPage` tải lúc đó
- [ ] `curl http://localhost:3001/api/health`
- [ ] Tầng 3: mở báo cáo Lighthouse trước/sau, giải thích lỗi CLS ([LIGHTHOUSE.md](LIGHTHOUSE.md))
