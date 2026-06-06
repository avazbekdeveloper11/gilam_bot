import { api } from '../services/api.js';
import { fmtOrder } from '../services/formatter.js';
import { Markup } from 'telegraf';

export async function ordersCommand(ctx) {
  await ctx.reply('⏳ Zakazlar yuklanmoqda...');
  try {
    const data = await api.getOrders('&status=yangi,qabulQilindi,yuvilyapti,upakovka,tayyor');
    const orders = data.items || [];

    if (!orders.length) {
      return ctx.reply('📭 Faol zakazlar yo\'q.');
    }

    for (const o of orders.slice(0, 10)) {
      await ctx.replyWithMarkdownV2(
        fmtOrder(o),
        Markup.inlineKeyboard([[
          Markup.button.callback('📋 Batafsil', `order:${o.id}`),
        ]]),
      );
    }

    if (orders.length > 10) {
      await ctx.reply(`... va yana ${orders.length - 10} ta zakaz.`);
    }
  } catch (e) {
    await ctx.reply('❌ Xatolik: ' + e.message);
  }
}
