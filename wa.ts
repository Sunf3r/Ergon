import { loadCmds, loadEvents } from './util/handler.js'
import { locale, proto } from './map.js'
// import cache from './plugin/cache.js'
import Baileys from './class/baileys.js'

proto() // load prototypes
locale() // load locales
const bot = new Baileys('conf/auth')
// auth/ contains auth info to login without scan QR Code again

start()
export async function start() {
	await bot.connect()
	await loadCmds()
	await loadEvents()
}

export default bot
process // "anti-crash" to handle lib instabilities
	// .on('SIGINT', async (_e) => await cache.save()) // save cache before exit
	.on('uncaughtException', (e) => console.log(`Uncaught Excep.:`, e, 'red'))
	.on('unhandledRejection', (e: Error) => console.log(`Unhandled Rej:`, e, 'red'))
	.on('uncaughtExceptionMonitor', (e) => console.log(`Uncaught Excep.M.:`, e, 'red'))
