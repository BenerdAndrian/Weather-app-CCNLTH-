# Hands-on Lab: React state và TanStack Query qua luồng thời tiết

**Đối tượng:** nhóm đã biết JavaScript cơ bản và JSX  
**Công nghệ trọng tâm:** React 19, Vite 6, TanStack Query 5, React Router 7

## 1. Chủ đề và giá trị học tập

Lab dùng một luồng cụ thể của ứng dụng: người dùng mở trang thời tiết theo thành phố, giao diện đọc forecast từ API, TanStack Query quản lý trạng thái request và cache, rồi component hiển thị dữ liệu.

Chủ đề này được chọn vì nó làm rõ ranh giới giữa ba loại state thường bị nhầm lẫn trong ứng dụng React:

- **Local/client state:** dữ liệu tương tác ngắn hạn, như chữ đang gõ trong ô tìm kiếm.
- **URL state:** thành phố đang xem, biểu diễn bằng route `/weather/:city`.
- **Server state:** forecast lấy từ backend, được TanStack Query cache và đồng bộ.

Thay vì chỉ học cú pháp một hook, nhóm sẽ lần theo một request hoàn chỉnh, quan sát cache trên trình duyệt và thực hiện một thay đổi nhỏ có thể kiểm chứng.

## 2. Kết quả mong đợi sau lab

1. Chỉ ra vai trò của React, React Router, Vite và TanStack Query trong luồng thời tiết.
2. Lần được dữ liệu từ route param tới query hook, API client, backend và ngược về UI.
3. Phân biệt `isPending`, `isFetching`, `data`, lỗi query và trạng thái local.
4. Giải thích tác dụng của `queryKey`, `staleTime`, `gcTime`, retry và invalidate.
5. Thêm một thao tác refresh thủ công dựa trên `refetch` và kiểm tra được request trong Network.
6. Mô tả optimistic update, rollback và việc đồng bộ lại danh sách thành phố.

## 3. Phạm vi và sơ đồ luồng

Lab tập trung vào React, Vite và TanStack Query. Backend được dùng làm nguồn dữ liệu để quan sát luồng, không cần thiết kế lại API.

```text
URL /weather/Hanoi
  → React Router đưa city vào WeatherSection
  → useWeather(city)
  → TanStack Query tìm cache theo queryKey
  → fetchWeather(city) / apiFetch(...)
  → Vite proxy /api → Express → dịch vụ thời tiết
  ← response JSON
  → TanStack Query cập nhật cache
  → React render forecast
```

## 4. Chuẩn bị

### Yêu cầu

- Node.js 24 theo `.nvmrc` (tối thiểu theo `package.json`: Node `>=22.13`).
- npm.
- Visual Crossing API key để làm `WEATHER_API_KEY` cho backend, đăng ký tại https://www.visualcrossing.com/weather-api/.
- Trình duyệt có DevTools.

Nếu chưa có `server/.env`, tạo file này với biến `WEATHER_API_KEY`;

### Cài dependencies

Tại thư mục gốc repo:

```powershell
npm ci
npm ci --prefix server
```

### Chạy ứng dụng

Mở hai terminal tại thư mục repo.

Terminal 1 — backend:

```powershell
npm run dev:server
```

Terminal 2 — frontend:

```powershell
npm run dev
```

Mở địa chỉ Vite in ra, thường là `http://localhost:5173`. Backend mặc định chạy ở `http://localhost:3001`.

Kiểm tra backend:

```powershell
Invoke-RestMethod http://localhost:3001/api/health
```

Kết quả mong đợi có `status: "ok"`.

## 5. Chặng A — tìm điểm khởi chạy và phân loại state

Mở lần lượt:

1. `src/main.jsx`
2. `src/routes.jsx`
3. `src/components/Weather.jsx`
4. `src/components/Input.jsx`
5. `src/settings/SettingsProvider.jsx`

### Nhiệm vụ

Điền bảng sau dựa trên code:

| Dữ liệu | Nằm ở đâu? | Phân loại | Vì sao? |
|---|---|---|---|
| Thành phố đang xem |  |  |  |
| Chữ đang gõ trong ô tìm kiếm |  |  |  |
| Forecast |  |  |  |
| Đơn vị nhiệt độ |  |  |  |

### Kết quả cần đạt

Biết được thành phố đang xem nằm trong URL; chữ đang gõ thuộc local state của input; forecast là server state do TanStack Query quản lý; cài đặt là client state dùng chung, được lưu trong `localStorage`.

## 6. Chặng B — lần request forecast

Đọc theo thứ tự:

