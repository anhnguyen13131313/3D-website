# CHROME//LAB

Trải nghiệm triển lãm 3D tương tác, xây dựng bằng React, TypeScript, Vite, React Three Fiber, Drei và GSAP ScrollTrigger.

```sh
npm install
npm run dev
npm run lint
npm test
npm run build
npm run preview
```

## Trải nghiệm

- Hero “MATTER. UNBOUND.” với dải chrome tự tạo, phản xạ studio và chuyển động theo con trỏ có quán tính.
- Chuyển đổi chất liệu Chrome / Glass ngay trên hero.
- Ba tác phẩm: **Continuum**, **Soft distortion**, **Afterimage**. Một mesh biến đổi liên tục giữa dải gấp, khối hữu cơ và dải xoắn; chọn liên tiếp vẫn chuyển từ hình đang nhìn thấy.
- **Surface lab +** trên hero hoặc trong Inspect mở bộ điều khiển tint, roughness, metalness, transmission và iridescence. Bốn preset: Mercury, Prism, Pink porcelain, Titanium. Panel nằm bên phải trên desktop, bên dưới canvas trên mobile.
- **Inspect artwork** mở chế độ xoay và phóng to bằng chuột hoặc cảm ứng. Escape đóng hộp thoại và trả focus về nút mở.
- Finale “STAY CURIOUS.” và liên kết quay lại đầu trang.
- Tự nhận `prefers-reduced-motion`; nút cuối trang cũng cho phép giảm chuyển động thủ công.

## Kiến trúc component

`App.tsx` quản lý tác phẩm được chọn, chất liệu, chương hiện tại, trạng thái tải/lỗi và hộp thoại. Nội dung HTML được hiển thị độc lập với WebGL, nên vẫn đọc và điều hướng được khi scene tải hoặc gặp lỗi.

`Exhibition.tsx` hiển thị danh sách tác phẩm và chú thích. Dữ liệu tập trung trong `data/artworks.ts`. `Inspector.tsx` sử dụng native `<dialog>` để giữ focus, hỗ trợ Escape và khôi phục focus khi đóng.

`FormPicker.tsx` dùng chung cho Inspector và `ShaderLab.tsx`. Các nút chọn form/preset có `aria-pressed`; slider dùng input native có label, điều khiển bằng bàn phím. Ô tint chấp nhận mã hex RGB hợp lệ; nhập sai không truyền màu lỗi vào renderer, rời ô sẽ khôi phục màu đang dùng. Panel mobile cuộn độc lập để tiếp cận toàn bộ điều khiển.

## State React trong Phase 1

`App` giữ `selected`, `labOpen`, `surfaceOverride` và `overridePreset`. Form đang render là tác phẩm đã chọn khi ở gallery/Inspect, còn hero/finale dùng Continuum. Khi chưa chỉnh chất liệu, `surfaceOverride = null`: mỗi form theo preset trong `data/surfaces.ts`. Chọn preset hoặc kéo slider tạo override; override giữ nguyên khi đổi form, đóng/mở Inspect hoặc cuộn sang chương khác. Chỉnh thủ công bỏ trạng thái preset đã chọn. **Reset material** xóa override và khôi phục chất liệu mặc định của form hiện tại. State chỉ tồn tại trong phiên trang, chưa lưu qua reload.

Luồng dữ liệu: sự kiện từ `ShaderLab` → callback trong `App` → `sanitizeSurface` giới hạn số trong 0–1 và kiểm tra màu → props `SceneCanvas` → `Sculpture`. State UI không cập nhật theo từng frame. Khi reduced motion bật, thay đổi props gọi `invalidate()` để render một frame mới.

`SceneCanvas.tsx` sở hữu **một Canvas và một WebGLRenderer**. Canvas được portal vào một DOM host cố định; khi Inspect mở, host được chuyển vào hộp thoại mà không remount Canvas. Khi đóng, host quay về `document.body`. Camera được đặt lại sau khi rời chế độ orbit.

`SceneBoundary.tsx` bảo vệ cả tải module scene và quá trình render. Nếu WebGL hoặc chunk tải thất bại, ứng dụng giữ nguyên nội dung HTML và hiển thị hình thay thế bằng CSS.

## Luồng render 3D

`geometry.ts` tạo `BufferGeometry` bằng công thức tham số: một dải tiết diện ellipse xoắn dọc đường cong, một thể tích hữu cơ biến dạng và một dải xoắn ốc. Không sử dụng GLB, ảnh nền hoặc torus knot có sẵn.

`morphGeometry.ts` tạo ba target trước frame đầu với cùng grid 192×48: **9.457 vertex, 18.432 triangle**. Mọi target dùng chung thứ tự vertex/index; hướng xoay riêng được bake vào buffer, normals được tính lại và nối mượt tại seam. Hai bộ position/normal target được gắn vào `morphAttributes`; bounding sphere bao cả ba form để tránh bị culling sai trong quá trình morph.

`Sculpture.tsx` giữ một geometry và một `MeshPhysicalMaterial` trong suốt phiên, giải phóng geometry khi unmount. `surfaceMaterial.ts` áp dụng tham số trực tiếp lên material; khi chưa có override, màu trong không gian tuyến tính và các giá trị chất liệu blend cùng trọng số hình học. Roughness cũng làm mềm lớp clearcoat để hiệu ứng slider rõ ràng. Khi có override, chỉnh sửa có hiệu lực ở frame kế tiếp, không chờ morph hoàn tất.

