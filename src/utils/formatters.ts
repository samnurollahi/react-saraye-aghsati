export function formatMoney(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return '—'
  const raw = String(value).trim()
  if (!/^-?\d+(\.\d+)?$/.test(raw)) return raw

  const negative = raw.startsWith('-')
  const unsigned = negative ? raw.slice(1) : raw
  const [integerPart, fractionPart] = unsigned.split('.')
  const formattedInteger = new Intl.NumberFormat('fa-IR').format(BigInt(integerPart))
  const fraction = fractionPart ? `٫${fractionPart.replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)])}` : ''
  return `${negative ? '−' : ''}${formattedInteger}${fraction}`
}

export function sumDecimalAmounts(values: string[]) {
  const parsed = values.map((value) => /^\d+(\.\d+)?$/.test(value) ? value : '0')
  const scale = Math.max(0, ...parsed.map((value) => value.split('.')[1]?.length ?? 0))
  const total = parsed.reduce((sum, value) => {
    const [integerPart, fractionPart = ''] = value.split('.')
    return sum + BigInt(`${integerPart}${fractionPart.padEnd(scale, '0')}`)
  }, 0n)
  if (scale === 0) return String(total)
  const digits = total.toString().padStart(scale + 1, '0')
  const integerPart = digits.slice(0, -scale)
  const fractionPart = digits.slice(-scale).replace(/0+$/, '')
  return fractionPart ? `${integerPart}.${fractionPart}` : integerPart
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(date)
}