import { ordersCommand } from '../commands/orders.js';
import { reportsCommand } from '../commands/reports.js';
import { api } from '../services/api.js';
import { fmtSom } from '../services/formatter.js';

export async function messageHandler(ctx) {
  const text = ctx.message?.text || '';

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
