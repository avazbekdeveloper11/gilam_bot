import 'dotenv/config';
import { Telegraf, session, Markup } from 'telegraf';
import { api } from './services/api.js';

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session({ defaultSession: () => ({ step: null, name: null, phone: null, address: null, lat: null, lng: null }) }));

// ─── /start ──────────────────────────────────────────────────────────────────
bot.start(async ctx => {
  ctx.session = { step: null, name: null, phone: null, address: null, lat: null, lng: null };

  const firstName = ctx.from.first_name || '';
  const lastName  = ctx.from.last_name  || '';
  const fullName  = [firstName, lastName].filter(Boolean).join(' ');

  await ctx.reply(
    `👋 Salom! Gilam yuvish xizmatiga xush kelibsiz!\n\nZakaz berish uchun bir necha savol beramiz.`,
  );

  // Ism — Telegramdan olamiz, lekin o'zgartirish imkoni beramiz
  ctx.session.telegramName = fullName;
  ctx.session.step = 'name';

  await ctx.reply(
    `👤 Ismingiz:\n\n"${fullName}" — Telegram profildan olindi.\n\nAgar boshqa ism kiritsangiz yozing, yoki tasdiqlash uchun tugmani bosing:`,
    Markup.keyboard([
      [`✅ ${fullName}`],
    ]).resize().oneTime(),
  );
});

// ─── MESSAGE HANDLER ──────────────────────────────────────────────────────────
bot.on('message', async ctx => {
  const step = ctx.session?.step;
  const text = ctx.message?.text || '';

  // ── STEP 1: Ism ─────────────────────────────────────────────────────────────
  if (step === 'name') {
    let name = text;

    // Tugma bosilsa — Telegramdan olgan ism
    if (text.startsWith('✅ ')) name = text.slice(2).trim();

    if (!name.trim()) {
      return ctx.reply('❗ Ismingizni kiriting:');
    }

    ctx.session.name = name.trim();
    ctx.session.step = 'phone';

    await ctx.reply(
      `📞 Telefon raqamingizni yuboring:\n\nFormat: 998901234567\n\nYoki tugma orqali kontaktingizni yuboring:`,
      Markup.keyboard([
        [Markup.button.contactRequest('📱 Kontaktni yuborish')],
      ]).resize().oneTime(),
    );
    return;
  }

  // ── STEP 2: Telefon — yozib kiritilsa ───────────────────────────────────────
  if (step === 'phone') {
    // Contact yuborilgan bo'lsa
    if (ctx.message.contact) {
      const phone = ctx.message.contact.phone_number.replace(/\D/g, '');
      ctx.session.phone = phone.startsWith('998') ? phone : '998' + phone;
    } else {
      const digits = text.replace(/\D/g, '');
      if (digits.length < 9) {
        return ctx.reply(
          '❗ Telefon raqam noto\'g\'ri.\n\nFormat: 998901234567 (12 ta raqam)\n\nYoki tugma orqali kontakt yuboring:',
          Markup.keyboard([
            [Markup.button.contactRequest('📱 Kontaktni yuborish')],
          ]).resize().oneTime(),
        );
      }
      ctx.session.phone = digits.length === 9 ? '998' + digits : digits.slice(-12);
    }

    ctx.session.step = 'location';
    await ctx.reply(
      `📍 Manzilingizni yuboring:\n\nGilam olib ketadigan joyni ko'rsating. Tugma orqali hozirgi joylashuvingizni yuboring yoki manzilni yozing:`,
      Markup.keyboard([
        [Markup.button.locationRequest('📍 Joylashuvni yuborish')],
        ['✏️ Manzilni yozib kiritish'],
      ]).resize().oneTime(),
    );
    return;
  }

  // ── STEP 2: Telefon — contact yuborilsa ─────────────────────────────────────
  if (step === 'phone' && ctx.message.contact) {
    const phone = ctx.message.contact.phone_number.replace(/\D/g, '');
    ctx.session.phone = phone.startsWith('998') ? phone : '998' + phone;
    ctx.session.step = 'location';

    await ctx.reply(
      `📍 Manzilingizni yuboring:`,
      Markup.keyboard([
        [Markup.button.locationRequest('📍 Joylashuvni yuborish')],
        ['✏️ Manzilni yozib kiritish'],
      ]).resize().oneTime(),
    );
    return;
  }

  // ── STEP 3: Manzil (yozib) ───────────────────────────────────────────────────
  if (step === 'location') {
    // Location yuborilgan bo'lsa
    if (ctx.message.location) {
      ctx.session.lat     = ctx.message.location.latitude;
      ctx.session.lng     = ctx.message.location.longitude;
      ctx.session.address = `📍 Joylashuv: ${ctx.session.lat.toFixed(4)}, ${ctx.session.lng.toFixed(4)}`;
    } else if (text === '✏️ Manzilni yozib kiritish') {
      ctx.session.step = 'address_text';
      return ctx.reply(
        '✏️ Manzilni yozing:\n(mahalla, ko\'cha, uy raqami)',
        Markup.removeKeyboard(),
      );
    } else if (text) {
      ctx.session.address = text.trim();
    } else {
      return ctx.reply(
        'Joylashuvni yuboring yoki manzilni yozing:',
        Markup.keyboard([
          [Markup.button.locationRequest('📍 Joylashuvni yuborish')],
          ['✏️ Manzilni yozib kiritish'],
        ]).resize().oneTime(),
      );
    }

    ctx.session.step = 'notes';
    await ctx.reply(
      `📝 Izoh (ixtiyoriy):\n\nGilam turi, soni yoki boshqa ma'lumot kiriting.\nYoki o'tkazib yuborish uchun tugmani bosing:`,
      Markup.keyboard([["➡️ O'tkazib yuborish"]]).resize().oneTime(),
    );
    return;
  }

  // ── STEP 3b: Manzil matn shaklda ────────────────────────────────────────────
  if (step === 'address_text') {
    if (!text.trim()) return ctx.reply('❗ Manzilni kiriting:');
    ctx.session.address = text.trim();
    ctx.session.step    = 'notes';
    await ctx.reply(
      `📝 Izoh (ixtiyoriy):\n\nGilam turi, soni yoki boshqa ma'lumot kiriting.\nYoki o'tkazib yuborish uchun tugmani bosing:`,
      Markup.keyboard([["➡️ O'tkazib yuborish"]]).resize().oneTime(),
    );
    return;
  }

  // ── STEP 4: Izoh ─────────────────────────────────────────────────────────────
  if (step === 'notes') {
    ctx.session.notes = (text === "➡️ O'tkazib yuborish") ? null : text.trim();
    ctx.session.step  = 'confirm';

    const s = ctx.session;
    const preview = [
      '📋 Zakaz ma\'lumotlari:',
      '',
      `👤 Ism: ${s.name}`,
      `📞 Telefon: +${s.phone}`,
      `📍 Manzil: ${s.address}`,
      s.notes ? `📝 Izoh: ${s.notes}` : '',
      '',
      'Tasdiqlaysizmi?',
    ].filter(l => l !== '').join('\n');

    await ctx.reply(
      preview,
      Markup.keyboard([
        ['✅ Tasdiqlash'],
        ['✏️ Qayta boshlash'],
      ]).resize().oneTime(),
    );
    return;
  }

  // ── STEP 5: Tasdiqlash ───────────────────────────────────────────────────────
  if (step === 'confirm') {
    if (text === '✅ Tasdiqlash') {
      try {
        const s   = ctx.session;
        const now = new Date().toISOString();

        const result = await api.createOrder({
          customer_name: s.name,
          phone:         s.phone,
          address:       s.address || 'Joylashuv yuborildi',
          notes:         s.notes   || null,
          pickup_lat:    s.lat     || null,
          pickup_lng:    s.lng     || null,
          pickup_date:   now,
          delivery_date: now,
          carpet_count:  0,
          carpet_types:  '',
        });

        ctx.session = { step: null };

        await ctx.reply(
          `✅ Rahmat, ${s.name}!\n\nZakarzingiz qabul qilindi (#${result.id}).\n\n🕐 Tez orada siz bilan bog'lanamiz!\n\nYangi zakaz berish uchun /start bosing.`,
          Markup.removeKeyboard(),
        );
      } catch (e) {
        await ctx.reply('❌ Xatolik yuz berdi: ' + e.message + '\n\nQayta urinib ko\'ring: /start');
        ctx.session = { step: null };
      }

    } else if (text === '✏️ Qayta boshlash') {
      ctx.session = { step: null };
      await ctx.reply('Qayta boshlash uchun /start bosing.', Markup.removeKeyboard());
    }
    return;
  }

  // Boshqa xabarlar
  if (!step) {
    await ctx.reply(
      'Zakaz berish uchun /start bosing.',
      Markup.keyboard([['/start']]).resize(),
    );
  }
});