1. `src/components/Weather.jsx`: tìm `useParams()` và lời gọi `useWeather(city)`.
2. `src/queries/weatherQueries.js`: tìm `queryKey`, `queryFn`, `enabled`, `staleTime`.
3. `src/queries/queryKeys.js`: xem cách chuẩn hóa tên thành phố.
4. `src/api/weatherApi.js` và `src/api/client.js`: lần request và xử lý response/lỗi.
5. `vite.config.js`: tìm proxy `/api`.
6. `server/src/app.js` và `server/src/services/weatherService.js`: tìm route và dịch vụ trả forecast.

### Nhiệm vụ

Vẽ mũi tên giữa các hàm từ lúc vào `/weather/Hanoi` đến khi forecast hiện trên màn hình. Với mỗi bước, ghi dữ liệu đầu vào và đầu ra.

### Câu hỏi trao đổi

- Vì sao `queryKey` phải có tên thành phố?
- `normalizeCity` giúp tránh loại request/cache nào?
- `queryFn` trả về gì cho TanStack Query?
- Nếu `city` rỗng thì `enabled` có tác dụng gì?

## 7. Chặng C — quan sát cache và chính sách làm mới

Mở React Query Devtools và tab Network của trình duyệt.

1. Vào `/weather/Hanoi`; xác nhận request forecast đầu tiên.
2. Mở trang Air Conditions của Hanoi rồi quay lại trang thời tiết.
3. Quan sát query key và Network; kiểm tra response có được dùng lại từ cache không.
4. Trong một nhánh làm việc, tạm đổi `staleTime` của `useWeather` từ 10 phút xuống 5 giây.
5. Chờ hơn 5 giây, rời trang rồi quay lại cùng thành phố; quan sát dữ liệu cũ và request làm mới.
6. Hoàn nguyên `staleTime` về giá trị ban đầu.

### Cấu hình hiện tại

- Forecast: `staleTime` 10 phút trong `src/queries/weatherQueries.js`.
- Query mặc định: `staleTime` 1 phút và `gcTime` 30 phút trong `src/queries/queryClient.js`.
- Query stale có thể refetch khi được dùng lại, khi cửa sổ được focus hoặc khi mạng trở lại (theo mặc định TanStack Query); không có `refetchInterval` riêng.
- Cache chỉ ở bộ nhớ. Project chưa persist query cache qua reload và chưa có hàng đợi mutation ngoại tuyến.

## 8. Chặng D — thực hành thêm nút refresh

### Yêu cầu

Thêm nút **Làm mới forecast** trên trang Weather. Khi bấm:

- gọi lại query hiện tại bằng `refetch`;
- khóa nút trong lúc request chạy;
- đổi nhãn nút khi đang tải;
- không gọi trực tiếp `fetchWeather` từ component.

### Gợi ý triển khai

`WeatherSection` đã lấy `refetch`, `isFetching` và `isPending` từ `useWeather(city)`. Đặt nút trong `WeatherSection` là cách ngắn nhất vì component này đã có các giá trị đó.

```jsx
<button onClick={() => refetch()} disabled={isFetching}>
  {isFetching ? 'Đang cập nhật…' : 'Làm mới forecast'}
</button>
```

Đặt nút ở vị trí hợp lý trong JSX của `WeatherSection`. Thử bấm nút và xác nhận có request mới trong Network. `refetch()` chủ động chạy lại `queryFn`, kể cả khi cache còn fresh.

### Tiêu chí hoàn thành

- Nút chỉ xuất hiện ở trang Weather.
- Trong lúc request chạy, nút không thể bị bấm liên tục.
- Sau response, giao diện vẫn lấy forecast từ `data` của query.
- Component không tự tạo bản forecast thứ hai trong `useState`.

## 9. Chặng E — optimistic update và rollback

Đọc `src/queries/cityQueries.js`, đặc biệt `useAddCity` và `useDeleteCity`.

1. Mở trang Cities và thêm một thành phố hợp lệ.
2. Quan sát cache/danh sách thay đổi trước khi server trả kết quả.
3. Thử tên thành phố không có dữ liệu thời tiết.
4. Quan sát danh sách được khôi phục và lỗi được hiển thị.
5. Xóa một thành phố hợp lệ và quan sát optimistic update.

Vẽ chuỗi callback cho mutation thêm thành phố: `onMutate` → `mutationFn` → `onError` nếu lỗi → `onSettled`. Giải thích vì sao sau mutation cần invalidate `['saved-cities']`.

## 10. Bài tập nhỏ kèm đáp án

### Bài 1 — cùng tên nhưng khác thành phố thì cache ra sao?

