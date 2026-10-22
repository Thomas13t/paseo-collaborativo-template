import { defineRpc } from '@getpaseo/plugin';
import { z } from 'zod';
export const prepareInvitation = defineRpc({
  name: 'collaboration.invite.prepare',
  input: z.object({ repo: z.string().max(140).optional(), workspaceId: z.string().regex(/^wks_[a-f0-9]{16}$/).optional(), recipient: z.string().trim().min(1).max(254) }),
  output: z.object({ ticket: z.string().uuid(), repo: z.string(), login: z.string(), name: z.string(), actor: z.string(), permission: z.literal('Scrittura'), onboardingUrl: z.string(), resolvedFromEmail: z.boolean() }),
});
export const sendResult = z.object({ status: z.enum(['invited', 'access-granted', 'already-member', 'pending']), message: z.string(), onboardingUrl: z.string() });
export const sendInvitation = defineRpc({
  name: 'collaboration.invite.send',
  input: z.object({ ticket: z.string().uuid() }),
  output: sendResult,
});
