import Cmd from 'class/cmd.ts'
import cache from 'cache'
import bot from 'main'

export async function folderHandler(path: str, handler: Func) {
	// iterates through a folder and loads all files
	let count = 0

	for await (const archive of Deno.readDir(path)) {
		const file = await import(`${path}/${archive.name}`)
		const name = archive.name.split('.')[0]

		handler.bind(bot)(name, file.default)
		count++
	}

	console.log(
		'HANDLER',
		`${count} ${path.includes('event') ? 'events' : 'cmds'} loaded`,
		'yellow',
	)
	return
}

export function loadEvent(event: str, imported: Func) {
	bot.on(event, (...args) => imported(...args))
	return
}

export function loadCmd(name: str, imported: any) {
	const cmd: Cmd = new imported()
	cmd.name = name

	cache.cmds.add(name, cmd)
	// set cmd
	return
}
