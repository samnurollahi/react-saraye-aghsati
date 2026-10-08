import { z } from 'zod'

export function normalizeAmount(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[٬,\s]/g, '')
    .replace('٫', '.')
}

export const purchaseSchema = z.object({
  amount: z.string()
    .min(1, 'مبلغ خرید را وارد کنید.')
    .refine((value) => /^\d+(\.\d+)?$/.test(normalizeAmount(value)), 'مبلغ باید عدد معتبر باشد.')
    .refine((value) => Number(normalizeAmount(value)) > 0, 'مبلغ باید بیشتر از صفر باشد.'),
  description: z.string().trim().max(500, 'توضیحات حداکثر ۵۰۰ نویسه باشد.'),
})

export type PurchaseFormValues = z.infer<typeof purchaseSchema>