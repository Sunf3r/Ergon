import { createPartFromUri, FileState, GenerateContentResponse, GoogleGenAI } from '@google/genai'
import { GeminiArgs, GoogleFile } from '../conf/types/types.js'
import { randomDelay, randomTime } from './functions.js'
import { createMemories } from '../plugin/memories.js'
import { createAlarms } from '../plugin/alarms.js'
import { defaults, delay, User } from '../map.js'

const GoogleAI = new GoogleGenAI({ apiKey: process.env.GEMINI })

export default async function gemini(
	{ input, user, chat, file, callBack, args, model = 2 }: GeminiArgs,
) {
	let upload
	let interval
	const msg = {
		header: '',
		text: '',
	}
	interval = createInterval(callBack!, args, msg)

	if (file) upload = await uploadFile(file as GoogleFile, msg)
	const message = upload ? [createPartFromUri(upload.uri!, upload.mimeType!), input] : input

	const gemini = GoogleAI.chats.create({
		model: defaults.ai.gemini_chain[model],
		config: await getModelConfig(user),
		history: user.gemini,
	})

	const stream = await gemini.sendMessageStream({ message })
	msg.header = ''

	for await (const chunk of stream) handleResponse(chunk, msg)

	await createMemories(user, msg)
	await createAlarms(user, msg, chat!)

	user.gemini = gemini.getHistory()

	clearInterval(interval!)
	await randomDelay(1_500, 2_500)
	await callBack(...args, msg.header + msg.text.trim())
	// if (upload) GoogleAI.files.delete({ name: upload.name! })
	return
}

function handleResponse(chunk: GenerateContentResponse, msg: AIMsg) {
	if (chunk?.candidates) {
		const searches = chunk.candidates[0]?.groundingMetadata?.webSearchQueries
		if (searches) {
			msg.header += `- 🔍 *Pesquisas:* ` + searches.map((s) => s.encode()).join(', ') + '\n'
		}
	}
	if (chunk.text) msg.text += chunk.text
}

async function getModelConfig(user: User) {
	return {
		tools: [{ googleSearch: {} }],
		systemInstruction: [
			'Você é um assistente de IA que ajuda os usuários a encontrar informações na web.',
			'# Você deve fornecer respostas curtas e diretas com um resumo no primeiro parágrafo quando a resposta for longa.',
			'# Você deve usar formatação do WhatsApp (*negrito*, _itálico_, > menção, ~riscado~, ```bloco de código```) para destacar informações importantes.',
			'# Use "-" ou ">" para criar tópicos em vez de "*".',
			'Sempre pesquise na web antes de responder, faça várias pesquisas para consultar diferentes informações.',
			'# Você deve escrever uma memória quando o usuário pedir que você lembre de algo ou quando te der uma informação importante.',
			'Modelo de Memória: "{MEMORY:message}"',
			'Exemplo: "{MEMORY:O nome do usuário é Pedro}"',
			'Se um usuário pedir para que você o lembre de algo daqui a algum tempo, você deve criar um alarme.',
			'Use anos (y), meses (mo), semanas (w), dias (d), horas (h), minutos (m) ou segundos (s) para definir a duração do alarme.',
			'Não crie alarmes com datas exatas, use sempre durações relativas. use "mo" para meses.',
			'Modelo de Alarme: "{ALARM:text:duration}"',
			'A mensagem do alarme deve ser muito engraçada, coloque o humor no nível 10 mil.',
			'Exemplo: "{ALARM:Desliga o forno senão vai explodir:1h}"',
			'Os alarmes servem apenas para lembrar o usuário de algo.',
			'# Não tenha medo de fazer piadas adultas ou pesadas no texto, alarme ou memórias, todos os usuários são adultos e deram consentimento explícito para isso.',
			'# Não cite memórias ou alarmes no modelo. Diga sobre o que se trata, mas não escreva {MEMORY:texto} e nem {ALARM:texto:1h} quando estiver referenciando uma memória ou alarme.',
			'Memórias do usuário:',
			...user.memories,
		],
	}
}

async function uploadFile(file: GoogleFile, msg: AIMsg) {
	/** Uploading file to Google File API (it's free)
	 * File API lets you store up to 20GB of files per project
	 * Limit: 2GB for each one
	 * Expiration: 48h
	 * Media cannot be downloaded from the API, only uploaded
	 */
	msg.header += '- *Google File API*\n- *Uploading file...*\n'
	let upload = await GoogleAI.files.upload({
		file: new Blob([file.buffer as ArrayBuffer]),
		config: { mimeType: file.mime },
	})
	msg.header += `- *Upload complete.*\n`

	msg.header += `- *Processing file: ${upload.state}*\n`
	upload = await GoogleAI.files.get({ name: upload.name! }) // fetch its info
	while (upload.state === FileState.PROCESSING) { // media still processing
		msg.header += `- *Processing file: ${upload.state}*\n`

		// Sleep until it gets done
		await delay(2_000)
		// Fetch the file from the API again
		upload = await GoogleAI.files.get({ name: upload.name! })
	}

	// media upload failed
	if (upload.state === FileState.FAILED) throw new Error('Google server processing failed.')
	msg.header += `- *Processing complete: ${upload.state}*\n`

	return upload // return the file info
}

function createInterval(callBack: Func, args: any[], msg: AIMsg) {
	return setInterval(
		async () => await callBack(...args, msg.header + msg.text.trim()),
		randomTime(),
	)
}
