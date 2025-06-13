import { getMedia } from '../../util/messages.js'
import { AnyMessageContent } from 'baileys'
import { Cmd, CmdCtx } from '../../map.js'

export default class extends Cmd {
	constructor() {
		super({
			alias: ['r'],
		})
	}

	async run({ msg, send, react, sendUsage, t }: CmdCtx) {
		if (!msg.isMedia && !msg.quoted?.isMedia) return sendUsage()

		let buffer = await getMedia(msg)

		if (!buffer || !Buffer.isBuffer(buffer)) return send(t('sticker.nobuffer'))

		await react('sparkles')
		const msgObj = {
			caption: msg?.quoted?.text || '',
		} as AnyMessageContent

		// @ts-ignore send sticker as image
		msgObj[target.type === 'sticker' ? 'image' : target.type] = buffer

		await send(msgObj)
		return
	}
}
