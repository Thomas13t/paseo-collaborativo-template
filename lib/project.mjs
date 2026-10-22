import { existsSync } from 'node:fs';
import { readFile, writeFile, realpath } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { homedir } from 'node:os';
import { run, api, validateRepo, repoFromRemote, TEMPLATE } from '../integrations/paseo-collaborativo/server/github.mjs';

export function paseoBinary() {
  if (process.env.PASEO_BIN) return process.env.PASEO_BIN;
  const mac = '/Applications/Paseo.app/Contents/Resources/bin/paseo';
  return process.platform === 'darwin' && existsSync(mac) ? mac : 'paseo';
}

export async function projectRepo(root, runner = run) {
  const origin = await runner('git', ['remote', 'get-url', 'origin'], { cwd: root });
  return repoFromRemote(origin);
}

export async function doctor(root, runner = run) {
  const checks = [];
  checks.push({ name: 'Node.js >= 20', ok: Number(process.versions.node.split('.')[0]) >= 20 });
  for (const [name, command, args] of [
    ['Git', 'git', ['--version']], ['GitHub CLI', 'gh', ['--version']],
    ['Login GitHub', 'gh', ['auth', 'status']], ['Paseo', paseoBinary(), ['--version']],
  ]) {
    try { await runner(command, args, { cwd: root }); checks.push({ name, ok: true }); }
    catch (error) { checks.push({ name, ok: false, detail: error.message }); }
  }
  let repo = null;
  try {
    repo = await projectRepo(root, runner);
    await api(`repos/${repo}`, {}, runner);
    checks.push({ name: 'Accesso al repository', ok: true });
  } catch (error) { checks.push({ name: 'Accesso al repository', ok: false, detail: error.message }); }
  return { ok: checks.every(x => x.ok), repo, checks };
}

export async function register(root, name, runner = run) {
  const cwd = await realpath(root);
  const canonical = async path => realpath(path).catch(() => resolve(path));
  const atCwd = async (items, field) => {
    for (const item of items) if (typeof item[field] === 'string' && await canonical(item[field]) === cwd) return item;
    return undefined;
  };
  const paseo = paseoBinary();
  const projects = JSON.parse(await runner(paseo, ['project', 'ls', '--json']));
  let project = await atCwd(projects, 'path');
  if (!project) {
    await runner(paseo, ['project', 'create', cwd, '--json'], { timeout: 60_000 });
    project = await atCwd(JSON.parse(await runner(paseo, ['project', 'ls', '--json'])), 'path');
  }
  if (!project) throw new Error('Paseo non ha restituito il progetto appena registrato.');
  // Preserve names configured by the user on existing projects.
  if (!projects.some(p => p.projectId === project.projectId)) {
    await runner(paseo, ['project', 'rename', project.projectId, name, '--json']);
  }
  const workspaces = JSON.parse(await runner(paseo, ['workspace', 'ls', '--json']));
  let workspace = await atCwd(workspaces, 'cwd');
  if (!workspace) {
    workspace = JSON.parse(await runner(paseo, ['workspace', 'create', '--isolation', 'local', '--path', cwd,
      '--project', project.projectId, '--title', 'Lavoro condiviso', '--json']));
  }
  return { projectId: project.projectId, workspaceId: workspace.workspaceId };
}

export async function setup(root, { registerProject = false, checkOnly = false } = {}, runner = run) {
  const status = await doctor(root, runner);
  if (!status.ok) return status;
  if (checkOnly) return status;
  const local = { repo: status.repo, preparedAt: new Date().toISOString(), node: process.versions.node };
  if (registerProject) Object.assign(local, await register(root, status.repo.split('/')[1], runner));
  await writeFile(join(root, '.paseo-local.json'), JSON.stringify(local, null, 2) + '\n', { mode: 0o600 });
  return { ...status, local, instructions: 'Leggi AGENTS.md e docs/progetto.md prima di lavorare.' };
}

