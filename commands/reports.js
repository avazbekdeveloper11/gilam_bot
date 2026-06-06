import { api } from '../services/api.js';
import { fmtSom } from '../services/formatter.js';

export async function reportsCommand(ctx) {
  await ctx.reply('⏳ Hisobot yuklanmoqda...');
  try {
    const today = new Date().toISOString().split('T')[0];
    const [ordersData, balances, collections] = await Promise.all([
      api.getOrders('&limit=500'),
      api.getBalances(),
      api.getCollections(today),
    ]);

    const orders = ordersData.items || [];

    // Bugungi statistika
    const todayOrders = orders.filter(o =>
      o.created_at?.slice(0, 10) === today,
    );
    const todayIncome = (collections.drivers || [])
      .reduce((s, d) => s + (d.total_collected || 0), 0);

    // Umumiy
    const totalPending = orders
      .filter(o => o.payment_status === 'tolanmagan' || o.payment_status === 'qarz')
      .reduce((s, o) => s + (o.total_price || 0), 0);

    // Haydovchilar balansi
    const driverLines = (balances || [])
      .filter(d => d.balance > 0)
      .map(d => `  • ${d.name}: *${fmtSom(d.balance)}*`)
      .join('\n');

    const text = [
      `📊 *HISOBOT — ${today}*`,
      '',
      `🆕 Bugun yangi zakazlar: *${todayOrders.length} ta*`,
      `💰 Bugun yig'im: *${fmtSom(todayIncome)}*`,
      '',
      `⏳ Jami kutilgan to'lov: *${fmtSom(totalPending)}*`,
      '',
      driverLines ? `👥 *Haydovchilar qo'lida:*\n${driverLines}` : '',
    ].filter(Boolean).join('\n');

    await ctx.reply(text, { parse_mode: 'Markdown' });
  } catch (e) {
    await ctx.reply('❌ Xatolik: ' + e.message);
  }
}
