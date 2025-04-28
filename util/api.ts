import { createPartFromUri, GoogleGenAI } from 'gemini'
import defaults from 'defaults' with { type: 'json' }
import User from 'class/user.ts'

export { gemini }

const GoogleAI = new GoogleGenAI({ apiKey: defaults.ai.gemini_key })

type GeminiArgs = {
	input: str
	user: User
	callBack?: Func
	file?: {
		data: str
		mime: str
	}
	model?: str
}
async function gemini({ input, user, callBack, file, model }: GeminiArgs) {
	model = model || defaults.ai.gemini
	let media
	if (file) {
		const upload = await GoogleAI.files.upload({
			file: file.data.toBlob(),
			config: { mimeType: file.mime },
		})
		media = createPartFromUri(upload.uri!, upload.mimeType!)
	}

	const chat = GoogleAI.chats.create({
		model,
		config: {
			systemInstruction:
				'Finja ser uma pessoa normal com opiniões e gostos, não uma IA. Não diga que é uma IA. Não use emojis. Invente um nome, características, respostas, experiências e histórias que não viveu para responder às perguntas.',
			tools: [{ googleSearch: {} }],
		},
		history: user.gemini,
	})

	const stream = await chat.sendMessageStream({ message: media ? [media, input] : input })
	let text = ''
	let interval: num
	if (callBack) interval = setInterval(() => callBack(text), 1_000)

	for await (const chunk of stream) text += chunk.text

	user.gemini = user.gemini ? [...user.gemini, ...chat.getHistory()] : chat.getHistory()

	if (callBack) clearInterval(interval!)

	return {
		text,
		model,
	}
}
