# 1. 🏗️ System Architecture & Tech Stack

- Kiến trúc tổng thể hiện tại: Client-Server tách biệt, Frontend React (Vite) giao tiếp Backend REST API (Express).
- Backend đang được thiết kế theo Modular Monolith + N-Tier (Route -> Controller -> Service -> Repository -> Model), thể hiện ở cấu trúc modules và tài liệu docs.
- Frontend đi theo Layered Frontend + package-based componentization (components chia theo package riêng cho hook/service/sub-components).

## Frontend Tech Stack (đã cài đặt)

- React 19, React DOM 19
- React Router DOM 7
- Zustand 5 (đã cài, chưa có logic store thực thi)
- Axios 1.x
- Tailwind CSS v4 + @tailwindcss/vite
- Vite 8 beta + @vitejs/plugin-react
- react-hot-toast
- framer-motion, lucide-react (đã cài nhưng chưa dùng vào feature chính)

## Backend Tech Stack (đã cài đặt)

- Express 5
- Mongoose 9
- jsonwebtoken 9 (JWT/JWS)
- bcryptjs
- cookie-parser
- cors
- dotenv, cross-env, nodemon
- mailtrap (đã cài, chưa tích hợp logic mail trong flow hiện tại)

## Design Patterns đang thể hiện trong code

- HTTP Helper Class pattern: wrapper Axios + interceptor chuẩn hóa response/error.
- Route Guard pattern (Frontend): ProtectedRoute + RedirectAuthenticatedUser.
- Centralized API endpoint config: gom endpoint theo domain trong 1 file config.
- Lazy loading routes (code splitting) với Suspense.
- Controller-Service-Repository pattern (Backend): đã có khung rõ, nhưng mới thực thi một phần ở auth service.

---

# 2. 📁 Detailed Folder Structure

## Client Tree

```text
client/
├── docs/                              # Tài liệu kiến trúc FE và route pages
│   ├── ARCHITECTURE.md                # Mô tả kiến trúc FE mục tiêu
│   └── PAGES.md                       # Danh sách route theo role
├── package.json                       # Dependencies/scripts FE
├── vite.config.js                     # Vite config, alias, tailwind plugin, dev server
├── public/
│   └── vite.svg
└── src/
    ├── main.jsx                       # Entry point React + BrowserRouter
    ├── App.jsx                        # Root app wrapper (Layout + Router + Toaster)
    ├── Layout.jsx                     # Layout điều kiện hiển thị nav + scroll to top UI
    ├── index.css                      # Tailwind v4 import
    ├── assets/
    ├── config/
    │   └── apiConfig.js               # Endpoint constants theo domain
    ├── utils/
    │   └── httpHelper.js              # Axios helper class (baseURL, interceptors)
    ├── hooks/
    │   └── useScrollToTop.js          # Hook điều khiển nút scroll top
    ├── stores/
    │   ├── AuthStore.jsx              # Global auth state (đang rỗng)
    │   └── ThemeStore.jsx             # Theme store (đang rỗng)
    ├── routes/
    │   ├── AppRouter.jsx              # Route map + lazy pages + redirect auth
    │   └── ProtectedRoute.jsx         # Guard route theo login state + role
    ├── components/
    │   ├── Navigation/                # Navbar package (toàn bộ file đang rỗng)
    │   └── GameBoard/                 # Gameboard package (toàn bộ file đang rỗng)
    └── pages/
        ├── Guest/                     # Landing/Login/Register (placeholder)
        ├── Player/                    # Profile/Game pages (placeholder)
        └── Admin/                     # Admin pages (placeholder)
```

## Server Tree

```text
server/
├── docs/                              # Tài liệu kiến trúc, endpoint, model
│   ├── ARCHITECTURE.md
│   ├── ENDPOINTS.md
│   └── MODELS.md
├── package.json                       # Dependencies/scripts BE
└── src/
    ├── index.js                       # Server bootstrap + connect DB + listen
    ├── app.js                         # Khởi tạo Express app + middlewares chung
    ├── config/
    │   └── db.config.js               # Kết nối MongoDB bằng mongoose
    ├── middlewares/
    │   ├── authMiddleware.js          # JWT verify middleware (đang rỗng)
    │   └── roleMiddelware.js          # Role middleware (đang rỗng, tên file typo)
    ├── utils/
    │   └── token.util.js              # Tạo JWT/JWS + set cookie
    └── modules/
        ├── auth/
        │   ├── models/user.model.js   # User schema có role/isActive/loginAttempts
        │   ├── services/auth.service.js # Business logic register/login/check-auth
        │   ├── routes/auth.routes.js  # Khai báo endpoint auth
        │   ├── controllers/           # Đang rỗng
        │   ├── repositories/          # Đang rỗng
        │   ├── dtos/                  # Đang rỗng
        │   └── interfaces/            # Đang rỗng
        ├── game/                      # Có model, còn lại phần lớn rỗng
        ├── room/                      # Có model, còn lại phần lớn rỗng
        ├── wallet/                    # Có model, còn lại phần lớn rỗng
        ├── profile/                   # Khung module, chưa có logic
        ├── subscription/              # Khung module, chưa có logic
        └── admin/                     # Khung module, chưa có logic
```

