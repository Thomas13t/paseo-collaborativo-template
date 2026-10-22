import type { PluginClientContext, PluginButtonRegistration } from '@getpaseo/plugin/client';
import { InvitePanel } from './client/invite';
import { workspaceInvitationContext } from './shared/invitations';

export default function contribute(client: PluginClientContext) {
  const removePanel = client.addWorkspacePanel({ id: 'invite', title: 'Invita al progetto', icon: 'UserPlus', context: 'workspace', locations: ['workspace', 'explorer'], Component: InvitePanel });
  const removeCommand = client.addCommandCenterItem({ id: 'invite', title: 'Invita una persona al progetto', icon: 'UserPlus', context: 'workspace', onSelect: ({ openPanel }) => openPanel('invite') });
  const lifetime = new AbortController();
  let releaseSubscription: (() => void) | undefined;
  const buttons = new Map<string, PluginButtonRegistration>();
  const generations = new Map<string, number>();
  const remove = (id: string) => {
    generations.set(id, (generations.get(id) || 0) + 1);
    buttons.get(id)?.remove(); buttons.delete(id);
  };
  async function update(id: string) {
    const generation = (generations.get(id) || 0) + 1;
    generations.set(id, generation);
    try {
      const context = await client.rpc(workspaceInvitationContext, { workspaceId: id });
      if (lifetime.signal.aborted || generations.get(id) !== generation) return;
      if (!context.eligible) { remove(id); return; }
      if (!buttons.has(id)) buttons.set(id, client.addHeaderButton({
        id: 'invite', workspaceId: id,
        button: { title: 'Invita al progetto', icon: 'UserPlus', label: 'Invita', behavior: { kind: 'action', onPress: () => client.openPanel('invite', { workspaceId: id }) } },
      }));
    } catch (error) {
      if (!lifetime.signal.aborted && generations.get(id) === generation) {
        remove(id);
        console.error('Impossibile riconoscere il progetto collaborativo:', error);
      }
    }
  }
  // Owned subscription follows existing/new workspaces and reconnects; no polling.
  void client.paseo.workspaces.list({ subscribe: {} }).then(({ subscription }) => {
    if (lifetime.signal.aborted) { void subscription.release(); return; }
    releaseSubscription = () => { void subscription.release(); };
    subscription.subscribe({
      snapshot: ({ entries }) => {
        for (const id of generations.keys()) remove(id);
        for (const workspace of entries) void update(workspace.id);
      },
      update: (message) => {
        if (message.type !== 'workspace_update') return;
        const event = message.payload;
        if (event.kind === 'upsert') void update(event.workspace.id);
        else remove(event.id);
      },
    });
  }).catch(error => { if (!lifetime.signal.aborted) console.error('Osservazione workspace fallita:', error); });
  return () => {
    lifetime.abort(); releaseSubscription?.();
    for (const button of buttons.values()) button.remove();
    buttons.clear(); generations.clear(); removeCommand(); removePanel();
  };
}
