import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setup, register, createProject, configureGitHub } from '../lib/project.mjs';

async function temporary(t) { const root = await mkdtemp(join(tmpdir(), 'collab-test-')); t.after(() => rm(root, { recursive: true, force: true })); return root; }
function fake(root, { existing = true } = {}) {
  const calls = []; let created = existing;
  const runner = async (command, args) => {
    calls.push([command, ...args]);
    if (command === 'git' && args[0] === 'remote') return 'https://github.com/owner/project.git\n';
    if (command === 'gh' && args[0] === 'api') return JSON.stringify({ id: 1, permissions: { admin: true }, default_branch: 'main' });
    if (args[0] === 'project' && args[1] === 'ls') return JSON.stringify(created ? [{ projectId: 'p1', path: root, name: 'User name' }] : []);
    if (args[0] === 'project' && args[1] === 'create') { created = true; return '{}'; }
    if (args[0] === 'workspace' && args[1] === 'ls') return JSON.stringify(existing ? [{ workspaceId: 'w1', cwd: root }] : []);
    if (args[0] === 'workspace' && args[1] === 'create') return JSON.stringify({ workspaceId: 'w2', cwd: root });
    return '';
  };
  return { calls, runner };
}

test('check-only writes no files and does not register or change GitHub', async t => {
  const root = await temporary(t); const m = fake(root);
  assert.equal((await setup(root, { checkOnly: true }, m.runner)).ok, true);
  await assert.rejects(access(join(root, '.paseo-local.json')));
  assert.equal(m.calls.some(c => c.includes('create') || c.includes('PATCH')), false);
});

test('setup is repeatable and preserves an existing project name and workspace', async t => {
  const root = await temporary(t); const m = fake(root);
  for (let n = 0; n < 2; n++) assert.equal((await setup(root, { registerProject: true }, m.runner)).local.workspaceId, 'w1');
  assert.equal(m.calls.some(c => c.includes('create') || c.includes('rename')), false);
  assert.equal(JSON.parse(await readFile(join(root, '.paseo-local.json'), 'utf8')).repo, 'owner/project');
});

test('registration creates only a missing project and workspace', async t => {
  const root = await temporary(t); const m = fake(root, { existing: false });
  assert.equal((await register(root, 'project', m.runner)).workspaceId, 'w2');
  assert.equal(m.calls.filter(c => c[1] === 'project' && c[2] === 'create').length, 1);
  assert.equal(m.calls.filter(c => c[1] === 'workspace' && c[2] === 'create').length, 1);
});

test('existing local destination is never overwritten and no remote is created', async t => {
  const root = await temporary(t); const m = fake(root);
  await assert.rejects(createProject('owner/new', root, {}, m.runner), /destinazione esiste/);
  assert.equal(m.calls.length, 0);
});

test('a partial new-project failure retains the remote and reports how to recover', async t => {
  const root = await temporary(t); const calls = [];
  const runner = async (command, args) => {
    calls.push([command, ...args]);
    if (args[1] === 'clone') throw new Error('network unavailable');
    return '';
  };
  await assert.rejects(createProject('owner/new', join(root, 'new'), {}, runner), /creato e conservato/);
  assert.equal(calls[0][2], 'create');
  assert.equal(calls.some(c => c.includes('delete')), false);
});

test('GitHub configuration is explicit and refuses non-admin accounts', async () => {
  const calls = [];
  const runner = async (_cmd, args) => { calls.push(args); return JSON.stringify({ permissions: { admin: false } }); };
  await assert.rejects(configureGitHub('owner/project', {}, runner), /amministratore/);
  assert.equal(calls.length, 1);
});

test('GitHub plan restriction is reported, not disguised as enabled protection', async () => {
  const runner = async (_cmd, args) => {
    if (args[1].includes('/protection')) { const e = new Error('requires upgraded plan'); e.status = 403; throw e; }
    return JSON.stringify({ permissions: { admin: true }, default_branch: 'main' });
  };
  const result = await configureGitHub('owner/project', { protectMain: true }, runner);
  assert.match(result.protection, /^unavailable:/);
});

test('missing prerequisite makes setup fail without registering or writing local state', async t => {
  const root = await temporary(t); const m = fake(root);
  const runner = async (command, args, options) => { if (command === 'gh' && args[0] === 'auth') throw new Error('not logged in'); return m.runner(command, args, options); };
  assert.equal((await setup(root, { registerProject: true }, runner)).ok, false);
  assert.equal(m.calls.some(c => c.includes('create')), false);
  await assert.rejects(access(join(root, '.paseo-local.json')));
});

test('setup reports missing invitation plugin without installing or blocking collaboration', async t => {
  const root = await temporary(t); const m = fake(root);
  const runner = async (command, args) => args[0] === 'plugin' ? '[]' : m.runner(command, args);
  const result = await setup(root, { checkOnly: true }, runner);
  assert.equal(result.ok, true);
  assert.equal(result.invitationPlugin.status, 'not-installed');
  assert.match(result.invitationPlugin.message, /una sola volta/);
  assert.equal(result.invitationPlugin.command, 'node scripts/collab.mjs plugin-install');
  await assert.rejects(access(join(root, '.paseo-local.json')));
});

test('setup detects ready, disabled and unavailable plugin catalogs without mutation', async t => {
  const root = await temporary(t); const m = fake(root);
  for (const [catalog, expected] of [
    [[{ id: 'paseo-collaborativo', status: 'running', enabled: true }], 'ready'],
    [[{ id: 'paseo-collaborativo', status: 'disabled', enabled: false }], 'needs-attention'],
    [null, 'unknown'],
  ]) {
    const runner = async (command, args) => {
      if (args[0] === 'plugin') {
        assert.deepEqual(args, ['plugin', 'ls', '--json']);
        if (catalog === null) throw new Error('daemon offline');
        return JSON.stringify(catalog);
      }
      return m.runner(command, args);
    };
    const result = await setup(root, { checkOnly: true }, runner);
    assert.equal(result.invitationPlugin.status, expected);
    assert.equal(result.ok, true);
  }
});
