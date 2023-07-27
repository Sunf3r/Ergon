import { extractMetadata, Sticker, StickerTypes } from 'wa-sticker-formatter';
import { downloadMediaMessage } from 'baileys';
import BotClient from '../../Client';
import Jimp from 'jimp';

export default class implements Command {
	public aliases = ['s', 'makesticker'];
	public access = { dm: true, group: true };
	public cooldown = 0;

	run = async (bot: BotClient, msg: Msg, args: string[]) => {
		let sticker: string | Buffer;
		let mediaTypes = ['imageMessage', 'videoMessage', 'stickerMessage'];

		switch (msg.type) {
			case mediaTypes[0]: // imageMessage
			case mediaTypes[1]: // videoMessage
				sticker = await downloadMediaMessage(msg.raw, 'buffer', {})! as Buffer;
				break;
			case 'conversation':
			case 'extendedTextMessage':
				if (!args[0] && !msg.quoted) return;

				// se a msg ta respondendo outra msg q contém uma mídia
				if (msg.quoted && mediaTypes.includes(msg.quoted.type!)) {
					sticker = await downloadMediaMessage(
						msg.quoted.raw,
						'buffer',
						{},
					)! as Buffer;

					if (msg.quoted.type === 'stickerMessage') {
						const stkMeta = await extractMetadata(sticker);
						const caption = `*꒷︶꒷꒦ Sticker Info ꒷꒦︶꒷*\n\n` +
							`*Publisher:* ${stkMeta['sticker-pack-publisher'] || ''}\n` +
							`*Pack:* ${stkMeta['sticker-pack-name'] || ''}\n` +
							`*Emojis:* ${stkMeta.emojis || '[]'}\n` +
							`*ID:* ${stkMeta['sticker-pack-id'] || ''}`;

						return await bot.send(msg.chat, { caption, image: sticker });
					}
					break;
				}

				const text = args.join(' ')!;
				let font: string;

				if (text.length < 10) font = Jimp.FONT_SANS_64_WHITE;
				else if (text.length > 100) font = Jimp.FONT_SANS_16_WHITE;
				else font = Jimp.FONT_SANS_32_WHITE;

				sticker = await new Promise((res) =>
					new Jimp(256, 256, (_e: string, img: Jimp) => {
						Jimp.loadFont(font).then(async (font: any) => {
							img.print(
								font,
								10,
								10,
								{
									text,
									alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
									alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
								},
								240,
								240,
							);
							res(await img.getBufferAsync(Jimp.MIME_PNG));
						});
					})
				);
				break;
		}

		const pack = '꒷︶꒷꒦ Sticker ꒷꒦︶꒷\n' +
			'╰───────────╮\n\n' +
			'╭︰꒰👑꒱・Author:\n' +
			'│︰꒰⛄꒱・Group:\n' +
			'│︰꒰🤖꒱・Bot:\n' +
			'│︰꒰❤️꒱・Developer:\n' +
			'╰︰꒰❓꒱・Support:';

		const author = '꒷︶꒷꒦ Metadata ꒷꒦︶꒷\n' +
			'╭────────────╯\n\n' +
			'︰' + msg.username + '\n' +
			'︰' + (msg.group?.subject || 'Not a group') + '\n' +
			'︰Wall-E ⚡\n' +
			'︰Lucas/Sunf3r ⛄\n' +
			'︰dsc.gg/sunf3r';

		let type = StickerTypes[args[0]?.toUpperCase() as 'FULL'] || StickerTypes.ROUNDED;

		const metadata = new Sticker(sticker!, {
			pack,
			author,
			type,
			categories: ['🎉'],
			id: '12345',
			quality: 75,
		});

		return await bot.send(msg.chat, await metadata.toMessage(), msg.raw);
	};
}
