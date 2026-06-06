import { Markup } from 'telegraf';

export const mainKeyboard = Markup.keyboard([
  ['📋 Zakazlar', '📊 Hisobot'],
  ['👥 Haydovchilar balansi', '⚙️ Sozlamalar'],
]).resize();

export const ordersKeyboard = (statuses) => Markup.inlineKeyboard([
  ...statuses.map(s => [Markup.button.callback(s.label, `filter:${s.value}`)]),
  [Markup.button.callback('🔙 Orqaga', 'back:main')],
]);

export function orderActions(orderId) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📋 Batafsil', `order:${orderId}`)],
  ]);
}
