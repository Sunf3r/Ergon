import type { CmdContext } from '../../Core/Typings/index.d.ts';
import Command from '../../Core/Classes/Command.js';
import translate from 'google-translate';

export default class extends Command {
	constructor() {
		super({
			aliases: ['t'],
			cooldown: 5,
		});
	}

	async run({ bot, msg, args, sendUsage, t }: CmdContext) {
		if (!args[1]) return sendUsage();

		const toLang = args.shift();
		try {
			const translation = await translate(args.join(' '), { to: toLang });

			const text = `*[🌐] - ${t('translate.desc')}*\n` +
				`*${translation?.from.language.iso}  ➟  ${toLang}*\n` +
				translation?.text.encode();

			bot.send(msg, text);
		} catch (_e) {
			sendUsage();
		}
		return;
	}
}
