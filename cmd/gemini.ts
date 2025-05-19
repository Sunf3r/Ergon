import { getMedia, sendOrEdit } from 'util/functions.ts'
import emojis, { restrictEmojis } from 'util/emojis.ts'
import defaults from 'defaults' with { type: 'json' }
import { gemini } from 'util/gemini.ts'
import { CmdCtx } from 'types'
import Cmd from 'class/cmd.ts'
import { Message } from 'wa'
import bot from 'main'

export default class extends Cmd {
	constructor() {
		super({
			alias: ['g'],
			cooldown: 5_000,
			subCmds: ['reset', 'pro'],
		})
	}
	async run({ msg, args, user }: CmdCtx) {
		if (!args[0]) return bot.sendMessage(msg.to, 'Por favor escreva um prompt')
		let model = defaults.ai.gemini // default gemini model

		if (args[0] === this.subCmds[0]) { // reset
			user.gemini = []
			if (!args[1]) return msg.react(restrictEmojis['ok'])
			args.shift()
		}

		if (args[0] === this.subCmds[1]) { // use pro model
			if (!args[1]) return bot.sendMessage(msg.to, 'Por favor escreva um prompt')
			model = defaults.ai.gemini25 // gemini 2.5 flash preview
			args.shift()
		}

		const file = await getMedia(msg) // download msg media or quoted msg media

		const streamMsg = { // Workaround to make the variable always point to
			msg: {}, // this memory space
		} as { msg: Message }
		await gemini({
			model,
			input: args.join(' '),
			user,
			chat: msg.to, // this chat id
			file,
			callBack: sendOrEdit, // edit msg while gemini writes it
			args: [bot, streamMsg!, msg.to], // arguments to pass to the callback
		})
			.then(() => msg.react(emojis['think']))
			.catch((e) => {
				console.log('CMD/GEMINI', e.stack, 'red')
				bot.sendMessage(msg.to, String(e.message || e))
			})
		return
	}
}
