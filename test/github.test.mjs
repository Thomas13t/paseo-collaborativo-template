import test from 'node:test';
import assert from 'node:assert/strict';
import { repoFromRemote, validateRepo, normalizeRecipient, resolveRecipient, prepareInvite, sendInvite } from '../integrations/paseo-collaborativo/server/github.mjs';
import { createTicketStore } from '../integrations/paseo-collaborativo/server/tickets.mjs';

const info = { id: 123, full_name: 'owner/project', default_branch: 'main', is_template: false, permissions: { admin: true } };
const plan = { repo: 'owner/project', repoId: 123, actor: 'owner', login: 'max', permission: 'push', onboardingUrl: 'https://github.com/owner/project/blob/main/INIZIA-QUI.md' };
function mock(routes = {}) {
  const calls = [];
  const runner = async (command, args) => {
    assert.equal(command, 'gh'); assert.equal(args[0], 'api');
    calls.push(args);
    const path = args[1];
    const route = routes[path] ?? (path === 'user' ? { login: 'owner' } : path === 'repos/owner/project' ? info : undefined);
    if (route instanceof Error) throw route;
    if (route === undefined) throw new Error(`Unexpected request: ${path}`);
    return JSON.stringify(route);
  };
  return { runner, calls };
}
function status(code) { const e = new Error(`HTTP ${code}`); e.status = code; return e; }
const writes = calls => calls.filter(args => args[args.indexOf('--method') + 1] !== 'GET');

test('origin parser accepts GitHub SSH and HTTPS and refuses embedded secrets or injection', () => {
  assert.equal(repoFromRemote('git@github.com:owner/project.git'), 'owner/project');
  assert.equal(repoFromRemote('https://github.com/owner/project.git'), 'owner/project');
  for (const input of ['https://token@github.com/owner/project', 'https://github.com.evil.test/owner/project', 'file:///tmp/repo', 'https://github.com/owner/project?token=x']) assert.throws(() => repoFromRemote(input));
  for (const input of ['owner/project;touch x', '--help', 'owner/../project', 'owner/..']) assert.throws(() => validateRepo(input));
});

test('preview is read-only and identifies the repository, actor and user', async () => {
  const m = mock({ 'users/max': { login: 'max', type: 'User', name: 'Max' } });
  const preview = await prepareInvite('owner/project', 'max', m.runner);
  assert.equal(preview.login, 'max'); assert.equal(preview.repoId, 123); assert.equal(preview.actor, 'owner');
  assert.equal(writes(m.calls).length, 0);
});

test('email resolution requires a unique exact public email', async () => {
  const m = mock({ 'search/users': { total_count: 1, items: [{ login: 'max' }] }, 'users/max': { login: 'max', type: 'User', email: 'max@example.test' } });
  assert.equal((await resolveRecipient('MAX@example.test', m.runner)).login, 'max');
  assert.equal(writes(m.calls).length, 0);
  for (const result of [{ total_count: 0, items: [] }, { total_count: 2, items: [{ login: 'max' }, { login: 'other' }] }, { total_count: 1, incomplete_results: true, items: [{ login: 'max' }] }]) {
    const n = mock({ 'search/users': result }); await assert.rejects(resolveRecipient('max@example.test', n.runner));
  }
  const hidden = mock({ 'search/users': { total_count: 1, items: [{ login: 'max' }] }, 'users/max': { login: 'max', type: 'User', email: null } });
  await assert.rejects(resolveRecipient('max@example.test', hidden.runner), /username/);
});

test('template and non-admin repositories cannot prepare invitations', async () => {
  for (const repo of [{ ...info, is_template: true }, { ...info, permissions: { admin: false } }]) {
    const m = mock({ 'repos/owner/project': repo });
    await assert.rejects(prepareInvite('owner/project', 'max', m.runner)); assert.equal(writes(m.calls).length, 0);
  }
});

test('sending checks account and repository identity again', async () => {
  for (const routes of [{ user: { login: 'different' } }, { 'repos/owner/project': { ...info, id: 999 } }, { 'repos/owner/project': { ...info, permissions: { admin: false } } }]) {
    const m = mock(routes); await assert.rejects(sendInvite(plan, m.runner)); assert.equal(writes(m.calls).length, 0);
  }
});

test('existing collaborator access is never changed or downgraded', async () => {
  const m = mock({ 'repos/owner/project/collaborators/max/permission': { permission: 'admin' } });
  assert.equal((await sendInvite(plan, m.runner)).status, 'already-member'); assert.equal(writes(m.calls).length, 0);
});

test('403 checking collaborator is not treated as absence', async () => {
  const m = mock({ 'repos/owner/project/collaborators/max/permission': status(403) });
  await assert.rejects(sendInvite(plan, m.runner)); assert.equal(writes(m.calls).length, 0);
});

test('pending invitation is not resent', async () => {
  const m = mock({ 'repos/owner/project/collaborators/max/permission': status(404), 'repos/owner/project/invitations': [[{ invitee: { login: 'MAX' } }]] });
  assert.equal((await sendInvite(plan, m.runner)).status, 'pending'); assert.equal(writes(m.calls).length, 0);
});

test('confirmed invitation uses PUT and write permission only; none and 404 both mean no access', async () => {
  for (const access of [{ permission: 'none' }, status(404)]) {
    const m = mock({ 'repos/owner/project/collaborators/max/permission': access, 'repos/owner/project/invitations': [[]], 'repos/owner/project/collaborators/max': { id: 456 } });
    assert.equal((await sendInvite(plan, m.runner)).status, 'invited');
    assert.equal(writes(m.calls).length, 1);
    const write = writes(m.calls)[0]; assert.equal(write[1], 'repos/owner/project/collaborators/max'); assert.ok(write.includes('push') || write.includes('permission=push')); assert.ok(!write.includes('permission=admin'));
  }
});

test('preview tickets expire, are consumed once, and clear on plugin shutdown', () => {
  let clock = 0; const store = createTicketStore({ now: () => clock, ttl: 10 });
  const id = store.issue(plan); assert.equal(store.consume(id), plan); assert.throws(() => store.consume(id));
  const expired = store.issue(plan); clock = 11; assert.throws(() => store.consume(expired));
  const cleared = store.issue(plan); store.clear(); assert.throws(() => store.consume(cleared));
});


test('recipient accepts username, @username and direct GitHub profile links', async () => {
  const m = mock({ 'users/b1162': { login: 'b1162', type: 'User', name: null } });
  for (const value of ['b1162', '@b1162', 'https://github.com/b1162', 'https://github.com/b1162/', ' github.com/b1162 ']) {
    assert.equal(normalizeRecipient(value), 'b1162');
    assert.equal((await resolveRecipient(value, m.runner)).login, 'b1162');
  }
  assert.equal(writes(m.calls).length, 0);
});

test('recipient refuses repository links, external hosts and embedded credentials before lookup', async () => {
  const m = mock();
  for (const value of ['https://github.com/b1162/repo', 'https://github.com.evil.test/b1162', 'https://secret@github.com/b1162', 'https://github.com/b1162?token=secret', 'https://github.com/b1162#fragment', 'http://github.com/b1162', 'https://github.com/bad--name', 'https://github.com/b1162/../other/repo']) {
    await assert.rejects(resolveRecipient(value, m.runner));
  }
  assert.equal(m.calls.length, 0);
});
