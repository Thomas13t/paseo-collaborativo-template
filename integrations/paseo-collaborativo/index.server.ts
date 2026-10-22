import type { PluginServerContext } from '@getpaseo/plugin/server';
import { prepareInvitation, sendInvitation, sendResult, workspaceInvitationContext } from './shared/invitations';
import { prepareInvite, sendInvite } from './server/github.mjs';
import { createTicketStore } from './server/tickets.mjs';
import { workspaceContext } from './server/workspace.mjs';
export default function contribute(server: PluginServerContext) {
  const tickets = createTicketStore();
  server.handle(workspaceInvitationContext, ({ workspaceId }, { paseo }) => workspaceContext(paseo, workspaceId));
  server.handle(prepareInvitation, async (input, { paseo }) => {
    const context = await workspaceContext(paseo, input.workspaceId);
    if (!context.eligible) throw new Error(context.reason);
    const repo = context.repo;
    const plan = await prepareInvite(repo, input.recipient);
    return { ticket: tickets.issue(plan), repo: plan.repo, login: plan.login, name: plan.name, actor: plan.actor, permission: 'Scrittura' as const, onboardingUrl: plan.onboardingUrl, resolvedFromEmail: plan.resolvedFromEmail };
  });
  server.handle(sendInvitation, async ({ ticket }) => sendResult.parse(await sendInvite(tickets.consume(ticket))));
  return () => tickets.clear();
}
