import { DateTime } from 'luxon'
import { bot } from '../map.js'
import i18next from 'i18next'
import chalk from 'chalk'

// get the now date time formatted
const now = () =>
	DateTime.now()
		.setZone(bot.region.timezone)
		.setLocale(bot.region.logLanguage)
		.toFormat('T')

export { now }

export default () => {
	/* String Prototypes */
	Object.defineProperties(String.prototype, {
		//      'deno'.toPascalCase() === 'Deno'
		toPascalCase: {
			value: function () {
				return this.slice(0, 1).toUpperCase() + this.slice(1)
			},
		},
		encode: {
			value: function () {
				return '```\n' + this + '```'
			},
		},
		filterForRegex: {
			value: function () {
				return this.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
			},
		},
		t: {
			value: function (lang: str) {
				return i18next.getFixedT(lang)(this)
			},
		},
		align: {
			value: function (limit: number, endPosition?: boolean) {
				const ratio = (limit - this.length) / 2
				const start = ' '.repeat(Math.ceil(ratio))
				const end = ' '.repeat(Math.floor(ratio))

				if (endPosition) return (end + this + start).slice(0, limit)
				else return (start + this + end).slice(0, limit)
			},
		},
	})

	/* Number Prototypes */
	Object.defineProperties(Number.prototype, {
		bytes: {
			value: function (onlyNumbers?: bool) {
				const types = ['B', 'KB', 'MB', 'GB']
				let type = 0
				let number = this

				while (number / 1024 >= 1) {
					type++
					number = number / 1024
				}

				number = number.toFixed()

				// if (number.slice(-2) === '.0') number = number.slice(0, -2);

				return onlyNumbers ? Number(number) : number + types[type]
			},
		},
	})

	/*      console.error        */
	// easier way to print error messages
	console.error = (error: { stack: str }) => {
		const msg = String(error?.stack || error)
			.slice(0, 512)

		console.log('ERROR', msg, 'red')
	}

	/*      console.log        */
	// The same console.log but styled differently
	global.print = console.log = (...args) => {
		if (typeof args[0] !== 'string' || !args[2]) {
			console.info(...args)
			return
		}

		const [title, msg, color]: string[] = [...args]

		const str = `[${title.align(12)}| ${now()} | ${
			(process.memoryUsage().rss.bytes() as str).align(6, true)
		}] - ${msg}`

		// console.log(str);
		console.info(chalk.bold[color as 'red'](str))
		// it prints: [ TITLE | 18:04 | 69MB ] - msg (colored)
		return
	}

	print('PROTO', 'All set.', 'yellowBright')
	return
}
