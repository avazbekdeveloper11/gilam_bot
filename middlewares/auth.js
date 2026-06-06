// Foydalanuvchi Telegram ID → session da saqlash
// Kelajakda: faqat ruxsat etilgan Telegram ID lar botdan foydalana oladi

const ALLOWED_IDS = process.env.ALLOWED_TELEGRAM_IDS
  ? process.env.ALLOWED_TELEGRAM_IDS.split(',').map(Number)
  : null; // null = hamma uchun ochiq

export function authMiddleware(ctx, next) {
  if (ALLOWED_IDS && !ALLOWED_IDS.includes(ctx.from?.id)) {
    return ctx.reply('⛔ Sizga ruxsat yo\'q.');
  }
  return next();
}
