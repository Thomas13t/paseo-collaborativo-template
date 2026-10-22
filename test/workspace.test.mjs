import test from 'node:test';
import assert from 'node:assert/strict';
import { workspaceContext } from '../integrations/paseo-collaborativo/server/workspace.mjs';
const paseo = { workspaces: { ref(id) {
  assert.equal(id, 'wks_example');
  return { directory: '/trusted/project', name: 'Workspace', refresh: async () => {}, current: () => ({ projectDisplayName: 'Alfredo Tour' }) };
} } };
test('repository comes from selected daemon workspace, never client input', async () => {
  const paths = [];
  const result = await workspaceContext(paseo, 'wks_example', { read: async path => { paths.push(path); return ''; }, runner: async (command, args, options) => {
    assert.equal(command, 'git'); assert.deepEqual(args, ['remote', 'get-url', 'origin']); assert.equal(options.cwd, '/trusted/project');
    return 'git@github.com:Thomas13t/alfredo-tour-agente-ai.git';
  } });
  assert.deepEqual(result, { eligible: true, project: 'Alfredo Tour', repo: 'Thomas13t/alfredo-tour-agente-ai', reason: '' });
  assert.deepEqual(paths, ['/trusted/project/INIZIA-QUI.md', '/trusted/project/scripts/collab.mjs']);
});
test('ordinary projects do not get a collaborative header button', async () => {
  const result = await workspaceContext(paseo, 'wks_example', { read: async () => { throw Object.assign(new Error('missing'), { code: 'ENOENT' }); }, runner: () => { assert.fail('no Git command needed'); } });
  assert.equal(result.eligible, false);
});
test('missing workspace and unreadable files fail closed', async () => {
  await assert.rejects(workspaceContext({ workspaces: { ref: () => ({ refresh: async () => {}, directory: null }) } }, 'missing'), /non disponibile/);
  await assert.rejects(workspaceContext(paseo, 'wks_example', { read: async () => { throw Object.assign(new Error('denied'), { code: 'EACCES' }); } }), /denied/);
});
test('GitHub origin is validated and refreshed on each request', async () => {
  const read = async () => '';
  await assert.rejects(workspaceContext(paseo, 'wks_example', { read, runner: async () => 'https://elsewhere.invalid/owner/repo' }));
  const result = await workspaceContext(paseo, 'wks_example', { read, runner: async () => 'https://github.com/other/project.git' });
  assert.equal(result.repo, 'other/project');
});