---

# 3. ✅ Current Implemented Features (Tính năng đã có code thực tế)

## Frontend

### Đánh giá task: Configure React Router (Protected Routes) to manage login state using JWS (FE)

- Trạng thái: CHƯA HOÀN THIỆN.
- Đã có phần route protection skeleton:
  - AppRouter có route phân tầng Guest/Player/Admin, lazy loading pages, redirect khi đã authenticated.
  - ProtectedRoute có check isAuthenticated, user, isCheckingAuth và allowedRoles.
- Chưa có phần state login chạy thực tế bằng JWS:
  - AuthStore đang rỗng nên không có checkAuth/login/logout thực thi.
  - Chưa có logic FE đọc và đồng bộ phiên từ cookie JWT qua API check-auth.
- Các file liên quan trực tiếp task FE này:
  - client/src/main.jsx
  - client/src/App.jsx
  - client/src/Layout.jsx
  - client/src/routes/AppRouter.jsx
  - client/src/routes/ProtectedRoute.jsx
  - client/src/stores/AuthStore.jsx
  - client/src/utils/httpHelper.js
  - client/src/config/apiConfig.js

### Phần frontend đã có logic thật

- main.jsx: mount BrowserRouter.
- App.jsx: compose Layout + AppRouter + Toaster.
- Layout.jsx:
  - Ẩn navigation tại route guest.
  - Scroll top khi đổi route.
  - Có nút scroll top dựa trên hook.
- AppRouter.jsx:
  - Lazy load pages bằng React.lazy.
  - RedirectAuthenticatedUser điều hướng theo role.
  - Route protected cho player/admin pages.
- ProtectedRoute.jsx:
  - Chặn truy cập nếu chưa login.
  - Chặn truy cập sai role.
- httpHelper.js:
  - Axios instance, baseURL theo môi trường, withCredentials=true.
  - Response interceptor trả data thuần.
  - Error interceptor chuẩn hóa message.
- apiConfig.js:
  - Endpoint map theo module AUTH/PROFILE/GAME/ROOM/SUBSCRIPTION/WALLET/ADMIN.
- useScrollToTop.js:
  - Quản lý show/hide nút scroll top (lưu ý đang dùng screenY thay vì scrollY).

## Backend

### Phần backend đã có logic thật

- src/index.js:
  - Load env, gọi connectDB, start server theo PORT.
- src/app.js:
  - Middleware CORS, JSON parser, cookie parser.
- src/config/db.config.js:
  - Kết nối MongoDB với MONGO_URI bằng mongoose.
- src/utils/token.util.js:
  - Tạo JWT/JWS chứa userId + role.
  - Set cookie token httpOnly, sameSite strict, maxAge 7 ngày.
- modules/auth/services/auth.service.js:
  - registerUser: validate input, regex email/username/password, hash password, tạo token.
  - loginUser: check tài khoản active, chống brute-force bằng loginAttempts/lockUntil, verify password, reset attempts.
  - checkAuthUser.
- modules/auth/routes/auth.routes.js:
  - Khai báo endpoint register/login/logout/check-auth.
- Mongoose models đã có schema chi tiết:
  - auth/models/user.model.js
  - game/models/gameSession.model.js
  - room/models/gameRoom.model.js
  - wallet/models/transaction.model.js

### Lưu ý backend chưa hoàn chỉnh cho flow auth

- auth controller/repository/middleware còn rỗng nên endpoint chưa chạy end-to-end.
- app.js chưa mount auth router (và các router khác) vào /api/v1.

---

# 4. 🚧 Empty / Placeholder Areas

## Empty files (0 byte) nổi bật

### Frontend

- Stores:
  - client/src/stores/AuthStore.jsx
  - client/src/stores/ThemeStore.jsx
- Navigation package:
  - client/src/components/Navigation/index.jsx
  - client/src/components/Navigation/useNavigation.hook.js
  - client/src/components/Navigation/sub-components/MobileMenu.jsx
  - client/src/components/Navigation/sub-components/NavLink.jsx
  - client/src/components/Navigation/sub-components/ProfileDropdown.jsx
