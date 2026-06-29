
/**
 * Formatea un número como moneda local (Pesos Mexicanos).
 * Ejemplo: 12500.5 -> $12,500.50
 */
export const formatMoney = (amount: number | null | undefined): string => {
  const value = amount ?? 0;
  return value.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Formatea un número de forma limpia con separadores de miles y decimales.
 * Útil para cantidades de stock, kilos, etc.
 * Ejemplo: 15000 -> 15,000
 */
export const formatNumber = (value: number | null | undefined, decimals = 0): string => {
  const num = value ?? 0;
  return num.toLocaleString('es-MX', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Formatea una fecha ISO a un formato de lectura amigable para México.
 * Ejemplo: "2026-06-29T10:43:00.000-06:00" -> 29 de jun de 2026, 10:43 am
 */
export const formatDateTime = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  
  return date.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};