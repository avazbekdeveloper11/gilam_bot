import { api } from '../services/api.js';
import { fmtOrder, fmtSom } from '../services/formatter.js';
import { ordersCommand } from '../commands/orders.js';
import { reportsCommand } from '../commands/reports.js';

export async function callbackHandler(ctx) {
  const data = ctx.callbackQuery.data;
  await ctx.answerCbQuery();

  if (data.startsWith('order:')) {
    const id = data.split(':')[1];
    try {
      const o = await api.getOrder(id);
      const items = o.items_summary;
      let extra = '';
      if (items) {
        const parts = [];
        if (items.total_sqm > 0)   parts.push(`${items.total_sqm.toFixed(1)} m²`);
        if (items.total_meter > 0) parts.push(`${items.total_meter} m`);
        if (items.total_piece > 0) parts.push(`${items.total_piece} dona`);
        if (parts.length) extra = `\n📐 ${parts.join(' | ')}`;
      }
      await ctx.replyWithMarkdownV2(fmtOrder(o) + extra);
    } catch (e) {
      await ctx.reply('❌ Zakaz topilmadi: ' + e.message);
    }
    return;
  }

  if (data === 'back:main') {
    await ctx.reply('Asosiy menyu:', { reply_markup: { remove_inline_keyboard: true } });
    return;
  }
}
