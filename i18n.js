export const t = {
  uz: {
    welcome: `👋 Assalomu alaykum!

🧺 *Gilam yuvish xizmatiga* xush kelibsiz!

Gilamingizni uyingizdan olib ketamiz — toza, yangiday qilib qaytaramiz.

Quyidagi tugmalardan birini tanlang 👇`,

    selectLang: `🌐 Davom etish uchun tilni tanlang:`,

    orderBtn:   `🧺 Zakaz berish`,
    pricesBtn:  `🏷 Narxlar`,
    contactBtn: `📞 Bog'lanish`,
    langBtn:    `🌐 Til`,
    myOrdersBtn: `📋 Mening zakazlarim`,
    langUz:     `🇺🇿 O'zbekcha`,
    langCyr:    `🇺🇿 Ўзбекча`,

    myOrdersTitle: `📋 *Sizning zakazlaringiz:*`,
    noOrdersYet:   `📭 Sizda hali zakazlar yo'q.\n\nZakaz berish uchun "🧺 Zakaz berish" tugmasini bosing.`,
    orderStatusLabels: {
      yangi:        '🆕 Qabul qilindi, kuryer tez orada bog\'lanadi',
      qabulQilindi: '📦 Kuryer gilamingizni olib ketdi',
      yuvilyapti:   '🫧 Hozir yuvilmoqda',
      upakovka:     '📫 Upakovka qilinmoqda',
      tayyor:       '✅ Tayyor — yetkazib berishga tayyorlanmoqda',
      yetkazildi:   '🚚 Yetkazib berildi',
    },
    orderItem: (id, status, date) =>
      `🔖 Buyurtma #${id}\n${status}\n🗓 ${date}`,

    phonePrompt: `📱 Telefon raqamingizni yuboring.

Tugmani bosib raqamingizni ulashing yoki qo'lda yozing:`,
    phoneBtn:    `📱 Raqamni ulashish`,
    phoneError:  `❗ Raqam aniqlanmadi. Iltimos, tugma orqali yuboring:`,

    locationPrompt: `📍 Gilamni qayerdan olib ketishimiz kerak?

Joylashuvingizni yuboring yoki manzilni yozing:`,
    locationBtn:    `📍 Joylashuvni yuborish`,
    addressBtn:     `✏️ Manzilni yozish`,
    addressPrompt:  `✏️ Mahalla, ko'cha va uy raqamini yozing:`,
    addressError:   `❗ Iltimos, manzilni yozing:`,

    success: `✅ Zakaz qabul qilindi!

Tez orada operatorimiz siz bilan bog'lanadi va aniq vaqtni kelishib oladi.

Xizmatimizdan foydalanganingiz uchun rahmat! 🙏`,

    error:   `❌ Texnik xatolik yuz berdi. Iltimos, bir ozdan keyin qayta urinib ko'ring yoki bizga qo'ng'iroq qiling.`,
    fallback: `👇 Quyidagi tugmalardan foydalaning:`,

    pricesTitle: `💰 Xizmatlar narxi\n`,
    unitSqm:     `m²`,
    unitPiece:   `dona`,
    unitMeter:   `metr`,
    discountLine: (min, pct, unit) => `  🎁 ${min} ${unit} va undan ko'p bo'lsa — ${pct}% chegirma`,

    contactText: `📞 Biz bilan bog'laning:\n\n📲 <a href="tel:+998940841779">+998 94 084-17-79</a>\n📲 <a href="tel:+998930831779">+998 93 083-17-79</a>\n\n📍 <a href="https://maps.google.com/?q=39.771392,67.027932">Manzilimiz</a>`,

    serviceNames: {
      'Gilam':    'Gilam',
      'Korpacha': 'Ko\'rpacha',
      'Yostiq':   'Yostiq',
      'Korpa':    'Ko\'rpa',
      'Adyol':    'Adyol',
    },
  },

  cyr: {
    welcome: `👋 Ассалому алайкум!

🧺 *Гилам ювиш хизматига* хуш келибсиз!

Гиламингизни уйингиздан олиб кетамиз — тоза, янгидай қилиб қайтарамиз.

Қуйидаги тугмалардан бирини танланг 👇`,

    selectLang: `🌐 Давом этиш учун тилни танланг:`,

    orderBtn:   `🧺 Заказ бериш`,
    pricesBtn:  `🏷 Нархлар`,
    contactBtn: `📞 Боғланиш`,
    langBtn:    `🌐 Тил`,
    myOrdersBtn: `📋 Менинг заказларим`,
    langUz:     `🇺🇿 O'zbekcha`,
    langCyr:    `🇺🇿 Ўзбекча`,

    myOrdersTitle: `📋 *Сизнинг заказларингиз:*`,
    noOrdersYet:   `📭 Сизда ҳали заказлар йўқ.\n\nЗаказ бериш учун "${'🧺 Заказ бериш'}" тугмасини босинг.`,
    orderStatusLabels: {
      yangi:        '🆕 Қабул қилинди, курьер тез орада боғланади',
      qabulQilindi: '📦 Курьер гиламингизни олиб кетди',
      yuvilyapti:   '🫧 Ҳозир ювилмоқда',
      upakovka:     '📫 Упаковка қилинмоқда',
      tayyor:       '✅ Тайёр — етказиб беришга тайёрланмоқда',
      yetkazildi:   '🚚 Етказиб берилди',
    },
    orderItem: (id, status, date) =>
      `🔖 Буюртма #${id}\n${status}\n🗓 ${date}`,

    phonePrompt: `📱 Телефон рақамингизни юборинг.

Тугмани босиб рақамингизни улашинг ёки қўлда ёзинг:`,
    phoneBtn:    `📱 Рақамни улашиш`,
    phoneError:  `❗ Рақам аниқланмади. Илтимос, тугма орқали юборинг:`,

    locationPrompt: `📍 Гиламни қаердан олиб кетишимиз керак?

Жойлашувингизни юборинг ёки манзилни ёзинг:`,
    locationBtn:    `📍 Жойлашувни юбориш`,
    addressBtn:     `✏️ Манзилни ёзиш`,
    addressPrompt:  `✏️ Маҳалла, кўча ва уй рақамини ёзинг:`,
    addressError:   `❗ Илтимос, манзилни ёзинг:`,

    success: `✅ Заказ қабул қилинди!

Тез орада операторимиз сиз билан боғланади ва аниқ вақтни келишиб олади.

Хизматимиздан фойдаланганингиз учун раҳмат! 🙏`,

    error:   `❌ Техник хатолик юз берди. Илтимос, бир оздан кейин қайта уриниб кўринг ёки бизга қўнғироқ қилинг.`,
    fallback: `👇 Қуйидаги тугмалардан фойдаланинг:`,

    pricesTitle: `💰 Хизматлар нархи\n`,
    unitSqm:     `м²`,
    unitPiece:   `дона`,
    unitMeter:   `метр`,
    discountLine: (min, pct, unit) => `  🎁 ${min} ${unit} ва ундан кўп бўлса — ${pct}% чегирма`,

    contactText: `📞 Биз билан боғланинг:\n\n📲 <a href="tel:+998940841779">+998 94 084-17-79</a>\n📲 <a href="tel:+998930831779">+998 93 083-17-79</a>\n\n📍 <a href="https://maps.google.com/?q=39.771392,67.027932">Манзилимиз</a>`,

    serviceNames: {
      'Gilam':    'Гилам',
      'Korpacha': 'Кўрпача',
      'Yostiq':   'Ёстиқ',
      'Korpa':    'Кўрпа',
      'Adyol':    'Адёл',
    },
  },
};