**Câu hỏi:** Hanoi và Hue có dùng chung một cache entry không?

**Đáp án:** Không. Query key chứa city đã chuẩn hóa, nên mỗi thành phố có entry riêng, ví dụ `['weather', 'hanoi']` và `['weather', 'hue']`.

### Bài 2 — viết hoa/thừa khoảng trắng

**Câu hỏi:** `Hanoi`, ` hanoi ` và `HANOI` được chuẩn hóa thành gì?

**Đáp án:** `normalizeCity` trim, gộp khoảng trắng và chuyển chữ thường; cả ba thành `hanoi` và dùng cùng query key.

### Bài 3 — `isPending` hay `isFetching`?

**Câu hỏi:** Khi đã có forecast cache nhưng đang chạy background refetch, trạng thái nào đúng?

**Đáp án:** `isFetching` là `true`; `isPending` thường là `false` vì query đã có data. Có thể tiếp tục hiển thị forecast cũ trong lúc cập nhật.

### Bài 4 — `staleTime` và `gcTime` có giống nhau không?

**Đáp án:** Không. `staleTime` xác định trong bao lâu data được xem là fresh. `gcTime` xác định thời gian giữ query không còn được component sử dụng trước khi dọn cache.

### Bài 5 — vì sao 404 không retry?

**Đáp án:** `queryClient.js` trả `false` cho lỗi HTTP 4xx. Nhập sai tên thành phố thường không tự trở thành hợp lệ sau vài giây; lỗi mạng/5xx mới được retry tối đa hai lần.

### Bài 6 — refresh có bỏ qua cache không?

**Đáp án:** `refetch()` chạy lại `queryFn`, nên gửi request mới. Kết quả nhận được sau đó cập nhật entry cache hiện tại.

### Bài 7 — vì sao không để forecast trong `useState` của Weather?

**Đáp án:** Forecast là server state, có thể dùng chung giữa nhiều trang và cần cache/làm mới/xử lý lỗi. TanStack Query quản lý vòng đời đó; `useState` phù hợp hơn cho trạng thái giao diện như nội dung đang gõ.

### Bài 8 — điều gì xảy ra sau khi thêm thành phố thất bại?

**Đáp án:** `onMutate` lưu snapshot và cập nhật cache lạc quan; `onError` khôi phục snapshot; `onSettled` invalidate query để danh sách cuối cùng khớp server.

## 11. Lỗi thường gặp và cách gỡ

| Triệu chứng | Nguyên nhân thường gặp | Cách kiểm tra/sửa |
|---|---|---|
| Vite báo `ECONNREFUSED` cho `/api/...` | Backend chưa chạy hoặc không nghe ở cổng proxy | Chạy `npm run dev:server` ở terminal riêng; kiểm tra `/api/health` trên cổng 3001. |
| `MISSING_API_KEY` hoặc forecast lỗi | Backend chưa nhận `WEATHER_API_KEY` | Kiểm tra `server/.env` cục bộ và khởi động lại backend; không đưa key vào frontend. |
| Đổi city nhưng thấy forecast cũ | Query key bị hard-code hoặc không có city | Dùng `queryKeys.weather(city)`; kiểm tra `normalizeCity`. |
| Không thấy request mới khi mở lại trang | Cache còn fresh | Kiểm tra `staleTime`, query key và Devtools; cache reuse là hành vi mong đợi. |
| `isPending` không hiện khi refresh nền | Query đã có data nên không còn pending lần đầu | Dùng `isFetching` để biểu diễn mọi request đang chạy; dùng `isPending` cho lần tải chưa có data. |
| Thành phố sai thử lại nhiều lần | Retry không phân biệt lỗi đầu vào | Giữ retry tắt cho 4xx; hiển thị lỗi và cho người dùng sửa query. |
| Thêm thành phố hiện rồi biến mất | Server từ chối mutation và rollback hoạt động | Xem phản hồi API/error UI; đây là kết quả mong đợi với city không hợp lệ. |
| Cache biến mất sau reload | Query cache chỉ ở bộ nhớ | Đây là giới hạn hiện tại; persistence/offline cache chưa được cài. |

## Tài liệu chính thức

- [React Learn](https://react.dev/learn)
- [Vite 6 Guide](https://v6.vite.dev/guide/)
- [TanStack Query React Quick Start](https://tanstack.com/query/latest/docs/framework/react/quick-start)
- [TanStack Query Caching](https://tanstack.com/query/latest/docs/framework/react/guides/caching)
- [TanStack Query Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)
- [React Router Tutorial](https://reactrouter.com/tutorials/quickstart)
