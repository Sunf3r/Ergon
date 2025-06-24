import { randomDelay } from '../../util/functions.js'
import { Cmd, CmdCtx } from '../../map.js'

export default class extends Cmd {
	constructor() {
		super({
			cooldown: 5_000,
			access: {
				dm: false,
			},
		})
	}

	async run({ startTyping, send, args, group }: CmdCtx) {
		await startTyping()
		await randomDelay()
		/** Delay, ok. But why?
		 * Avoid WA bans.
		 */

		await send({
			text: args.join(' ') || '@everyone',
			mentions: group?.members.map((m) => m.id),
		})
		return
	}
}
