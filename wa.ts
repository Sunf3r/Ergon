import { folderHandler, loadCmd, loadEvent } from 'util/handler.ts'
import proto, { run } from 'util/proto.ts'
import { Client, LocalAuth } from 'wa'

proto() // load prototypes
await run(['pkill', 'chrome']) // puppeeter does not close when using deno run --watch
const bot = new Client({
	authStrategy: new LocalAuth({ dataPath: 'conf', clientId: 'ergon' }),
	// auth path = conf/session-ergon
	puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] },
})

const cwd = Deno.cwd() // current working directory
folderHandler(cwd + '/event', loadEvent) // load all events
folderHandler(cwd + '/cmd', loadCmd) // load all commands

bot.initialize()
export default bot

process // "anti-crash" to handle exceptions
	// .on('SIGINT', async (_e) => await cache.save()) // save cache before exit
	.on('uncaughtException', (e) => console.log(`Uncaught Excep.:`, e, 'red'))
	.on('unhandledRejection', (e: any) => console.log(`Unhandled Rej:`, e.stack, 'red'))
	.on('uncaughtExceptionMonitor', (e) => console.log(`Uncaught Excep.M.:`, e, 'red'))
