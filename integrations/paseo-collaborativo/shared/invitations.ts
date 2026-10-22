import { defineRpc } from '@getpaseo/plugin';
import { z } from 'zod';
export const workspaceInvitationContext = defineRpc({
  name: 'collaboration.workspace.context',
  input: z.object({ workspaceId: z.string().regex(/^wks_[a-f0-9]{16}$/) }),
  output: z.object({ eligible: z.boolean(), project: z.string(), repo: z.string(), reason: z.string() }),
});
export const prepareInvitation = defineRpc({
  name: 'collaboration.invite.prepare',
  input: z.object({ workspaceId: z.string().regex(/^wks_[a-f0-9]{16}$/), recipient: z.string().trim().min(1).max(254) }),
  output: z.object({ ticket: z.string().uuid(), repo: z.string(), login: z.string(), name: z.string(), actor: z.string(), permission: z.literal('Scrittura'), onboardingUrl: z.string(), resolvedFromEmail: z.boolean() }),
});
export const sendResult = z.object({ status: z.enum(['invited', 'access-granted', 'already-member', 'pending']), message: z.string(), onboardingUrl: z.string() });
export const sendInvitation = defineRpc({
  name: 'collaboration.invite.send',
  input: z.object({ ticket: z.string().uuid() }),
  output: sendResult,
});
