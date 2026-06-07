import { Markup } from 'telegraf';
import { ordersCommand } from '../commands/orders.js';
import { reportsCommand } from '../commands/reports.js';
import { api } from '../services/api.js';
import { fmtSom } from '../services/formatter.js';

export async function messageHandler(ctx) {
  const text = ctx.message?.text || '';

  if (text === '📦 Zakaz berish') {
    await ctx.reply(
      '📦 *Zakaz berish uchun:*\n\n📞 Operator: +998 XX XXX XX XX\n🕐 Ish vaqti: 09:00 — 21:00',
      { parse_mode: 'Markdown' },
    );
    return;
  }

  if (text === '💰 Narxlar') {
    try {
      const settings = await api.getSettings();
      const price = settings.price_per_sqm || 15000;
      await ctx.reply(
        `💰 *Narxlar:*\n\n• Gilam yuvish: *${Number(price).toLocaleString('uz')} so'm/m²*\n• Yetkazib berish: *bepul*`,
        { parse_mode: 'Markdown' },
      );
    } catch {
      await ctx.reply('💰 *Narxlar:*\n\n• Gilam yuvish: *15 000 so\'m/m²*\n• Yetkazib berish: *bepul*', { parse_mode: 'Markdown' });
    }
    return;
  }

  if (text === '🌐 Til') {
    await ctx.reply('🌐 Tilni tanlang / Выберите язык:', Markup.keyboard([
      ["🇺🇿 O'zbek", '🇷🇺 Русский'],
      ['🔙 Orqaga'],
    ]).resize());
    return;
  }

  if (text === "🇺🇿 O'zbek" || text === '🇷🇺 Русский' || text === '🔙 Orqaga') {
    const { mainKeyboard } = await import('../keyboards/main_keyboard.js');
    await ctx.reply('✅ Saqlandi!', mainKeyboard);
    return;
  }

  if (text === "📍 Bog'lanish va manzil") {
    await ctx.reply(
      '📞 *Bog\'lanish:*\n\n📱 Telefon: +998 XX XXX XX XX\n💬 Telegram: @username\n🕐 Ish vaqti: 09:00 — 21:00',
      { parse_mode: 'Markdown' },
    );
    await ctx.replyWithLocation(39.771487, 67.027948);
    await ctx.reply(
      '📍 *Bizning manzilimiz:*\n\nhttps://maps.google.com/?q=39.771487,67.027948',
      { parse_mode: 'Markdown' },
    );
    return;
  }

  if (text === '📋 Zakazlar') return ordersCommand(ctx);
  if (text === '📊 Hisobot')  return reportsCommand(ctx);

  if (text === '👥 Haydovchilar balansi') {
    try {
      const balances = await api.getBalances();
      if (!balances.length) return ctx.reply('Haydovchilar yo\'q.');
      const lines = balances.map(d =>
        `• ${d.name}: *${fmtSom(d.balance)}* (jami: ${fmtSom(d.total_collected)}, topshirilgan: ${fmtSom(d.total_settled)})`,
      ).join('\n');
      await ctx.reply(`👥 *Haydovchilar balansi:*\n\n${lines}`, { parse_mode: 'Markdown' });
    } catch (e) {
      await ctx.reply('❌ Xatolik: ' + e.message);
    }
    return;
  }

  if (text === '⚙️ Sozlamalar') {
    try {
      const settings = await api.getSettings();
      const price = settings.price_per_sqm || 15000;
      const salary = settings.worker_salary_percent || 20;
      await ctx.reply(
        `⚙️ *Sozlamalar:*\n\n• Narx (1 m²): *${Number(price).toLocaleString('uz')} so'm*\n• Ishchi ulushi: *${salary}%*`,
        { parse_mode: 'Markdown' },
      );
    } catch (e) {
      await ctx.reply('❌ Xatolik: ' + e.message);
    }
    return;
  }
}
