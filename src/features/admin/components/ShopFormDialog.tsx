import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Stack, Switch, TextField } from '@mui/material'
import type { AdminShop } from '../shops-api'

const persianDigits = '۰۱۲۳۴۵۶۷۸۹'
const arabicDigits = '٠١٢٣٤٥٦٧٨٩'

function toLatinDigits(value: string) {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const persianIndex = persianDigits.indexOf(digit)
    return String(persianIndex >= 0 ? persianIndex : arabicDigits.indexOf(digit))
  })
}

const shopFormSchema = z.object({
  name: z.string().trim().min(2, 'نام فروشگاه باید حداقل ۲ حرف باشد.'),
  ownerName: z.string().trim().min(2, 'نام صاحب فروشگاه را وارد کنید.'),
  phone: z.string().trim().refine((value) => /^09\d{9}$/.test(toLatinDigits(value)), 'شماره تماس باید با ۰۹ شروع شود و ۱۱ رقم باشد.').transform(toLatinDigits),
  address: z.string().trim().min(3, 'آدرس را کامل‌تر وارد کنید.'),
  description: z.string().trim(),
  isActive: z.boolean(),
})

type ShopFormValues = z.output<typeof shopFormSchema>

export function ShopFormDialog({ open, shop, pending, onClose, onSubmit }: {
  open: boolean
  shop: AdminShop | null
  pending: boolean
  onClose: () => void
  onSubmit: (values: ShopFormValues) => void
}) {
  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<z.input<typeof shopFormSchema>, unknown, ShopFormValues>({
    resolver: zodResolver(shopFormSchema),
    defaultValues: { name: '', ownerName: '', phone: '', address: '', description: '', isActive: true },
  })

  useEffect(() => {
    reset(shop ? {
      name: shop.name,
      ownerName: shop.ownerName,
      phone: shop.phone,
      address: shop.address,
      description: shop.description ?? '',
      isActive: shop.isActive,
    } : { name: '', ownerName: '', phone: '', address: '', description: '', isActive: true })
  }, [reset, shop, open])

  return <Dialog open={open} onClose={pending ? undefined : onClose} fullWidth maxWidth="sm" dir="rtl">
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogTitle>{shop ? 'ویرایش فروشگاه' : 'افزودن فروشگاه'}</DialogTitle>
      <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
        <TextField label="نام فروشگاه" required {...register('name')} error={Boolean(errors.name)} helperText={errors.name?.message} />
        <TextField label="نام صاحب فروشگاه" required {...register('ownerName')} error={Boolean(errors.ownerName)} helperText={errors.ownerName?.message} />
        <TextField label="شماره تماس" required slotProps={{ htmlInput: { inputMode: 'tel', dir: 'ltr' } }} {...register('phone')} error={Boolean(errors.phone)} helperText={errors.phone?.message} />
        <TextField label="آدرس" required multiline minRows={2} {...register('address')} error={Boolean(errors.address)} helperText={errors.address?.message} />
        <TextField label="توضیحات" multiline minRows={2} {...register('description')} error={Boolean(errors.description)} helperText={errors.description?.message} />
        {shop && <Controller control={control} name="isActive" render={({ field }) => <FormControlLabel control={<Switch checked={field.value} onChange={field.onChange} />} label={field.value ? 'فروشگاه فعال' : 'فروشگاه غیرفعال'} />} />}
      </Stack></DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={pending}>انصراف</Button>
        <Button type="submit" variant="contained" disabled={pending}>{pending ? 'در حال ذخیره...' : 'ذخیره'}</Button>
      </DialogActions>
    </form>
  </Dialog>
}

export type { ShopFormValues }
