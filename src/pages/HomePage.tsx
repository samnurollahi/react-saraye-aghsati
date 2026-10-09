import { useState } from 'react'
import { ArrowBack, Calculate, Chair, Devices, Home, ShoppingCart } from '@mui/icons-material'
import { Box, Button, Container, Slider, Stack, TextField, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { BrandLogo } from '../components/BrandLogo'
import { useAuth } from '../features/auth/auth-hooks'
import { formatMoney } from '../utils/formatters'
import './HomePage.css'

const categories = [
  { icon: <Devices />, title: 'موبایل و دیجیتال', description: 'گوشی، لپ‌تاپ و لوازم جانبی' },
  { icon: <Chair />, title: 'لوازم خانه', description: 'مبلمان و وسایل کاربردی خانه' },
  { icon: <Home />, title: 'لوازم خانگی', description: 'از آشپزخانه تا خانهٔ هوشمند' },
]

export function HomePage() {
  const { user } = useAuth()
  const [amount, setAmount] = useState('100000000')
  const [rate, setRate] = useState('20')
  const [months, setMonths] = useState(12)

  const principal = Number(amount)
  const interestRate = Number(rate)
  const isValid = Number.isFinite(principal) && principal > 0
    && Number.isFinite(interestRate) && interestRate >= 0 && interestRate <= 100
    && Number.isInteger(months) && months > 0
  const profit = isValid ? principal * interestRate / 100 : 0
  const total = isValid ? principal + profit : 0
  const monthly = isValid ? Math.round(total / months * 100) / 100 : 0
  const startPath = user ? (user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard') : '/register'

  return (
    <main className="home-page" dir="rtl">
      <header className="home-header">
        <Container maxWidth="lg" className="home-header-inner">
          <Link to="/" className="home-brand" aria-label="سرای اقساطی، صفحهٔ اصلی">
            <BrandLogo compact />
            <span>سرای اقساطی</span>
          </Link>
          <nav className="home-nav" aria-label="ناوبری اصلی">
            <a href="#calculator">محاسبهٔ اقساط</a>
            <a href="#services">دسته‌بندی‌ها</a>
          </nav>
          <Button component={Link} to={user ? startPath : '/login'} variant="outlined" className="home-login">
            {user ? 'ورود به پنل' : 'ورود'}
          </Button>
        </Container>
      </header>

      <section className="home-hero">
        <Container maxWidth="lg" className="home-hero-inner">
          <Box className="hero-copy">
            <span className="hero-kicker"><span className="hero-kicker-dot" /> خرید امروز، پرداخت آسوده‌تر</span>
            <Typography component="h1">برای خریدهای مهم،<br /><span>اقساطی برنامه‌ریزی کن.</span></Typography>
            <Typography className="hero-description">
              سرای اقساطی راهی ساده برای دریافت وام خرید محصولات دیجیتال، لوازم خانه و کالاهای موردنیاز شماست.
            </Typography>
            <Stack direction="row" spacing={1.5} className="hero-actions">
              <Button component={Link} to={startPath} variant="contained" endIcon={<ArrowBack />}>
                {user ? 'رفتن به پنل' : 'شروع درخواست وام'}
              </Button>
              <Button component="a" href="#calculator" variant="text" startIcon={<Calculate />}>
                محاسبهٔ اقساط
              </Button>
            </Stack>
            <div className="hero-trust"><span /> شفافیت مبلغ و اقساط، پیش از ثبت درخواست</div>
          </Box>

          <div className="hero-art" aria-hidden="true">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-product product-phone"><Devices /></div>
            <div className="art-product product-home"><Home /></div>
            <div className="art-product product-cart"><ShoppingCart /></div>
            <div className="art-note"><span>خرید قسطی</span><strong>به انتخاب تو</strong></div>
            <div className="art-spark spark-one">✳</div>
            <div className="art-spark spark-two">✳</div>
          </div>
        </Container>
        <div className="hero-bottom-line" />
      </section>

      <section className="calculator-section" id="calculator">
        <Container maxWidth="lg">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">قبل از تصمیم، حسابش کن</span>
              <Typography component="h2">قسط‌ها چقدر می‌شوند؟</Typography>
            </div>
            <p>مبلغ وام، درصد سود و مدت بازپرداخت را وارد کن تا برآوردت را ببینی.</p>
          </div>

          <div className="calculator-layout">
            <div className="calculator-inputs">
              <TextField
                label="مبلغ وام درخواستی"
                type="number"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                fullWidth
                slotProps={{ htmlInput: { min: 1, step: 1000000, inputMode: 'numeric' } }}
              />
              <TextField
                label="درصد سود کل دوره"
                type="number"
                value={rate}
                onChange={(event) => setRate(event.target.value)}
                fullWidth
                slotProps={{ htmlInput: { min: 0, max: 100, step: 'any' } }}
              />
              <div className="months-control">
                <div className="months-heading"><label htmlFor="months-slider">مدت بازپرداخت</label><strong>{new Intl.NumberFormat('fa-IR').format(months)} ماه</strong></div>
                <Slider
                  id="months-slider"
                  value={months}
                  onChange={(_, value) => setMonths(value as number)}
                  min={1}
                  max={60}
                  step={1}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${new Intl.NumberFormat('fa-IR').format(value)} ماه`}
                  aria-label="مدت بازپرداخت به ماه"
                />
                <div className="slider-limits"><span>۱ ماه</span><span>۶۰ ماه</span></div>
              </div>
              {!isValid && <p className="calculator-error" role="alert">مبلغ باید بیشتر از صفر و درصد سود بین صفر تا ۱۰۰ باشد.</p>}
            </div>

            <div className="calculator-result" aria-live="polite">
              <div className="result-topline"><span><Calculate /> برآورد بازپرداخت</span><span className="estimate-tag">تقریبی</span></div>
              <div className="result-primary">
                <span>مبلغ دریافتی</span>
                <strong>{formatMoney(isValid ? principal : 0)}</strong>
              </div>
              <div className="result-row"><span>سود کل</span><strong>{formatMoney(profit)}</strong></div>
              <div className="result-row result-total"><span>مجموع بازپرداخت</span><strong>{formatMoney(total)}</strong></div>
              <div className="monthly-payment"><span>مبلغ هر قسط</span><strong>{formatMoney(monthly)}</strong></div>
              <p className="result-disclaimer">محاسبه بر اساس سود ثابت کل دوره است. مبلغ نهایی و شرایط وام پس از بررسی درخواست مشخص می‌شود.</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="services-section" id="services">
        <Container maxWidth="lg">
          <div className="services-heading">
            <span className="section-eyebrow">برای چیزهایی که زندگی را بهتر می‌کنند</span>
            <Typography component="h2">وام برای خریدهای روزمره و مهم</Typography>
          </div>
          <div className="category-grid">
            {categories.map((category, index) => (
              <article className="category-item" key={category.title}>
                <span className={`category-icon category-icon-${index}`}>{category.icon}</span>
                <div><h3>{category.title}</h3><p>{category.description}</p></div>
                <ArrowBack className="category-arrow" />
              </article>
            ))}
          </div>
          <div className="services-cta">
            <div><strong>آماده‌ای خریدت را شروع کنی؟</strong><span>درخواستت را ثبت کن و مراحل را در پنل پیگیری کن.</span></div>
            <Button component={Link} to={startPath} variant="contained" endIcon={<ArrowBack />}>
              {user ? 'رفتن به پنل' : 'ثبت درخواست'}
            </Button>
          </div>
        </Container>
      </section>

      <footer className="home-footer"><Container maxWidth="lg"><span>سرای اقساطی</span><span>خرید بهتر، با برنامه‌ریزی بیشتر</span></Container></footer>
    </main>
  )
}