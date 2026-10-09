# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  # سرای اقساطی

  پایه فرانت‌اند پنل تسهیلات با React، TypeScript، Vite، MUI، Tailwind CSS و React Query.

  ## اجرا

  ```sh
  npm install
  npm run dev
  ```

  اگر API روی origin جداگانه اجرا می‌شود، `VITE_API_BASE_URL` را در `.env.local` تنظیم کنید. مقدار خالی یعنی درخواست‌ها به همان origin فرانت‌اند ارسال می‌شوند. سرور API باید CORS را برای origin فرانت‌اند مجاز کند.

  ```env
  VITE_API_BASE_URL=http://<api-host>:<port>
  ```

  ## مسیرها

  - `/login` و `/register`
  - `/user/dashboard`، `/user/loan-requests` و `/user/loans`
  - `/admin/dashboard`

  مسیرهای پنل با نقش کاربر محافظت می‌شوند. صفحات درخواست و وام فعلاً placeholder هستند.

  ## قراردادهای مصرف‌شده

  - احراز هویت: `POST /auth/login`، `POST /auth/register`، `POST /auth/refresh` و `GET /auth/me`
  - داشبورد: `GET /loan-requests/me` و `GET /loans/me`
  - مجموعه‌های داشبورد به‌صورت آرایه یا `{ data: [] }` خوانده می‌شوند. قرارداد دقیق statusها، اقساط و واحد پول در repository موجود نبود؛ مانده فقط از `remainingBalance`، `remainingAmount` یا اقساط پاسخ محاسبه می‌شود.
  - Access و refresh token در `localStorage` ذخیره می‌شوند. refresh به‌شکل single-flight انجام می‌شود و هر درخواست حداکثر یک بار retry می‌شود.

  ## بررسی‌ها

  ```sh
  npm run build
  npm run lint
  ```

  در حال حاضر script یا فایل تستی در پروژه تعریف نشده است.
        // Enable lint rules for React

      ## پنل فروشگاه

      - مسیرها: `/shop/login`، `/shop/setup-password`، `/shop/dashboard`، `/shop/transactions` و `/shop/profile`.
      - توکن‌های فروشگاه جدا از نشست کاربر و مدیر در `localStorage` نگهداری می‌شوند؛ این ذخیره‌سازی در برابر XSS معادل کوکی `HttpOnly` نیست.
      - خروج فروشگاه فقط نشست محلی و داده‌های React Query مربوط به فروشگاه را پاک می‌کند. API خروج/ابطال توکن وجود ندارد و access token صادرشده تا زمان انقضای خود ممکن است معتبر بماند.
      - کد تنظیم رمز فقط در پاسخ یک‌باره مدیر نمایش داده می‌شود، ۳۰ دقیقه اعتبار دارد و باید از مسیر امن تحویل شود. صدور کد جدید، کد قبلیِ در انتظار را نامعتبر می‌کند.
