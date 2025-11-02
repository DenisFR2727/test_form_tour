// Форматування дати з YYYY-MM-DD в DD.MM.YYYY
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

// Форматування ціни з розділювачами тисяч та валютою
export function formatPrice(amount: number, currency: string): string {
  // Конвертуємо USD в грн (приклад: 1 USD = 40 грн)
  const exchangeRate = 40;
  const amountInUah = Math.round(amount * exchangeRate);
  const formattedUah = amountInUah.toLocaleString("uk-UA");
  return `${formattedUah} грн`;
}
