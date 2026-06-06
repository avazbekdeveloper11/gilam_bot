import 'dotenv/config';
import { Telegraf, session, Markup } from 'telegraf';
import { api } from './services/api.js';
import { fmtOrder, fmtSom, STATUS_LABELS } from './services/formatter.js';

const bot = new Telegraf(process.env.BOT_TOKEN);

// ─── Session ────────────────────────────────────────────────────────────────
bot.use(session({ defaultSession: () => ({ step: null, order: {} }) }));

// ─── Keyboards ──────────────────────────────────────────────────────────────
const mainKb = Markup.keyboard([
  ['➕ Zakaz olish',  '📋 Zakazlar'],
  ['📊 Hisobot',      '👥 Haydovchilar'],
]).resize();

const cancelKb = Markup.keyboard([['❌ Bekor qilish']]).resize();

// ─── /start ─────────────────────────────────────────────────────────────────
bot.start(ctx => ctx.reply(
  `👋 Salom, ${ctx.from.first_name}!\n\nGilam yuvish boshqaruv botiga xush kelibsiz.`,
  mainKb,
));

// ─── ZAKAZ OLISH — conversation ──────────────────────────────────────────────
bot.hears('➕ Zakaz olish', async ctx => {
  ctx.session.step  = 'name';
  ctx.session.order = {};
  await ctx.reply('👤 Mijoz ismini kiriting:', cancelKb);
});

bot.hears('❌ Bekor qilish', async ctx => {
  ctx.session.step  = null;
  ctx.session.order = {};
  await ctx.reply('❌ Bekor qilindi.', mainKb);
});

// ─── ZAKAZLAR ro'yxati ───────────────────────────────────────────────────────
bot.hears('📋 Zakazlar', async ctx => {
  await ctx.reply('⏳ Yuklanmoqda...');
  try {
    const data   = await api.getOrders();
    const orders = data.items || [];
    const active = orders.filter(o => o.status !== 'yetkazildi').slice(0, 15);
    if (!active.length) return ctx.reply('📭 Faol zakazlar yo\'q.', mainKb);
    for (const o of active) {
      await ctx.reply(fmtOrder(o), Markup.inlineKeyboard([
        [Markup.button.callback('🔍 Batafsil', `order:${o.id}`)],
      ]));
    }
  } catch (e) { await ctx.reply('❌ ' + e.message); }
});

// ─── HISOBOT ─────────────────────────────────────────────────────────────────
bot.hears('📊 Hisobot', async ctx => {
  await ctx.reply('⏳ Yuklanmoqda...');
  try {
    const today   = new Date().toISOString().split('T')[0];
    const [ordersData, balances, collections] = await Promise.all([
      api.getOrders('&limit=500'),
      api.getBalances(),
      api.getCollections(today),
    ]);
    const orders = ordersData.items || [];

    const todayOrders = orders.filter(o => (o.created_at || '').slice(0, 10) === today);
    const todayIncome = (collections.drivers || []).reduce((s, d) => s + (d.total_collected || 0), 0);

    const statusLines = Object.entries(STATUS_LABELS).map(([k, label]) => {
      const cnt = orders.filter(o => o.status === k).length;
      return cnt > 0 ? `${label}: ${cnt} ta` : null;
    }).filter(Boolean).join('\n');

    const driverLines = (balances || [])
      .filter(d => d.balance > 0)
      .map(d => `  • ${d.name}: ${fmtSom(d.balance)}`)
      .join('\n') || '  Hammasini topshirishgan';

    const text = [
      `📊 HISOBOT — ${today}`,
      '',
      `🆕 Bugun yangi: ${todayOrders.length} ta`,
      `💰 Bugun yig'im: ${fmtSom(todayIncome)}`,
      '',
      '📦 Zakazlar holati:',
      statusLines,
      '',
      `👥 Haydovchilar qo'lida:\n${driverLines}`,
    ].join('\n');

    await ctx.reply(text, mainKb);
  } catch (e) { await ctx.reply('❌ ' + e.message); }
});

// ─── HAYDOVCHILAR BALANSI ────────────────────────────────────────────────────
bot.hears('👥 Haydovchilar', async ctx => {
  try {
    const balances = await api.getBalances();
    if (!balances.length) return ctx.reply("Haydovchilar yo'q.", mainKb);
    const lines = balances.map(d =>
      `👤 ${d.name}\n  Yig'im: ${fmtSom(d.total_collected)}\n  Topshirilgan: ${fmtSom(d.total_settled)}\n  Qoldiq: ${fmtSom(d.balance)}`
    ).join('\n\n');
    await ctx.reply(`👥 Haydovchilar balansi:\n\n${lines}`, mainKb);
  } catch (e) { await ctx.reply('❌ ' + e.message); }
});

