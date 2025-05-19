import qrcode from 'qr'
import bot from 'main'

// When the client receive the login QR-Code
export default async function (qr: str) {
	console.log('LOGIN', 'QR-Code received', 'green')
	qrcode.generate(qr, { small: true })

	const phone = prompt('Enter your phone number to request pairing code or press Enter to skip: ')
	if (!phone) return console.log('No phone number provided, pairing code will not be requested')

	const code = await bot.requestPairingCode(phone)
	// request pairing code to login with the phone number instead of the QR-Code
	console.log('Pairing code enabled, code: ' + code)
	// insert this code in the app to login
	return
}
