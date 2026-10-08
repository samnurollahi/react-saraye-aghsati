import { useState } from 'react'
import { AccountBalanceWallet, AccountCircle, Dashboard, Group, Logout, Menu, PaymentsOutlined, RequestQuote, Storefront } from '@mui/icons-material'
import { AppBar, Box, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material'
import { useSnackbar } from 'notistack'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/auth-hooks'
import { BrandLogo } from '../../components/BrandLogo'

const drawerWidth = 264
const navItems = [
  { label: 'داشبورد', path: '/admin/dashboard', icon: <Dashboard /> },
  { label: 'درخواست‌های وام', path: '/admin/loan-requests', icon: <RequestQuote /> },
  { label: 'وام‌ها', path: '/admin/loans', icon: <AccountBalanceWallet /> },
  { label: 'مدیریت اقساط', path: '/admin/installments', icon: <PaymentsOutlined /> },
  { label: 'کاربران', path: '/admin/users', icon: <Group /> },
  { label: 'مدیریت فروشگاه‌ها', path: '/admin/shops', icon: <Storefront /> },
]

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, signOut } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const currentTitle = navItems.find((item) => location.pathname.startsWith(item.path))?.label ?? 'پنل مدیریت'

  const logout = () => {
    signOut()
    enqueueSnackbar('از حساب کاربری خارج شدید.', { variant: 'info' })
    navigate('/login', { replace: true })
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ gap: 1.5, justifyContent: 'flex-start' }}>
        <BrandLogo compact />
        <Box><Typography sx={{ fontWeight: 700 }}>سرای اقساطی</Typography><Typography variant="caption" color="text.secondary">پنل مدیریت</Typography></Box>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {navItems.map((item) => (
          <ListItemButton key={item.path} component={NavLink} to={item.path} onClick={() => setMobileOpen(false)} sx={{ borderRadius: 1.5, mb: 0.5, '&.active': { bgcolor: 'primary.main', color: 'primary.contrastText', '& .MuiListItemIcon-root': { color: 'inherit' } } }}>
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon><ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <List sx={{ px: 1.5, py: 1 }}><ListItemButton onClick={logout} sx={{ borderRadius: 1.5 }}><ListItemIcon sx={{ minWidth: 40 }}><Logout /></ListItemIcon><ListItemText primary="خروج از حساب" /></ListItemButton></List>
    </Box>
  )

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      <AppBar position="fixed" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', left: 0, right: { md: `${drawerWidth}px` } }}>
        <Toolbar sx={{ gap: 1.5 }}>
          {!isDesktop && <IconButton aria-label="باز کردن منو" onClick={() => setMobileOpen(true)} edge="start"><Menu /></IconButton>}
          <Typography sx={{ fontWeight: 700 }}>{currentTitle}</Typography><Box sx={{ flex: 1 }} /><AccountCircle color="action" /><Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.fullName}</Typography>
        </Toolbar>
      </AppBar>
      <Box component="nav" aria-label="ناوبری مدیریت">
        <Drawer variant="temporary" anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}>{drawer}</Drawer>
        <Drawer variant="permanent" anchor="left" open sx={{ display: { xs: 'none', md: 'block' }, width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid', borderLeft: 0, borderColor: 'divider' } }}>{drawer}</Drawer>
      </Box>
      <Box component="main" sx={{ flex: 1, minWidth: 0, pt: 10, px: { xs: 2, sm: 3, lg: 4 }, pb: 4 }}><Outlet /></Box>
    </Box>
  )
}