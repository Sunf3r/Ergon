import config from '../../Core/JSON/config.json' assert { type: 'json' };
import type { CmdContext } from '../../Core/Typings/types.js';
import { coolMsgTypes } from '../../Core/Typings/MsgTypes.js';
import { getCtx } from '../../Core/Components/Utils.js';
import type Bot from '../../Core/Classes/Bot.js';
import { type proto } from 'baileys';
import i18next from 'i18next';

export default async function (bot: Bot, raw: { messages: proto.IWebMessageInfo[] }, e: str) {
	if (!raw.messages[0].message) return;

	// get abstract msg obj
	const { msg, group, user } = await getCtx(raw.messages[0], bot);

	if (group && Object.values(coolMsgTypes).includes(msg.type)) {
		group.cacheMsg(msg);
		if (!msg.isBot) group.countMsg(user.id);
	}

	// run 'waitFor' events
	if (bot.wait.has(e)) bot.wait.get(e)(bot, msg, user, group);

	if (!msg.text.startsWith(user.prefix)) return;

	const args: str[] = msg.text.replace(user.prefix, '').trim().split(' ');
	const callCmd = args.shift()!.toLowerCase()!;
	// search command by name or by aliases
	const cmd = bot.cmds.get(callCmd) || bot.cmds.get(bot.aliases.get(callCmd)!);
	// get locales function

	if (!cmd) return;
	// block only devs cmds for normal people
	if (cmd.access?.onlyDevs && !config.DEVS.includes(user.id)) return bot.react(msg, '🚫');

	user.addCmd();

	const ctx: CmdContext = {
		t: i18next.getFixedT(user.lang),
		sendUsage,
		callCmd,
		group,
		args,
		user,
		bot,
		cmd,
		msg,
	};

	try {
		// start typing (expires after about 10 seconds.)
		bot.sock.sendPresenceUpdate('composing', msg.chat);

		cmd.run!(ctx);
	} catch (e: any) {
		bot.send(msg, `[⚠️] ${e?.stack || e}`);

		bot.react(msg, '❌');
	}

	return;

	async function sendUsage() {
		args[0] = cmd.name;

		bot.cmds.get('help').run(ctx);
		bot.react(msg, '🤔');
		return;
	}
}
