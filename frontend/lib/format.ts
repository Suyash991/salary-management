export function formatSalary(amount: number | string, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount))
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatEmploymentType(type: string) {
  return type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