- GameBoard package:
  - client/src/components/GameBoard/index.jsx
  - client/src/components/GameBoard/game.service.js
  - client/src/components/GameBoard/useGame.hook.js
  - client/src/components/GameBoard/sub-components/ChatOverlay.jsx
  - client/src/components/GameBoard/sub-components/GridCell.jsx

### Backend

- Middlewares:
  - server/src/middlewares/authMiddleware.js
  - server/src/middlewares/roleMiddelware.js
- Auth module thiếu lớp xử lý:
  - server/src/modules/auth/controllers/auth.controller.js
  - server/src/modules/auth/repositories/auth.repository.js
  - server/src/modules/auth/dtos/auth.dto.js
  - server/src/modules/auth/interfaces/auth.interface.js
- Các module admin/game/profile/room/subscription/wallet: đa số controller/service/repository/routes/dto/interface đang rỗng.

## Placeholder code (không có logic nghiệp vụ)

- Hầu hết pages FE hiện chỉ có comment route:
  - client/src/pages/Guest/*
  - client/src/pages/Player/*
  - client/src/pages/Admin/*
- Ví dụ: Login/Register/Profile/AdminDashboard đều chưa có form/view/business action thật.

## Inconsistencies/typo cần chú ý

- AppRouter import Admin PlayerManagement nhưng thư mục thực tế là PlayerManagament.
- roleMiddelware.js sai chính tả tên middleware.
- subsciption.interface.js và subcription.service.js sai chính tả tên file.

---

# 5. 🎯 Immediate Next Steps (Action Items cần làm NGAY BÂY GIỜ)

## FE Checklist (Sprint 1)

- [ ] Implement AuthStore đầy đủ tại client/src/stores/AuthStore.jsx
  - State: user, isAuthenticated, isCheckingAuth, isLoading, error.
  - Actions: register, login, logout, checkAuth.
  - Kết nối API AUTH qua httpHelper + apiConfig.
- [ ] Hoàn thiện Login page tại client/src/pages/Guest/Login/index.jsx
  - Form validation cơ bản.
  - Submit gọi AuthStore.login.
  - Điều hướng theo role sau đăng nhập.
- [ ] Hoàn thiện Register page tại client/src/pages/Guest/Register/index.jsx
  - Form đăng ký + call AuthStore.register.
- [ ] Hoàn thiện Profile page tại client/src/pages/Player/Profile/index.jsx
  - Hiển thị user info + nút logout.
- [ ] Hoàn thiện Navigation component tại client/src/components/Navigation/index.jsx
  - Menu theo trạng thái auth và role.
- [ ] Sửa import path mismatch Admin PlayerManagement trong AppRouter hoặc đổi tên thư mục/file tương ứng.
- [ ] Sửa hook useScrollToTop dùng window.scrollY thay cho window.screenY.

## BE Checklist (Sprint 1)

- [ ] Implement AuthRepository tại server/src/modules/auth/repositories/auth.repository.js
  - Các hàm service đang cần: findByEmailOrUsername, createUser, findById, incrementLoginAttempts, resetLoginAttempts, updateLastLogin.
- [ ] Implement AuthController tại server/src/modules/auth/controllers/auth.controller.js
  - register, login, logout, checkAuth.
- [ ] Implement verifyToken middleware tại server/src/middlewares/authMiddleware.js
  - Verify JWT từ cookie và inject req.userId/req.role.
- [ ] Implement role middleware tại server/src/middlewares/roleMiddelware.js
  - authorizeRoles cho ADMIN/PLAYER.
- [ ] Mount auth routes trong server/src/app.js
  - app.use("/api/v1/auth", authRouter).
- [ ] Thêm global error handler middleware trong server/src/app.js.
- [ ] Hoàn thiện tối thiểu Profile CRUD cho Sprint 1:
  - server/src/modules/profile/routes/profile.routes.js
  - server/src/modules/profile/controllers/profile.controller.js
  - server/src/modules/profile/services/profile.service.js
  - server/src/modules/profile/repositories/profile.repository.js

## Thứ tự code đề xuất ngay

1. server/src/modules/auth/repositories/auth.repository.js
2. server/src/modules/auth/controllers/auth.controller.js
3. server/src/middlewares/authMiddleware.js
4. server/src/app.js
5. client/src/stores/AuthStore.jsx
6. client/src/pages/Guest/Login/index.jsx
7. client/src/pages/Guest/Register/index.jsx
8. client/src/components/Navigation/index.jsx
9. client/src/pages/Player/Profile/index.jsx
10. client/src/routes/AppRouter.jsx (fix PlayerManagement path)