// Location alohida handler (step=location bo'lganda)
bot.on('location', async ctx => {
  if (ctx.session?.step !== 'location') return;

  ctx.session.lat     = ctx.message.location.latitude;
  ctx.session.lng     = ctx.message.location.longitude;
  ctx.session.address = `${ctx.session.lat.toFixed(5)}, ${ctx.session.lng.toFixed(5)}`;
  ctx.session.step    = 'notes';

  await ctx.reply(
    `✅ Joylashuv qabul qilindi!\n\n📝 Izoh (ixtiyoriy):\n\nGilam turi, soni yoki boshqa ma'lumot kiriting.\nYoki o'tkazib yuborish uchun tugmani bosing:`,
    Markup.keyboard([["➡️ O'tkazib yuborish"]]).resize().oneTime(),
  );
});

// Contact alohida handler (step=phone bo'lganda)
bot.on('contact', async ctx => {
  if (ctx.session?.step !== 'phone') return;

  const phone = ctx.message.contact.phone_number.replace(/\D/g, '');
  ctx.session.phone = phone.startsWith('998') ? phone : '998' + phone;
  ctx.session.step  = 'location';

  await ctx.reply(
    `✅ Telefon qabul qilindi!\n\n📍 Manzilingizni yuboring:`,
    Markup.keyboard([
      [Markup.button.locationRequest('📍 Joylashuvni yuborish')],
      ['✏️ Manzilni yozib kiritish'],
    ]).resize().oneTime(),
  );
});

bot.catch((err, ctx) => {
  console.error('Bot xatolik:', err);
  ctx.reply("Xatolik yuz berdi. /start bilan qayta boshlang.").catch(() => {});
});

bot.launch();
console.log('✓ Gilam mijoz boti ishga tushdi');

process.once('SIGINT',  () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