export async function cloneAndSetup(repo, destination, runner = run) {
  validateRepo(repo);
  const root = resolve(destination);
  // Refuse any pre-existing destination; never overwrite another working copy.
  if (existsSync(root)) throw new Error('La destinazione esiste già. Usa setup nella copia esistente oppure scegli un’altra cartella.');
  await runner('gh', ['repo', 'clone', repo, root], { timeout: 120_000 });
  return { root, ...(await setup(root, { registerProject: true }, runner)) };
}

export async function configureGitHub(repo, { protectMain = false } = {}, runner = run) {
  validateRepo(repo);
  const info = await api(`repos/${repo}`, {}, runner);
  if (!info.permissions?.admin) throw new Error('Solo un amministratore può configurare il repository.');
  await api(`repos/${repo}`, { method: 'PATCH', fields: {
    has_issues: true, allow_squash_merge: true, allow_merge_commit: false,
    allow_rebase_merge: false, delete_branch_on_merge: true,
  } }, runner);
  let protection = 'not-requested';
  if (protectMain) {
    const branch = encodeURIComponent(info.default_branch || 'main');
    const body = JSON.stringify({ required_status_checks: null, enforce_admins: true,
      required_pull_request_reviews: { required_approving_review_count: 1, dismiss_stale_reviews: true },
      restrictions: null, allow_force_pushes: false, allow_deletions: false });
    // gh --input accepts a file; a temporary file avoids shell interpolation and stdin surprises.
    const { mkdtemp, rm } = await import('node:fs/promises');
    const { tmpdir } = await import('node:os');
    const temp = await mkdtemp(join(tmpdir(), 'paseo-protection-'));
    try {
      const path = join(temp, 'protection.json'); await writeFile(path, body, { mode: 0o600 });
      await runner('gh', ['api', `repos/${repo}/branches/${branch}/protection`, '--method', 'PUT', '--input', path]);
      protection = 'enabled';
    } catch (error) {
      if (error.status !== 403 && error.status !== 422) throw error;
      protection = `unavailable: ${error.message}`;
    } finally { await rm(temp, { recursive: true, force: true }); }
  }
  return { repo, protection, configured: ['issues', 'squash-merge', 'delete-merged-branches'] };
}

export async function createProject(repo, destination, { template = TEMPLATE, protectMain = false } = {}, runner = run) {
  validateRepo(repo); validateRepo(template);
  if (repo.toLowerCase() === template.toLowerCase()) throw new Error('Il nuovo progetto deve essere distinto dal template.');
  if (existsSync(resolve(destination))) throw new Error('La destinazione esiste già.');
  await runner('gh', ['repo', 'create', repo, '--template', template, '--private'], { timeout: 120_000 });
  // If a later stage fails, retain the new remote repository and report it. Never delete user work.
  try {
    const clone = await cloneAndSetup(repo, destination, runner);
    const github = await configureGitHub(repo, { protectMain }, runner);
    return { ...clone, github };
  } catch (error) {
    throw new Error(`Repository https://github.com/${repo} creato e conservato. Preparazione da completare: ${error.message}`);
  }
}

export async function installPlugin(root, runner = run) {
  const paseoHome = process.env.PASEO_HOME || join(homedir(), '.paseo');
  let config = {};
  try { config = JSON.parse(await readFile(join(paseoHome, 'config.json'), 'utf8')); } catch { /* disabled by default */ }
  if (config.pluginsEnabled !== true) {
    throw new Error('Plugin Paseo disabilitati. L’utente deve autorizzare esplicitamente l’attivazione: codice locale non sandboxato con accesso a file, processi, credenziali e rete. Questa procedura non modifica il consenso.');
  }
  const directory = join(root, 'integrations', 'paseo-collaborativo');
  await runner('npm', ['ci', '--ignore-scripts'], { cwd: directory, timeout: 120_000 });
  await runner('npm', ['run', 'typecheck'], { cwd: directory });
  return JSON.parse(await runner(paseoBinary(), ['plugin', 'install', directory, '--json'], { timeout: 120_000 }));
}
