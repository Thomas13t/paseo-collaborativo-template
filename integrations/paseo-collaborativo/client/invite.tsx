import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useRpc, useWorkspace, type PluginScreenProps, type PluginWorkspacePanelProps } from '@getpaseo/plugin/client';
import { useQuery } from '@tanstack/react-query';
import { prepareInvitation, sendInvitation, workspaceInvitationContext } from '../shared/invitations';

function readableError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/^Request failed:\s*/, '').replace(/\s+requestType=.*$/s, '');
}

type Preview = { ticket: string; repo: string; login: string; name: string; actor: string; permission: string; onboardingUrl: string; resolvedFromEmail: boolean };
type PluginTheme = PluginScreenProps['theme'];
function InviteForm({ theme, compact, workspaceId, workspaceName }: { theme: PluginTheme; compact: boolean; workspaceId?: string; workspaceName?: string }) {
  const getContext = useRpc(workspaceInvitationContext);
  const context = useQuery({ queryKey: ['invite-workspace', workspaceId], queryFn: () => getContext({ workspaceId: workspaceId! }), enabled: !!workspaceId, retry: false });
  const [recipient, setRecipient] = useState('');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [message, setMessage] = useState('');
  const [onboarding, setOnboarding] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const prepare = useRpc(prepareInvitation);
  const send = useRpc(sendInvitation);
  const c = theme.colors;
  const fieldStyle = { borderWidth: 1, borderColor: c.foregroundMuted, borderRadius: 8, padding: 12, color: c.foreground, backgroundColor: c.surface0 };
  const reset = () => { setPreview(null); setMessage(''); setError(''); setOnboarding(''); };
  async function prepareClick() {
    if (!workspaceId || !context.data?.eligible) return;
    setBusy(true); reset();
    try { setPreview(await prepare({ workspaceId, recipient: recipient.trim() })); }
    catch (e) { setError(readableError(e)); }
    finally { setBusy(false); }
  }
  async function sendClick() {
    if (!preview || busy) return;
    setBusy(true); setError('');
    const ticket = preview.ticket; setPreview(null);
    try { const result = await send({ ticket }); setMessage(result.message); setOnboarding(result.onboardingUrl); }
    catch (e) { setError(readableError(e)); }
    finally { setBusy(false); }
  }
  return <ScrollView contentContainerStyle={{ padding: compact ? 16 : 28, gap: 16, backgroundColor: c.surface0, flexGrow: 1 }}>
    <Text accessibilityRole="header" style={{ color: c.foreground, fontSize: 24, fontWeight: '600' }}>Lavora insieme</Text>
    <Text style={{ color: c.foregroundMuted }}>Invita un collaboratore al repository GitHub. Dopo l’accettazione troverà INIZIA-QUI.md per preparare il proprio Paseo.</Text>
    <View style={{ gap: 6 }}>
      <Text style={{ color: c.foreground, fontWeight: '600' }}>Progetto: {context.data?.project || workspaceName || 'workspace corrente'}</Text>
      <Text selectable style={{ color: c.foregroundMuted }}>{context.isPending ? 'Riconoscimento repository…' : context.data?.repo || context.data?.reason || context.error?.message || 'Apri Invita dal workspace del progetto.'}</Text>
    </View>
    <View style={{ gap: 6 }}>
      <Text style={{ color: c.foreground }}>Nome utente, link GitHub o email</Text>
      <TextInput accessibilityLabel="Nome utente, link GitHub o email" placeholder="b1162 oppure https://github.com/b1162" placeholderTextColor={c.foregroundMuted} autoCapitalize="none" autoCorrect={false} editable={!busy} value={recipient} onChangeText={v => { setRecipient(v); reset(); }} style={fieldStyle} />
      <Text style={{ color: c.foregroundMuted }}>Se l’email non è pubblica su GitHub, usa il nome utente. Nessun invito parte durante la ricerca.</Text>
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel="Prepara invito" disabled={busy || !recipient.trim() || !context.data?.eligible} onPress={prepareClick} style={{ padding: 14, borderRadius: 8, backgroundColor: c.accent, opacity: busy ? 0.5 : 1 }}>
      <Text style={{ color: c.accentForeground, textAlign: 'center', fontWeight: '600' }}>{busy ? 'Attendi…' : 'Prepara invito'}</Text>
    </Pressable>
    {preview && <View style={{ gap: 12, padding: 16, borderWidth: 1, borderColor: c.foregroundMuted, borderRadius: 10 }}>
      <Text style={{ color: c.foreground, fontWeight: '600' }}>Invita {preview.name} (@{preview.login})</Text>
      <Text style={{ color: c.foreground }}>Repository: {preview.repo}{'\n'}Accesso: {preview.permission}{'\n'}Invito da: {preview.actor}</Text>
      <Text style={{ color: c.foregroundMuted }}>GitHub gestisce la notifica all’account. L’email di consegna dipende dalle impostazioni del destinatario.</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`Invia invito a ${preview.login}`} disabled={busy} onPress={sendClick} style={{ backgroundColor: c.accent, padding: 14, borderRadius: 8 }}>
        <Text style={{ color: c.accentForeground, textAlign: 'center', fontWeight: '600' }}>Invia invito a @{preview.login}</Text>
      </Pressable>
    </View>}
    {!!message && <Text accessibilityRole="alert" selectable style={{ color: c.foreground }}>{message}</Text>}
    {!!onboarding && <View style={{ gap: 8 }}>
      <Text style={{ color: c.foreground }}>Istruzione da condividere dopo l’invito:</Text>
      <Text selectable style={{ color: c.foreground }}>Leggi questo file e segui la procedura per partecipare al progetto: {onboarding}</Text>
    </View>}
    {!!error && <Text accessibilityRole="alert" selectable style={{ color: c.foreground }}>{error}</Text>}
    <Text style={{ color: c.foregroundMuted }}>Alfa 0.1 · Accesso tramite il tuo login GitHub locale. Non vengono richieste chiavi API o password nel pannello.</Text>
  </ScrollView>;
}
export function InvitePanel({ theme, layout, workspaceId }: PluginWorkspacePanelProps) {
  const name = useWorkspace(workspaceId, workspace => workspace.name);
  return <InviteForm key={workspaceId} theme={theme} compact={layout.compact} workspaceId={workspaceId} workspaceName={name ?? undefined} />;
}
