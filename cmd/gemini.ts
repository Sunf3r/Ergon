import defaults from 'defaults' with { type: 'json' }
import Cmd from 'class/cmd.ts'
import { CmdCtx } from 'types'
import emojis, { restrictEmojis } from 'util/emojis.ts'
import { getMedia } from 'util/functions.ts'
import { gemini } from 'util/api.ts'

export default class extends Cmd {
	constructor() {
		super({
			name: 'gemini',
			alias: ['g'],
			cooldown: 5_000,
			subCmds: ['reset', 'pro'],
		})
	}
	async run({ bot, msg, args, user }: CmdCtx) {
		if (!args[0]) return bot.sendMessage(msg.to, 'Por favor escreva um prompt')
		let model = defaults.ai.gemini

		if (args[0] === this.subCmds[0]) {
			user.gemini = []
			if (!args[1]) return msg.react(restrictEmojis['ok'])
			args.shift()
		}

		if (args[0] === this.subCmds[1]) {
			if (!args[1]) return bot.sendMessage(msg.to, 'Por favor escreva um prompt')
			model = defaults.ai.gemini_pro
			args.shift()
		}

		await msg.react(emojis['think'])
		const file = await getMedia(msg)

		try {
			const data = await gemini({
				model,
				input: args.join(' '),
				user,
				file,
			})
			bot.sendMessage(msg.to, ` - *${data.model}*:\n${data.text}`)
		} catch (e: any) {
			console.log('CMD/GEMINI', e, 'red')
			return bot.sendMessage(msg.to, String(e.message || e))
		}
	}
}