`Studio.tsx` dùng `Environment` cùng `Lightformer` để chụp phản xạ studio một lần, độ phân giải 256. Các nguồn sáng trắng tạo cạnh phản xạ rõ; một nguồn hồng tạo điểm nhấn. Không có bloom hoặc postprocessing.

R3F quản lý renderer và vòng lặp. DPR giới hạn 1.5 trên desktop và 1.25 trên mobile. Tab ẩn dừng render; reduced motion dùng `frameloop="demand"`. Scene được tải bằng dynamic import; Three và Fiber được tách thành các chunk riêng. Font được đóng gói cục bộ qua Fontsource.

## Luồng animation

`morph.ts` là bộ điều khiển độc lập với React. Nó giữ ba trọng số trong `Float32Array`, tổng bằng 1. `Sculpture.useFrame` tiến transition khoảng 1,3 giây bằng smootherstep bậc 5, rồi cập nhật hai `morphTargetInfluences`; trọng số base là phần còn lại. GPU nội suy **position và normal**, không tạo lại mesh hoặc tính lại hàng nghìn vertex trên CPU mỗi frame. Công thức vị trí là `P = w0 × Continuum + w1 × SoftDistortion + w2 × Afterimage`.

Khi chọn form mới giữa transition, `retargetMorph` chụp trọng số hiện tại làm điểm bắt đầu. Vị trí không nhảy về form cũ; tốc độ easing khởi động lại nên đây là tính liên tục về vị trí, không phải bộ bảo toàn vận tốc. Morph hoạt động trong hệ tọa độ cục bộ; pointer/scroll vẫn điều khiển group cha nên hai luồng không ghi đè nhau. Reduced motion đặt trọng số đích ngay lập tức và tắt damping OrbitControls.

`useExperienceMotion.ts` tạo ScrollTrigger theo từng section và ghi các giá trị `hero`, `gallery`, `finale` vào một mutable ref. React chỉ cập nhật state khi thay đổi chương; không re-render ở mỗi frame.

`SceneRig` đọc ref trong `useFrame`, kết hợp tiến độ cuộn với con trỏ rồi dùng damping theo delta time để cập nhật vị trí, góc xoay, scale và khoảng cách camera. Hình học di chuyển từ hero sang vùng trưng bày rồi trở lại ở finale. Vùng gallery được đo theo scroll/resize để scene bám đúng layout trên điện thoại.

GSAP điều khiển entrance 0.85 giây, stagger 0.1 giây, headline parallax và dòng tuyên ngôn. `gsap.context().revert()` cùng các cleanup effect dọn trigger và listener khi unmount, tương thích React StrictMode.

Reduced motion bỏ entrance/parallax, phản ứng con trỏ, camera interpolation và smooth scrolling. Người dùng vẫn có thể chọn tác phẩm, đổi chất liệu và chủ động xoay tác phẩm trong Inspect.

## Giới hạn kỹ thuật Phase 1

- Đây là nội suy các surface tham số có vertex tương ứng, chưa phải mô phỏng chất lỏng. Khi đi giữa vòng kín, khối có cực và xoắn hở, các tam giác có thể gấp, co hoặc xuyên nhau ở hình trung gian. Normals nội suy giúp ánh sáng ổn định nhưng không phải normals tính lại chính xác cho mọi hình trung gian. GLB bất kỳ cần retopology/ánh xạ vertex trước khi làm target.
- Transmission và iridescence giữ giá trị GPU tối thiểu `0.00001` khi UI là 0, giúp giữ shader feature đã compile khi kéo qua điểm 0. Đổi lại, bề mặt opaque vẫn tốn transmission pass. DPR được giới hạn; chưa có benchmark trên thiết bị yếu thực tế.
- Kính dùng `MeshPhysicalMaterial`, không có spectral path tracing hay mô phỏng khúc xạ vật lý đầy đủ. Transmission thấy rõ hơn khi metalness thấp. Phase 1 chưa thêm deformation/distortion shader, lưu preset tùy chỉnh hoặc export.

## Phiên bản và kiểm tra

React 19 đi cùng Fiber 9 và Drei 10; Three.js cùng types sử dụng dòng 0.183. Pin Three 0.136 trong cinematic skill không đáp ứng peer dependency của Fiber 9 nên đã được thay bằng phiên bản tương thích.

Kiểm tra bằng Chrome trên production preview: desktop và viewport 390px, đổi nhanh form, preset, cả bốn slider, tint hợp lệ/không hợp lệ, giữ override khi đổi form, Reset, mở/đóng Inspect, Escape/focus, reduced motion và overflow. `npm test` chạy 7 test cho buffer/normal tương thích, endpoint/bounds, midpoint, retarget, reduced motion, validation và material version ổn định (có kiểm tra red/green cho regression qua điểm 0). `npm run lint` và `npm run build` xác nhận source và bundle. Console không có lỗi runtime trong lượt kiểm tra; dependency còn cảnh báo deprecation `THREE.Clock`. Không có backend hoặc dịch vụ bên ngoài cần cấu hình.
