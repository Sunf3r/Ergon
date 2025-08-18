import { Cmd, CmdCtx } from '../../map.js'

export default class extends Cmd {
	constructor() {
		super({
			alias: ['m'],
		})
	}
	async run({ send }: CmdCtx) {
		const memory = process.memoryUsage()

		const memoryUsageMessage = `Memory Usage:
- RSS (Resident Set Size): ${memory.rss.bytes()}
- Heap Total: ${memory.heapTotal.bytes()}
- Heap Used: ${memory.heapUsed.bytes()}
- External: ${memory.external.bytes()}
- Array Buffers: ${memory.arrayBuffers.bytes()}`

		send(memoryUsageMessage)
		return
	}
}
