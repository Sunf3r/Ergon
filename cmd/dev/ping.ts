import { Cmd, CmdCtx, prisma } from '../../map.js'

export default class extends Cmd {
	constructor() {
		super({
			alias: ['p'],
		})
	}
	async run({ user, react, send, msg }: CmdCtx) {
		let text = `*Ping* 🏓\n`

		// Calculate WA Ping
		const WAPing = await measurePing(react.bind(msg), msg, 'sparkles')
		text += createStr('🌐', '.WhatsApp_', WAPing)

		// Calculate DB Ping
		const DbPing = await measurePing(prisma.users.findUnique, { where: { id: user.id } })
		text += createStr('🥜', '..Database_', DbPing)

		await send(text)
		return
	}
}
function createStr(emoji: str, name: str, ping: num) {
	return `[${emoji}]` + name.bold() + '|' +
		`${ping}ms`.align(8).bold() + '\n'
}

async function measurePing(func: Func, ...args: any): Promise<number> {
	return await new Promise(async (res) => {
		let ping

		try {
			const startTime = Date.now()
			await func(...args)
			ping = Date.now() - startTime
		} catch (_e: any) {
			ping = -1
		}

		return res(ping)
	})
}
