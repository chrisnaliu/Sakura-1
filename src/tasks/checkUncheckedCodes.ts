import { PRIORITY, TASK_RESULT } from '#constants'
import { Task } from '#structures'
import { fetchInvite } from '#utils'

export class CheckUncheckedCodesTask extends Task {
	public async run() {
		const { invites, queue } = this.container
		const codes = await invites.read('unchecked')

		for (const { guildId, code } of codes) {
			const invite = await queue.add(fetchInvite(code), { priority: PRIORITY.CATEGORY })
            const expiresAt = invite?.expiresAt ?? null
            const isPermanent = !Boolean(expiresAt) && !Boolean(invite?.maxAge) && !Boolean(invite?.maxUses)
            const isValid = Boolean(invite)

            await invites.upsert(guildId, code, expiresAt, isPermanent, isValid)
        }
		
		return TASK_RESULT.REPEAT
	}
}