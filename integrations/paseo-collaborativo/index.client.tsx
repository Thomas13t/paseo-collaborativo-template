import type { PluginClientContext, PluginSidebarItemProps } from '@getpaseo/plugin/client';
import { SidebarRow } from '@getpaseo/plugin/client/ui';
import { InvitePanel, InviteScreen } from './client/invite';
function InviteItem({ openScreen, currentScreen }: PluginSidebarItemProps) {
  return <SidebarRow icon="UserPlus" active={currentScreen?.screenId === 'invite'} onPress={() => openScreen({ screenId: 'invite' })} />;
}
export default function contribute(client: PluginClientContext) {
  const removePanel = client.addWorkspacePanel({ id: 'invite', title: 'Invita al progetto', icon: 'UserPlus', context: 'workspace', Component: InvitePanel });
  const removeCommand = client.addCommandCenterItem({ id: 'invite', title: 'Invita una persona al progetto', icon: 'UserPlus', context: 'workspace', onSelect: ({ openPanel }) => openPanel('invite') });
  const removeScreen = client.addScreen({ id: 'invite', title: 'Invita al progetto', Component: InviteScreen });
  const removeSidebar = client.addSidebarHeaderItem({ id: 'invite', title: 'Invita al progetto', Component: InviteItem });
  return () => { removeSidebar(); removeScreen(); removeCommand(); removePanel(); };
}
