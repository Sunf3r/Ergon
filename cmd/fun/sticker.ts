import { Cmd, CmdCtx, isVisualNonSticker, makeTempFile, Msg, runCode } from '../../map.js'
import { randomDelay } from '../../util/functions.js'
import { getMedia } from '../../util/messages.js'
import { Sticker } from 'wa-sticker-formatter'
import { readFile } from 'node:fs/promises'
import { now } from '../../util/proto.js'
import cache from '../../plugin/cache.js'

export default class extends Cmd {
	constructor() {
		super({
			alias: ['s', 'sexo'],
			subCmds: ['rmbg', 'crop', 'rounded', 'circle', 'default'],
		})
	}

	async run({ msg, args, user, group, send, react, sendUsage, startTyping, t }: CmdCtx) {
		const isValid = isVisualNonSticker

		let target = isValid(msg.type) ? msg : (isValid(msg?.quoted?.type) ? msg.quoted : null)
		// target = user msg or user quoted msg

		await startTyping()
		if (target) return await createSticker(target, this.subCmds)

		// this logic will create a sticker for each media sent by
		// the user until a msg is not from them
		const chat = group || cache.users.find((u) => u.phone === msg.chat.parsePhone())!
		const msgs = chat.msgs.reverse().slice(1)
		// Sorts msgs from newest to oldest and ignores the cmd msg

		// Find the index of the first msg that is not from the same author or is not valid
		const invalidIndex = msgs.findIndex((m) => m.author !== msg.author || !isValid(m.type))

		const validMsgs = invalidIndex === -1 ? msgs : msgs.slice(0, invalidIndex)

		if (validMsgs.length === 0) return sendUsage()
		await react('loading')

		for (const m of validMsgs) {
			await createSticker(m, this.subCmds)
		}

		async function createSticker(target: Msg, subCmds: str[]) {
			// choose between msg media or quoted msg media
			let buffer = await getMedia(target)

			if (!Buffer.isBuffer(buffer)) return send(t('sticker.nobuffer'))

			let stickerTypes = ['full', 'crop']
			if (args.includes(subCmds[1])) stickerTypes.push('crop')
			if (args.includes(subCmds[2])) stickerTypes.push('rounded')
			if (args.includes(subCmds[3])) stickerTypes.push('circle')
			if (args.includes(subCmds[4])) stickerTypes.push('default')
			// add other sticker types

			let quality = 20 // media quality after compression

			switch (target.type) {
				case 'video':
					quality = 25 // videos needs to be more compressed
					// but compress a video too much can cause some glitches on video
					break
				case 'image':
					if (args.includes(subCmds[0])) { // remove image background
						const file = await makeTempFile(buffer, 'sticker_', '.webp')
						// create temporary file

						// execute python background remover plugin on
						await runCode('py', `${file} ${file}.png`, 'plugin/removeBg.py')
						// a child process

						buffer = await readFile(`${file}.png`) || buffer
						// read new file
					}
			}

			for (const type of stickerTypes) {
				const metadata = new Sticker(buffer!, { // create sticker metadata
					author: '',
					pack: `=== Ergon Bot ===\n` +
						`[👑] Autor: ${user.name}\n` +
						`[📅] Data: ${now('D')}\n` +
						// `[☃️] Dev: Edu\n` +
						`[❓] Suporte: dsc.gg/ergon`,
					type,
					quality,
				})

				await randomDelay()
					.then(async () => {
						// send several crop types of the same sticker
						await send(await metadata.toMessage())
					})
			}

			return
		}
	}
}
