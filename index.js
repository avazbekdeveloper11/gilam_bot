import 'dotenv/config';
import { Telegraf, session, Markup } from 'telegraf';
import { api } from './services/api.js';
import { t } from './i18n.js';

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session({
  defaultSession: () => ({ step: null, lang: null, phone: null, address: null, lat: null, lng: null }),
}));

const s = (ctx) => t[ctx.session?.lang || 'uz'];

function mainKb(ctx) {
  const l = s(ctx);
  return Markup.keyboard([[l.orderBtn], [l.pricesBtn, l.contactBtn], [l.langBtn]]).resize();
}

// ─── /start ──────────────────────────────────────────────────────────────────
bot.start(async ctx => {
  ctx.session = { step: 'lang', lang: null };
  await ctx.reply(
    t.uz.selectLang,
    Markup.keyboard([[t.uz.langUz, t.uz.langCyr]]).resize().oneTime(),
  );
});

// ─── /start ──────────────────────────────────────────────────────────────────
bot.on('message', async ctx => {
  const step     = ctx.session?.step;
  const text     = ctx.message?.text || '';
  const contact  = ctx.message?.contact;
  const location = ctx.message?.location;
  const l        = s(ctx);

  // ── Til tanlash ──────────────────────────────────────────────────────────────
  if (step === 'lang' || text === t.uz.langUz || text === t.uz.langCyr || text === '🌐 Til' || text === '🌐 Тил') {
    if (text === t.uz.langUz || (!ctx.session.lang && step !== 'lang')) {
      ctx.session.lang = 'uz';
    } else if (text === t.uz.langCyr) {
      ctx.session.lang = 'cyr';
    } else if (text === '🌐 Til' || text === '🌐 Тил') {
      ctx.session.step = 'lang';
      return ctx.reply(t.uz.selectLang, Markup.keyboard([[t.uz.langUz, t.uz.langCyr]]).resize().oneTime());
    } else if (step === 'lang') {
      return ctx.reply(t.uz.selectLang, Markup.keyboard([[t.uz.langUz, t.uz.langCyr]]).resize().oneTime());
    }

    if (text === t.uz.langUz || text === t.uz.langCyr) {
      ctx.session.step = null;
      return ctx.reply(s(ctx).welcome, mainKb(ctx));
    }
  }

  // ── Bog'lanish ───────────────────────────────────────────────────────────────
  if (text === l.contactBtn) {
    return ctx.reply(l.contactText, { parse_mode: 'HTML', reply_markup: mainKb(ctx).reply_markup });
  }

  // ── Narxlar ──────────────────────────────────────────────────────────────────
  if (text === l.pricesBtn) {
    try {
      const services = await api.getServices();
      if (!Array.isArray(services) || services.length === 0) {
        return ctx.reply('Narxlar hali kiritilmagan.', mainKb(ctx));
      }
      const units = { sqm: l.unitSqm, piece: l.unitPiece, meter: l.unitMeter };
      const lines = services.map(sv => {
        const price = Number(sv.price_per_unit).toLocaleString('ru');
        const unit  = units[sv.unit_type] || sv.unit_type;
        const svName = (l.serviceNames && l.serviceNames[sv.name]) || sv.name;
        let line = `▪️ ${svName}\n   ${price} so'm / ${unit}`;
        if (sv.discount_enabled && sv.discount_min_qty > 0 && sv.discount_amount > 0) {
          line += `\n` + l.discountLine(sv.discount_min_qty, sv.discount_amount, unit);
        }
        return line;
      });
      const callout = ctx.session?.lang === 'cyr'
        ? '📲 Заказ бериш учун юқоридаги тугмани босинг'
        : '📲 Zakaz berish uchun yuqoridagi tugmani bosing';
      const msg = `${l.pricesTitle}${lines.join('\n\n')}\n\n${callout}`;
      return ctx.reply(msg, mainKb(ctx));
    } catch (e) {
      console.error(e.message);
      return ctx.reply('Narxlarni yuklashda xatolik.', mainKb(ctx));
    }
  }

  // ── Zakaz boshlash ───────────────────────────────────────────────────────────
  if (text === l.orderBtn) {
    ctx.session.step = 'phone';
    ctx.session.phone = null;
    ctx.session.address = null;
    ctx.session.lat = null;
    ctx.session.lng = null;
    return ctx.reply(
      l.phonePrompt,
      Markup.keyboard([[Markup.button.contactRequest(l.phoneBtn)]]).resize().oneTime(),
    );
  }

  // ── Telefon ──────────────────────────────────────────────────────────────────
  if (step === 'phone') {
    let phone;
    if (contact) {
      phone = contact.phone_number.replace(/\D/g, '');
      if (!phone.startsWith('998')) phone = '998' + phone.slice(-9);
    } else {
      const digits = text.replace(/\D/g, '');
      if (digits.length < 9) {
        return ctx.reply(
          l.phoneError,
          Markup.keyboard([[Markup.button.contactRequest(l.phoneBtn)]]).resize().oneTime(),
        );
      }
      phone = digits.length >= 12 ? digits.slice(-12) : '998' + digits.slice(-9);
    }

    ctx.session.phone = phone;
    ctx.session.step  = 'location';
    return ctx.reply(
      l.locationPrompt,
      Markup.keyboard([
        [Markup.button.locationRequest(l.locationBtn)],
        [l.addressBtn],
      ]).resize().oneTime(),
    );
  }

  // ── Manzil ───────────────────────────────────────────────────────────────────
  if (step === 'location') {
    if (location) {
      ctx.session.lat     = location.latitude;
      ctx.session.lng     = location.longitude;
      ctx.session.address = `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
    } else if (text === l.addressBtn) {
      ctx.session.step = 'address_text';
      return ctx.reply(l.addressPrompt, Markup.removeKeyboard());
    } else if (text.trim()) {
      ctx.session.address = text.trim();
    } else return;

    return sendOrder(ctx);
  }

  // ── Manzil matni ─────────────────────────────────────────────────────────────
  if (step === 'address_text') {
    if (!text.trim()) return ctx.reply(l.addressError);
    ctx.session.address = text.trim();
    return sendOrder(ctx);
  }

  // Bosh holat
  if (!step) {
    return ctx.reply(l.fallback, mainKb(ctx));
  }
});

// ─── Zakazni saqlash ─────────────────────────────────────────────────────────
async function pickDriverId() {
  const [usersRes, ordersRes] = await Promise.all([api.getUsers(), api.getActiveOrders()]);
  const drivers = (Array.isArray(usersRes) ? usersRes : usersRes.items || [])
    .filter(u => u.role === 'driver' && u.is_active !== 0);
  if (drivers.length === 0) return null;

  const orders = Array.isArray(ordersRes) ? ordersRes : (ordersRes.items || []);
  const active = orders.filter(o => o.status !== 'yetkazildi');

  const counts = {};
  drivers.forEach(d => { counts[d.id] = 0; });
  active.forEach(o => {
    if (o.assigned_driver_id && counts[o.assigned_driver_id] !== undefined)
      counts[o.assigned_driver_id]++;
  });

  return drivers.reduce((best, d) => counts[d.id] < counts[best.id] ? d : best).id;
}

async function sendOrder(ctx) {
  const sess = ctx.session;
  const l    = s(ctx);
  const name = [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(' ');
  const now  = new Date().toISOString();

  try {
    const driverId = await pickDriverId().catch(() => null);

    const result = await api.createOrder({
      customer_name:      name,
      phone:              sess.phone,
      address:            sess.address,
      pickup_lat:         sess.lat  || null,
      pickup_lng:         sess.lng  || null,
      notes:              null,
      pickup_date:        now,
      delivery_date:      now,
      carpet_count:       0,
      carpet_types:       '',
      assigned_driver_id: driverId,
    });

    ctx.session.step = null;
    await ctx.reply(l.success, mainKb(ctx));
  } catch (e) {
    ctx.session.step = null;
    console.error(e.message);
    await ctx.reply(l.error, mainKb(ctx));
  }
}

bot.catch((err, ctx) => {
  console.error('Xatolik:', err.message);
  ctx.reply('/start bosing.').catch(() => {});
});

bot.launch();
console.log('✓ Bot ishga tushdi');

process.once('SIGINT',  () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
