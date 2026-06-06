export const STATUS_LABELS = {
  yangi:        '🆕 Yangi',
  qabulQilindi: '📦 Qabul qilindi',
  yuvilyapti:   '🫧 Yuvilyapti',
  upakovka:     '📫 Upakovka',
  tayyor:       '✅ Tayyor',
  yetkazildi:   '🚚 Yetkazildi',
};

export const PAYMENT_LABELS = {
  tolanmagan: "⏳ To'lanmagan",
  tolangan:   '✅ To\'langan',
  qarz:       '🔴 Qarz',
};

export function fmtOrder(o) {
  const price   = fmtSom(o.total_price || 0);
  const advance = o.advance_payment > 0
    ? `\n💵 Avans: ${fmtSom(o.advance_payment)}` : '';
  const worker  = o.worker_name  ? `\n👷 Ishchi: ${o.worker_name}`  : '';
  const driver  = o.driver_name  ? `\n🚗 Haydovchi: ${o.driver_name}` : '';
  return [
    `📋 #${o.id} — ${o.customer_name}`,
    `📞 ${o.phone}`,
    `📍 ${o.address}`,
    `🏷 ${STATUS_LABELS[o.status] || o.status}`,
    `💰 ${price}  ${PAYMENT_LABELS[o.payment_status] || ''}${advance}${worker}${driver}`,
  ].join('\n');
}

export function fmtSom(n) {
  return Number(n || 0).toLocaleString('ru') + " so'm";
}
