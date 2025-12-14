import fetch from 'node-fetch';
import { config } from './config.js';

export async function sendTelegramMessage(chatId: string, text: string): Promise<boolean> {
  if (!config.TELEGRAM_BOT_TOKEN) {
    console.error('[Telegram] Bot token not configured');
    return false;
  }

  const url = `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json() as { ok: boolean; description?: string };

    if (!data.ok) {
      console.error('[Telegram] Send failed:', data.description);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Telegram] Send error:', error);
    return false;
  }
}
