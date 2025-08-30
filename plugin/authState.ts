import baileys, {
	type AuthenticationCreds,
	type AuthenticationState,
	BufferJSON,
	type SignalDataTypeMap,
} from 'baileys'
import type { PrismaPromise } from '@prisma/client'
import prisma from './prisma.js'

/** PostgreSQL auth strategy
 * it is used if you setted 'DATABASE_URL' env var
 * if you don't have a DB, file system auth storing
 * will be used instead
 */

const { initAuthCreds, proto } = baileys

const toStorableJson = (value: unknown) => JSON.parse(JSON.stringify(value, BufferJSON.replacer))

const fromStorableJson = <T = any>(value: unknown | null): T | null => {
	if (value == null) return null
	return JSON.parse(JSON.stringify(value), BufferJSON.reviver) as T
}

const postgresAuthState = async (
	folder: string,
): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> => {
	const sessionId = folder

	const writeCreds = async (data: any) => {
		const json = toStorableJson(data)
		await prisma.baileysAuthCreds.upsert({
			where: { sessionId },
			create: { sessionId, data: json },
			update: { data: json },
		})
	}

	const readCreds = async () => {
		const row = await prisma.baileysAuthCreds.findUnique({ where: { sessionId } })
		return fromStorableJson<AuthenticationCreds>(row?.data)
	}

	const creds: AuthenticationCreds = (await readCreds()) || initAuthCreds()

	return {
		state: {
			creds,
			keys: {
				get: async (type, ids) => {
					if (!ids.length) return {} as any
					const rows = await prisma.baileysAuthKey.findMany({
						where: {
							sessionId,
							category: type as unknown as string,
							keyId: { in: ids },
						},
					})

					const out: { [_: string]: SignalDataTypeMap[typeof type] } = {}
					const map = new Map(rows.map((r) => [r.keyId, r.data]))
					for (const id of ids) {
						let value =
							fromStorableJson<SignalDataTypeMap[typeof type]>(map.get(id) ?? null) ??
								undefined
						if (type === 'app-state-sync-key' && value) {
							value = proto.Message.AppStateSyncKeyData.fromObject(
								value as any,
							) as any
						}
						out[id] = value as any
					}
					return out
				},
				set: async (data) => {
					const ops: PrismaPromise<any>[] = []

					for (const category in data) {
						const byId = (data as any)[category] as Record<string, any>
						for (const keyId in byId) {
							const value = byId[keyId]
							if (value) {
								const json = toStorableJson(value)
								ops.push(
									prisma.baileysAuthKey.upsert({
										where: {
											sessionId_category_keyId: {
												sessionId,
												category,
												keyId,
											},
										},
										create: { sessionId, category, keyId, data: json },
										update: { data: json },
									}),
								)
							} else {
								// deleteMany não lança erro quando o registro não existe
								ops.push(
									prisma.baileysAuthKey.deleteMany({
										where: { sessionId, category, keyId },
									}),
								)
							}
						}
					}

					if (ops.length) {
						// Opcional: você pode fatiar em lotes se o número de operações for muito grande
						await prisma.$transaction(ops)
					}
				},
			},
		},
		saveCreds: async () => {
			await writeCreds(creds)
		},
	}
}

export default postgresAuthState
