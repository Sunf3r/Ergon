type str = string
type num = number
type bool = boolean

function print(...args): void

interface String {
	encode(): str
	toPascalCase(): str
	align(limit: num, endPosition?: boolean): str
	t(lang: str): str
	filterForRegex(): str
}

interface Number {
	bytes(onlyNumbers?: bool): string | number
}

interface Reminder {
	id: num
	author: str
	chat: str
	msg: str
	remindAt: str
}

interface aiResponse {
	model: str
	reason: str
	text: str
	inputSize: number
	tokens: number
}