// ─── CALLBACK — order batafsil ────────────────────────────────────────────────
bot.on('callback_query', async ctx => {
  const data = ctx.callbackQuery.data;
  await ctx.answerCbQuery();

  if (data.startsWith('order:')) {
    const id = data.split(':')[1];
    try {
      const o     = await api.getOrder(id);
      const items = o.items_summary;
      let extra   = '';
      if (items) {
        const parts = [];
        if (items.total_sqm   > 0) parts.push(`${Number(items.total_sqm).toFixed(1)} m²`);
        if (items.total_meter > 0) parts.push(`${items.total_meter} m`);
        if (items.total_piece > 0) parts.push(`${items.total_piece} dona`);
        if (parts.length) extra = `\n📐 O'lchov: ${parts.join(' | ')}`;
      }
      await ctx.reply(fmtOrder(o) + extra);
    } catch (e) { await ctx.reply('❌ ' + e.message); }
  }
});

// ─── MESSAGE HANDLER — conversation steps ─────────────────────────────────────
bot.on('message', async ctx => {
  const text = ctx.message?.text || '';
  const step = ctx.session.step;

  if (!step) return; // boshqa xabarlarni e'tiborsiz qoldirish

  if (step === 'name') {
    if (!text.trim()) return ctx.reply('❗ Ism kiriting:');
    ctx.session.order.customer_name = text.trim();
    ctx.session.step = 'phone';
    return ctx.reply('📞 Telefon raqamini kiriting:\n(masalan: 998901234567)', cancelKb);
  }

  if (step === 'phone') {
    const digits = text.replace(/\D/g, '');
    if (digits.length < 9) return ctx.reply('❗ To\'liq telefon raqam kiriting:');
    ctx.session.order.phone = digits.length === 9 ? '998' + digits : digits;
    ctx.session.step = 'address';
    return ctx.reply('📍 Manzilni kiriting:', cancelKb);
  }

  if (step === 'address') {
    if (!text.trim()) return ctx.reply('❗ Manzil kiriting:');
    ctx.session.order.address = text.trim();
    ctx.session.step = 'notes';
    return ctx.reply(
      "📝 Izoh kiriting (gilam turi, soni va h.)\nyoki /o'tkazib yuborish uchun - yuboring:",
      cancelKb,
    );
  }

  if (step === 'notes') {
    ctx.session.order.notes = text.trim() === '-' ? null : text.trim();
    ctx.session.step = 'confirm';

    const o = ctx.session.order;
    const preview = [
      '📋 Zakaz ma\'lumotlari:',
      '',
      `👤 Mijoz: ${o.customer_name}`,
      `📞 Telefon: ${o.phone}`,
      `📍 Manzil: ${o.address}`,
      o.notes ? `📝 Izoh: ${o.notes}` : '',
      '',
      'Tasdiqlaysizmi?',
    ].filter(l => l !== '').join('\n');

    return ctx.reply(preview, Markup.keyboard([
      ['✅ Ha, saqlash'],
      ['✏️ Qayta kiritish', '❌ Bekor qilish'],
    ]).resize());
  }

  if (step === 'confirm') {
    if (text === '✅ Ha, saqlash') {
      try {
        const o    = ctx.session.order;
        const now  = new Date().toISOString();
        const result = await api.createOrder({
          customer_name: o.customer_name,
          phone:         o.phone,
          address:       o.address,
          notes:         o.notes || null,
          pickup_date:   now,
          delivery_date: now,
          carpet_count:  0,
          carpet_types:  '',
        });
        ctx.session.step  = null;
        ctx.session.order = {};
        await ctx.reply(
          `✅ Zakaz #${result.id} muvaffaqiyatli saqlandi!\n\n👤 ${result.customer_name}\n📞 ${result.phone}`,
          mainKb,
        );
      } catch (e) {
        await ctx.reply('❌ Xatolik: ' + e.message, mainKb);
        ctx.session.step  = null;
        ctx.session.order = {};
      }
    } else if (text === '✏️ Qayta kiritish') {
      ctx.session.step  = 'name';
      ctx.session.order = {};
      await ctx.reply('👤 Mijoz ismini kiriting:', cancelKb);
    }
  }
});

// ─── Launch ──────────────────────────────────────────────────────────────────
bot.launch();
console.log('✓ Gilam bot ishga tushdi');

process.once('SIGINT',  () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
