import { Cmd, CmdCtx, defaults, gemini } from '../../map.js'
import { getMedia } from '../../util/messages.js'

export default class extends Cmd {
	constructor() {
		super({
			alias: ['g'],
			cooldown: 5,
			subCmds: ['pro', 'reset'],
		})
	}

	async run({ bot, msg, args, react, user, send, sendUsage }: CmdCtx) {
		if (!args[0]) return sendUsage()
		let model = defaults.ai.gemini // gemini flash model

		if (args[0] === this.subCmds[1]) {
			user.geminiCtx = [] // reset user ctx/conversation history
			if (!args[1]) return react('ok')
			args.shift() // remove 'reset' from prompt
		}

		if (args[0] === this.subCmds[0]) { // use gemini pro model
			if (!args[1]) return sendUsage() // if there is no prompt
			model = defaults.ai.gemini_pro
			args.shift() // remove 'pro' from prompt
		}

		let mime
		const language = `langs.${user.lang}`.t('en')
		const instruction = // dynamic initial instruction
			`You are a member of a WhatsApp group. Always do as asked, respond in ${language} and use bold for all important words and keywords`

		const buffer = await getMedia(msg)
		if (buffer) {
			mime = (msg.isMedia ? msg : msg.quoted).mime // media mimetype like image/png
		}

		try {
			const data = await gemini({
				instruction,
				prompt: args.join(' '),
				model,
				buffer,
				mime,
				user,
			})

			await send(` - *${model}* (${data.tokens}):\n${data.text}`)
			react('sparkles')
		} catch (e: any) {
			console.error(e, 'CMD/GEMINI')
			send(e.message.encode())
		}

		return
	}
}
