import { Telegraf, session } from 'telegraf';
import { authMiddleware } from './middlewares/auth.js';
import { startCommand } from './commands/start.js';
import { ordersCommand } from './commands/orders.js';
import { reportsCommand } from './commands/reports.js';
import { callbackHandler } from './handlers/callback_handler.js';
import { messageHandler } from './handlers/message_handler.js';

export const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session());
bot.use(authMiddleware);

// Commands
bot.command('start',   startCommand);
bot.command('orders',  ordersCommand);
bot.command('reports', reportsCommand);
bot.command('help',    startCommand);

// Handlers
bot.on('callback_query', callbackHandler);
bot.on('message',        messageHandler);

bot.catch((err, ctx) => {
  console.error('Bot xatolik:', err);
  ctx.reply('Xatolik yuz berdi. Qayta urinib ko\'ring.').catch(() => {});
});
