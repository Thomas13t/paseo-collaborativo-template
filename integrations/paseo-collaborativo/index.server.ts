import type { PluginServerContext } from '@getpaseo/plugin/server';
import { prepareInvitation, sendInvitation, sendResult } from './shared/invitations';
import { prepareInvite, sendInvite, run, repoFromRemote } from './server/github.mjs';
import { createTicketStore } from './server/tickets.mjs';
export default function contribute(server: PluginServerContext) {
  const tickets = createTicketStore();
  server.handle(prepareInvitation, async (input, { paseo }) => {
    let repo = input.repo?.trim();
    if (input.workspaceId) {
      const workspace = paseo.workspaces.ref(input.workspaceId);
      await workspace.refresh();
      if (!workspace.directory) throw new Error('Workspace non disponibile.');
      repo = repoFromRemote(await run('git', ['remote', 'get-url', 'origin'], { cwd: workspace.directory }));
    }
    if (!repo) throw new Error('Scegli il repository proprietario/nome.');
    const plan = await prepareInvite(repo, input.recipient);
    return { ticket: tickets.issue(plan), repo: plan.repo, login: plan.login, name: plan.name, actor: plan.actor, permission: 'Scrittura' as const, onboardingUrl: plan.onboardingUrl, resolvedFromEmail: plan.resolvedFromEmail };
  });
  server.handle(sendInvitation, async ({ ticket }) => sendResult.parse(await sendInvite(tickets.consume(ticket))));
  return () => tickets.clear();
}
