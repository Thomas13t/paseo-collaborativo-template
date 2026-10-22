import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { repoFromRemote, run } from './github.mjs';

// Resolve only daemon-owned workspace paths, never a path supplied by the UI.
export async function workspaceContext(paseo, workspaceId, { read = readFile, runner = run } = {}) {
  const workspace = paseo.workspaces.ref(workspaceId);
  await workspace.refresh();
  if (!workspace.directory) throw new Error('Workspace non disponibile.');
  const project = workspace.current()?.projectDisplayName || workspace.name || 'Progetto corrente';
  try {
    await read(join(workspace.directory, 'INIZIA-QUI.md'), 'utf8');
    await read(join(workspace.directory, 'scripts/collab.mjs'), 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return { eligible: false, project, repo: '', reason: 'Questo progetto non contiene il setup collaborativo.' };
    throw error;
  }
  const repo = repoFromRemote(await runner('git', ['remote', 'get-url', 'origin'], { cwd: workspace.directory }));
  return { eligible: true, project, repo, reason: '' };
}
