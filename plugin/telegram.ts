// not a priority right now
// temporarily disabled

import defaults from 'defaults' with { type: 'json' }
import User from 'class/user.ts'
import { Bot } from 'grammy'
import { Client } from 'wa'

// Create a bot object
const telegram = new Bot(defaults.telegram.token) // <-- place your bot token in this string

export default telegram
export { startTelegram }

function startTelegram(wa: Client) {
	telegram.on('message:text', async (ctx) => {
		const { message, reply } = ctx
		console.log(message)
		const topic = ctx.message.reply_to_message?.forum_topic_created?.name
		const thread = ctx.message.reply_to_message?.message_thread_id
		if (!topic || !thread) return

		const user = new User({ telegram: thread, name: topic })
		user.telegram = thread

		if (!user) return reply('User not found')

		await wa.sendMessage(user.phone + '@c.us', message.text)
		return
	})
	// bot.on('message:photo', (ctx) => ctx.reply('Nice photo! Is that you?'))
	// bot.on(
	// 	'edited_message',
	// 	(ctx) =>
	// 		ctx.reply('Ha! Gotcha! You just edited this!', {
	// 			reply_parameters: { message_id: ctx.editedMessage.message_id },
	// 		}),
	// )
	telegram.start()
	console.log('TELEGRAM', 'bot started', 'blue')
}
// Start the bot (using long polling)
