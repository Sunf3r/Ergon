import type { Message } from 'wa'
import User from 'class/user.ts'

interface CmdCtx {
	msg: Message
	args: str[]
	user: User
}
