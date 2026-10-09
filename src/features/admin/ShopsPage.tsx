import { useEffect, useState } from 'react'
import { Add, ContentCopy, DeleteOutlined, EditOutlined, Key, QrCode2, ToggleOff, ToggleOn } from '@mui/icons-material'
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Paper, Stack, TextField, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import { useSnackbar } from 'notistack'
import { AdminQueryState } from './components/AdminQueryState'
import { ShopFormDialog } from './components/ShopFormDialog'
import type { ShopFormValues } from './components/ShopFormDialog'
import { ShopQrDialog } from './components/ShopQrDialog'
import { useCreateAdminShop, useDeleteAdminShop, useAdminShops, useProvisionAdminShopCredentials, useUpdateAdminShop } from './shop-queries'
import type { AdminShop, ShopSetupTokenResponse } from './shops-api'
import { formatDate } from '../../utils/formatters'
import { ApiError, getErrorMessage } from '../../services/api-client'

export function AdminShopsPage() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [formShop, setFormShop] = useState<AdminShop | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteShop, setDeleteShop] = useState<AdminShop | null>(null)
  const [qrShop, setQrShop] = useState<AdminShop | null>(null)
  const [provisionShop, setProvisionShop] = useState<AdminShop | null>(null)
  const [setupTokenResult, setSetupTokenResult] = useState<ShopSetupTokenResponse | null>(null)
  const query = useAdminShops(page, limit)
  const createMutation = useCreateAdminShop()
  const updateMutation = useUpdateAdminShop()
  const deleteMutation = useDeleteAdminShop()
  const provisionMutation = useProvisionAdminShopCredentials()
  const { enqueueSnackbar } = useSnackbar()
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const shops = query.data?.data ?? []

    useEffect(() => {
      if (query.error) enqueueSnackbar(getErrorMessage(query.error, 'دریافت فهرست فروشگاه‌ها با خطا مواجه شد.'), { variant: 'error' })
    }, [enqueueSnackbar, query.error])

  const openCreate = () => { setFormShop(null); setFormOpen(true) }
  const openEdit = (shop: AdminShop) => { setFormShop(shop); setFormOpen(true) }
  const closeForm = () => { if (!createMutation.isPending && !updateMutation.isPending) setFormOpen(false) }

  const submitForm = async (values: ShopFormValues) => {
    try {
      if (formShop) {
        await updateMutation.mutateAsync({ id: formShop.id, ...values })
        enqueueSnackbar('اطلاعات فروشگاه ویرایش شد.', { variant: 'success' })
      } else {
        await createMutation.mutateAsync(values)
        enqueueSnackbar('فروشگاه با موفقیت اضافه شد.', { variant: 'success' })
        setPage(1)
      }
      setFormOpen(false)
    } catch (error) {
      enqueueSnackbar(getErrorMessage(error, 'ذخیره فروشگاه با خطا مواجه شد.'), { variant: 'error' })
    }
  }

  const toggleActive = async (shop: AdminShop) => {
    try {
      await updateMutation.mutateAsync({ id: shop.id, isActive: !shop.isActive })
      enqueueSnackbar(shop.isActive ? 'فروشگاه غیرفعال شد.' : 'فروشگاه فعال شد.', { variant: 'success' })
    } catch (error) {
      enqueueSnackbar(getErrorMessage(error, 'تغییر وضعیت فروشگاه با خطا مواجه شد.'), { variant: 'error' })
    }
  }

  const confirmDelete = async () => {
    if (!deleteShop) return
    try {
      await deleteMutation.mutateAsync(deleteShop.id)
      enqueueSnackbar('فروشگاه حذف شد.', { variant: 'success' })
      setDeleteShop(null)
      if (shops.length === 1 && page > 1) setPage((current) => current - 1)
    } catch (error) {
      enqueueSnackbar(getErrorMessage(error, 'حذف فروشگاه با خطا مواجه شد.'), { variant: 'error' })
    }
  }

  const provisionCredentials = async () => {
    if (!provisionShop?.isActive) return
    try {
      const result = await provisionMutation.mutateAsync(provisionShop.id)
      setSetupTokenResult(result)
      setProvisionShop(null)
    } catch (error) {
      const message = error instanceof ApiError
        ? error.status === 403 ? 'اجازه صدور کد تنظیم رمز را ندارید.'
          : error.status === 404 ? 'فروشگاه موردنظر پیدا نشد.'
            : error.status === 409 ? 'صدور کد با وضعیت فعلی فروشگاه سازگار نیست.'
              : error.status === 429 ? 'تعداد درخواست‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید.'
                : error.status >= 500 ? 'سرور موقتاً در دسترس نیست. بعداً دوباره تلاش کنید.'
                  : 'صدور کد تنظیم رمز انجام نشد.'
        : 'ارتباط با سرور برقرار نشد. دوباره تلاش کنید.'
      enqueueSnackbar(message, { variant: 'error' })
    }
  }

  const closeSetupToken = () => {
    setSetupTokenResult(null)
    provisionMutation.reset()
  }

  const copySetupToken = async () => {
    if (!setupTokenResult) return
    try {
      await navigator.clipboard.writeText(setupTokenResult.setupToken)
      enqueueSnackbar('کد تنظیم رمز کپی شد.', { variant: 'success' })
    } catch {
      enqueueSnackbar('کپی کد انجام نشد. آن را به‌صورت دستی انتخاب کنید.', { variant: 'warning' })
    }
  }

  const expiryLabel = (value: string) => {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
  }

  const columns: GridColDef<AdminShop>[] = [
    { field: 'name', headerName: 'نام فروشگاه', flex: 1, minWidth: 150 },
    { field: 'ownerName', headerName: 'صاحب فروشگاه', flex: 1, minWidth: 140 },
    { field: 'phone', headerName: 'شماره تماس', minWidth: 130, renderCell: ({ value }) => <span dir="ltr">{value}</span> },
    { field: 'address', headerName: 'آدرس', flex: 1.2, minWidth: 170 },
    { field: 'isActive', headerName: 'وضعیت', minWidth: 110, renderCell: ({ value }) => <Chip size="small" color={value ? 'success' : 'default'} label={value ? 'فعال' : 'غیرفعال'} /> },
    { field: 'createdAt', headerName: 'تاریخ ایجاد', minWidth: 130, valueFormatter: (value) => formatDate(value as string) },
    { field: 'actions', headerName: 'عملیات', sortable: false, filterable: false, minWidth: 220, renderCell: ({ row }) => <Stack direction="row" spacing={0.25}>
      <Tooltip title="ویرایش"><IconButton aria-label="ویرایش فروشگاه" size="small" onClick={() => openEdit(row)}><EditOutlined fontSize="small" /></IconButton></Tooltip>
      <Tooltip title={row.isActive ? 'غیرفعال‌کردن' : 'فعال‌کردن'}><IconButton aria-label={row.isActive ? 'غیرفعال کردن فروشگاه' : 'فعال کردن فروشگاه'} size="small" onClick={() => void toggleActive(row)}>{row.isActive ? <ToggleOn color="success" /> : <ToggleOff />}</IconButton></Tooltip>
      <Tooltip title="مشاهده QR"><IconButton aria-label="مشاهده QR فروشگاه" size="small" onClick={() => setQrShop(row)}><QrCode2 fontSize="small" /></IconButton></Tooltip>
      <Tooltip title={row.isActive ? 'صدور کد تنظیم رمز اولیه' : 'برای فروشگاه غیرفعال قابل صدور نیست'}><span><IconButton aria-label="صدور کد تنظیم رمز اولیه" size="small" disabled={!row.isActive} onClick={() => setProvisionShop(row)}><Key fontSize="small" /></IconButton></span></Tooltip>
      <Tooltip title="حذف"><IconButton aria-label="حذف فروشگاه" size="small" color="error" onClick={() => setDeleteShop(row)}><DeleteOutlined fontSize="small" /></IconButton></Tooltip>
    </Stack> },
  ]

  const changePagination = (model: GridPaginationModel) => {
    const nextPage = model.page + 1
    if (model.pageSize !== limit) {
      setLimit(model.pageSize)
      setPage(1)
    } else setPage(nextPage)
  }

  return <Stack spacing={2.5}>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
      <Box sx={{ flex: 1 }}><Typography variant="h5" sx={{ fontWeight: 700 }}>مدیریت فروشگاه‌ها</Typography><Typography color="text.secondary" sx={{ mt: 0.5 }}>ثبت، ویرایش و مدیریت QR فروشگاه‌ها</Typography></Box>
      <Button variant="contained" startIcon={<Add />} onClick={openCreate}>افزودن فروشگاه</Button>
    </Stack>
    {query.error && <AdminQueryState loading={false} error={query.error} empty={false} onRetry={() => void query.refetch()} />}
    {!query.error && query.isLoading && <AdminQueryState loading error={null} empty={false} onRetry={() => void query.refetch()} />}
    {!query.error && !query.isLoading && shops.length === 0 && <AdminQueryState loading={false} error={null} empty onRetry={() => void query.refetch()} emptyTitle="فروشگاهی ثبت نشده است." />}
    {!query.error && !query.isLoading && shops.length > 0 && <>
      {isDesktop ? <Paper variant="outlined" sx={{ height: 620, width: '100%', overflow: 'hidden' }}>
        <DataGrid
          aria-label="فهرست فروشگاه‌ها"
          rows={shops}
          columns={columns}
          rowCount={query.data?.total ?? 0}
          loading={query.isFetching}
          paginationMode="server"
          paginationModel={{ page: page - 1, pageSize: limit }}
          onPaginationModelChange={changePagination}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
          localeText={{ noRowsLabel: 'فروشگاهی ثبت نشده است.' }}
        />
      </Paper> : <Stack spacing={1.5}>
        {shops.map((shop) => <Paper key={shop.id} variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={1.25}>
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}><Typography sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>{shop.name}</Typography><Chip size="small" color={shop.isActive ? 'success' : 'default'} label={shop.isActive ? 'فعال' : 'غیرفعال'} /></Stack>
            <Typography variant="body2">صاحب فروشگاه: {shop.ownerName}</Typography>
            <Typography variant="body2" dir="ltr" sx={{ textAlign: 'right' }}>{shop.phone}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{shop.address}</Typography>
            <Typography variant="caption" color="text.secondary">تاریخ ایجاد: {formatDate(shop.createdAt)}</Typography>
            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
              <Button size="small" startIcon={<EditOutlined />} onClick={() => openEdit(shop)}>ویرایش</Button>
              <Button size="small" startIcon={shop.isActive ? <ToggleOn /> : <ToggleOff />} onClick={() => void toggleActive(shop)}>{shop.isActive ? 'غیرفعال‌کردن' : 'فعال‌کردن'}</Button>
              <Button size="small" startIcon={<QrCode2 />} onClick={() => setQrShop(shop)}>QR Code</Button>
              <Button size="small" startIcon={<Key />} disabled={!shop.isActive} onClick={() => setProvisionShop(shop)}>تنظیم رمز اولیه</Button>
              <Button size="small" color="error" startIcon={<DeleteOutlined />} onClick={() => setDeleteShop(shop)}>حذف</Button>
            </Stack>
          </Stack>
        </Paper>)}
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">صفحه {page} از {Math.max(1, Math.ceil((query.data?.total ?? 0) / limit))}</Typography>
          <Stack direction="row" spacing={1}><Button disabled={page <= 1 || query.isFetching} onClick={() => setPage((current) => current - 1)}>قبلی</Button><Button disabled={page * limit >= (query.data?.total ?? 0) || query.isFetching} onClick={() => setPage((current) => current + 1)}>بعدی</Button></Stack>
        </Stack>
      </Stack>}
    </>}

    <ShopFormDialog open={formOpen} shop={formShop} pending={createMutation.isPending || updateMutation.isPending} onClose={closeForm} onSubmit={(values) => void submitForm(values)} />
    <Dialog open={Boolean(deleteShop)} onClose={deleteMutation.isPending ? undefined : () => setDeleteShop(null)} dir="rtl">
      <DialogTitle>حذف فروشگاه</DialogTitle>
      <DialogContent><DialogContentText>آیا از حذف «{deleteShop?.name}» مطمئن هستید؟ این فروشگاه از فهرست فعال خارج می‌شود.</DialogContentText>{deleteMutation.isError && <Alert severity="error" sx={{ mt: 2 }}>حذف فروشگاه انجام نشد. دوباره تلاش کنید.</Alert>}</DialogContent>
      <DialogActions><Button onClick={() => setDeleteShop(null)} disabled={deleteMutation.isPending}>انصراف</Button><Button color="error" variant="contained" onClick={() => void confirmDelete()} disabled={deleteMutation.isPending}>{deleteMutation.isPending ? 'در حال حذف...' : 'حذف'}</Button></DialogActions>
    </Dialog>
    <Dialog open={Boolean(provisionShop)} onClose={provisionMutation.isPending ? undefined : () => setProvisionShop(null)} dir="rtl">
      <DialogTitle>صدور کد تنظیم رمز اولیه</DialogTitle>
      <DialogContent><DialogContentText>برای «{provisionShop?.name}» کد جدید صادر شود؟ اگر کد قبلی هنوز در انتظار استفاده باشد، با صدور این کد نامعتبر می‌شود. کد را فقط از مسیر امن به فروشگاه تحویل دهید.</DialogContentText></DialogContent>
      <DialogActions><Button onClick={() => setProvisionShop(null)} disabled={provisionMutation.isPending}>انصراف</Button><Button variant="contained" onClick={() => void provisionCredentials()} disabled={provisionMutation.isPending || !provisionShop?.isActive}>{provisionMutation.isPending ? 'در حال صدور...' : 'صدور کد'}</Button></DialogActions>
    </Dialog>
    <Dialog open={Boolean(setupTokenResult)} onClose={closeSetupToken} dir="rtl" fullWidth maxWidth="sm">
      <DialogTitle>کد تنظیم رمز صادر شد</DialogTitle>
      <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
        <Alert severity="warning">این کد یک‌بارمصرف و تا ۳۰ دقیقه معتبر است. آن را از طریق یک کانال امن به فروشگاه تحویل دهید؛ با صدور کد جدید، کد قبلی باطل می‌شود.</Alert>
        <TextField label="شناسه ورود فروشگاه" value={setupTokenResult?.loginIdentifier ?? ''} slotProps={{ htmlInput: { readOnly: true } }} fullWidth />
        <TextField label="کد تنظیم رمز" value={setupTokenResult?.setupToken ?? ''} slotProps={{ htmlInput: { readOnly: true }, input: { endAdornment: <IconButton aria-label="کپی کد تنظیم رمز" onClick={() => void copySetupToken()}><ContentCopy /></IconButton> } }} fullWidth />
        <Typography variant="body2">مسیر تنظیم رمز: <Box component="span" dir="ltr" sx={{ fontWeight: 700 }}>/shop/setup-password</Box></Typography>
        <Typography variant="body2" color="text.secondary">اعتبار تا: {setupTokenResult ? expiryLabel(setupTokenResult.expiresAt) : ''}</Typography>
      </Stack></DialogContent>
      <DialogActions><Button onClick={closeSetupToken}>بستن و پاک‌کردن کد</Button></DialogActions>
    </Dialog>
    <ShopQrDialog shop={qrShop} onClose={() => setQrShop(null)} />
  </Stack>
}