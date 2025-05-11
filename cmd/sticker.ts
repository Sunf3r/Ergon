import { getMedia, now, toBase64 } from 'util/functions.ts'
import { crop } from 'plugin/manipulation.ts'
import { Buffer } from 'node:buffer'
import { run } from 'util/proto.ts'
import { MessageMedia } from 'wa'
import { CmdCtx } from 'types'
import Cmd from 'class/cmd.ts'

export default class extends Cmd {
	constructor() {
		super({
			name: 'sticker',
			alias: ['sexo', 's'],
			cooldown: 4_000,
			// subCmds: [''],
		})
	}

	async run({ bot, msg, user }: CmdCtx) {
		const media = await getMedia(msg)
		if (!media) return msg.reply('Mídia não encontrada')
		const { mime, data, target } = media

		const msgConf = {
			sendMediaAsSticker: true,
			stickerAuthor: '',
			stickerName: `=== Ergon Bot ===\n` +
				`[👑] Autor: ${user.name}\n` +
				`[📅] Data: ${now('D')}\n` +
				// `[☃️] Dev: Edu\n` +
				`[❓] Suporte: dsc.gg/ergon`,
		}

		const rawMedia = new MessageMedia(mime, data)
		await bot.sendMessage(msg.to, rawMedia, msgConf)

		if (target.type === 'image') {
			const buffer = Buffer.from(data, 'base64')
			const cropped = await crop(buffer)

			const croppedMedia = new MessageMedia(
				media.mime,
				toBase64(cropped),
			)
			await bot.sendMessage(msg.to, croppedMedia, msgConf)
		}
		if (target.type === 'video') {
			const name = Date.now() + '.mp4'
			const buffer = Buffer.from(data, 'base64')
			const input = `conf/temp/${name}`
			const output = `conf/temp/crop_${name}.gif`
			await Deno.writeFile(input, buffer)

			await run([
				'ffmpeg',
				'-i',
				input,
				'-vf',
				"crop='in_w:in_w'",
				'-y',
				output,
			])

			const cropped = await Deno.readFile(output)
			const croppedMedia = new MessageMedia('video/gif', toBase64(cropped))
			await bot.sendMessage(msg.to, croppedMedia, msgConf)
			Deno.remove(input)
			Deno.remove(output)
		}
		return
	}
}
