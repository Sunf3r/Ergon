import { Cmd, CmdCtx, emojis, isVisual, makeTempFile, runCode } from '../../map.js'
import { getMedia } from '../../util/messages.js'
import { readFile } from 'fs/promises'

export default class extends Cmd {
	constructor() {
		super({
			alias: ['rm'],
			cooldown: 5,
		})
	}

	async run({ msg, react, send, sendUsage, t }: CmdCtx) {
		if (!isVisual(msg.type) && !isVisual(msg.quoted?.type)) return sendUsage()

		let media = await getMedia(msg)

		if (!media) return send(t('sticker.nobuffer'))
		await react('loading')

		const file = await makeTempFile(media.data, 'rmbg_', '.webp')
		// create temporary file

		// execute python background remover plugin on
		await runCode('py', `${file} ${file}.png`, 'plugin/removeBg.py')
		// a child process

		media.data = await readFile(`${file}.png`) || media.data
		// read new file

		await send({ caption: emojis['sparkles'], image: media.data })
		react('ok')
		return
	}
}
