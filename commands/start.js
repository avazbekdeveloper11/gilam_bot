import { mainKeyboard } from '../keyboards/main_keyboard.js';

export async function startCommand(ctx) {
  await ctx.reply(
    `👋 Salom, *${ctx.from.first_name}*\\!\n\nGilam yuvish boshqaruv botiga xush kelibsiz\\.`,
    { parse_mode: 'MarkdownV2', ...mainKeyboard },
  );
}
