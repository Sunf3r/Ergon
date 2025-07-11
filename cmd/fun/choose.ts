import { Cmd, CmdCtx } from '../../map.js'

export default class extends Cmd {
	constructor() {
		super({})
	}
	async run({ t, send, msg, user, args }: CmdCtx) {
		if (!args[0] || !msg.text.includes(',')) return send('usage.choose', user)

		const options = args.join(' ').split(',') // split options
		if (!options[1]) return send('usage.choose', user)

		const chosen = options[Math.floor(Math.random() * options.length)]
		// get random option

		send(t('choose.result', { chosen: chosen.encode() }))
		return
	}
}
