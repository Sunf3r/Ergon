import { Cmd, CmdCtx, delay } from '../../map.js'
import { randomDelay } from '../../util/functions.js'

export default class extends Cmd {
	constructor() {
		super({
			access: {
				dm: false,
				admin: true, /** Admin: true
				 * (it means only group admins can run this cmd)
				 * I don't think it's really necessary bc
				 * every group member can just mention everyone
				 * and then copy/paste it every time, but
				 * I was asked for it by a user. So, I did it for him
				 */
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
