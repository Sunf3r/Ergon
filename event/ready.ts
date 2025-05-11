// import defaults from 'defaults' with { type: 'json' }
// import { startTelegram } from 'plugin/telegram.ts'
import { Client } from 'wa'

// When the bot is online
export default function (bot: Client) {
	console.log('WA', 'Ready', 'green')

	// if (defaults.telegram.token) startTelegram(bot)
}
