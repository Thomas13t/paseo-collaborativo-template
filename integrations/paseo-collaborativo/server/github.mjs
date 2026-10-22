import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
export const TEMPLATE = 'Thomas13t/paseo-collaborativo-template';

export function validateRepo(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9_.-]{1,100}$/.test(value) || value.split('/')[1] === '..') {
    throw new Error('Repository richiesto nel formato proprietario/nome.');
  }
  return value;
}

export function repoFromRemote(remote) {
  const value = remote.trim();
  const ssh = /^git@github\.com:([^\s]+)$/.exec(value);
  if (ssh) return validateRepo(ssh[1].replace(/\.git$/, ''));
  let url;
  try { url = new URL(value); } catch { throw new Error('Origin non è un repository GitHub supportato.'); }
  if (url.protocol !== 'https:' || url.hostname !== 'github.com' || url.port || url.username || url.password || url.search || url.hash) {
    throw new Error('Usa un origin GitHub HTTPS senza credenziali incorporate oppure git@github.com.');
  }
  return validateRepo(url.pathname.replace(/^\//, '').replace(/\.git$/, ''));
}

export function validateUsername(value) {
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(value) || value.includes('--')) {
    throw new Error('Nome utente GitHub non valido.');
  }
  return value;
}

export async function run(command, args, options = {}) {
  try {
    const { stdout } = await exec(command, args, {
      cwd: options.cwd, timeout: options.timeout ?? 30_000,
      maxBuffer: 4 * 1024 * 1024, shell: false,
      env: { ...process.env, GH_PROMPT_DISABLED: '1', GIT_TERMINAL_PROMPT: '0' },
    });
    return stdout;
  } catch (cause) {
    const detail = String(cause.stderr || cause.message).slice(0, 1200)
      .replace(/(?:gh[pousr]_[A-Za-z0-9_]+|github_pat_[A-Za-z0-9_]+)/g, '[redatto]');
    const error = new Error(`${command}: ${detail}`);
    error.status = Number(/HTTP (\d{3})/.exec(detail)?.[1]) || null;
    error.code = cause.code;
    throw error;
  }
}

export async function api(path, { method = 'GET', fields = {}, paginate = false } = {}, runner = run) {
  const args = ['api', path, '--method', method, '-H', 'Accept: application/vnd.github+json'];
  if (paginate) args.push('--paginate', '--slurp');
  for (const [key, value] of Object.entries(fields)) {
    args.push(typeof value === 'string' ? '-f' : '-F', `${key}=${value}`);
  }
  const output = await runner('gh', args);
  return output.trim() ? JSON.parse(output) : null;
}

export async function resolveRecipient(recipient, runner = run) {
  const value = recipient.trim();
  if (!value.includes('@')) {
    const login = validateUsername(value);
    const account = await api(`users/${login}`, {}, runner);
    if (account.type !== 'User') throw new Error('Il destinatario deve essere un account personale GitHub.');
    return { login: account.login, name: account.name || account.login, resolvedFromEmail: false };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || value.length > 254) throw new Error('Email non valida.');
  const result = await api('search/users', { fields: { q: `${value} in:email`, per_page: 2 } }, runner);
  if (result.incomplete_results || result.total_count !== 1 || result.items?.length !== 1) {
    throw new Error('Email non associabile con certezza a un account pubblico. Inserisci lo username GitHub.');
  }
  const account = await api(`users/${validateUsername(result.items[0].login)}`, {}, runner);
  if (account.type !== 'User' || account.email?.toLowerCase() !== value.toLowerCase()) {
    throw new Error('GitHub non rende pubblica questa email. Inserisci lo username GitHub.');
  }
  return { login: account.login, name: account.name || account.login, resolvedFromEmail: true };
}

export async function prepareInvite(repo, recipient, runner = run) {
  validateRepo(repo);
  const info = await api(`repos/${repo}`, {}, runner);
  if (!info.permissions?.admin) throw new Error('Servono permessi amministratore sul repository per invitare collaboratori.');
  if (info.is_template) throw new Error('Questo è il template: crea prima un progetto indipendente e invita lì i collaboratori.');
  const [person, actor] = await Promise.all([
    resolveRecipient(recipient, runner), api('user', {}, runner),
  ]);
  return {
    repo: info.full_name, repoId: info.id, login: person.login, name: person.name,
    resolvedFromEmail: person.resolvedFromEmail, actor: actor.login,
    permission: 'push', onboardingUrl: `https://github.com/${info.full_name}/blob/${encodeURIComponent(info.default_branch || 'main')}/INIZIA-QUI.md`,
    repositoryUrl: `https://github.com/${info.full_name}`,
  };
}

export async function sendInvite(plan, runner = run) {
  validateRepo(plan.repo); validateUsername(plan.login);
  const actor = await api('user', {}, runner);
  if (actor.login !== plan.actor) throw new Error('Account GitHub cambiato: prepara nuovamente l’invito.');
  const info = await api(`repos/${plan.repo}`, {}, runner);
  if (info.id !== plan.repoId || !info.permissions?.admin || info.is_template) {
    throw new Error('Repository o autorizzazioni cambiati: prepara nuovamente l’invito.');
  }
  // Never alter or downgrade an existing collaborator's access.
  try {
    const access = await api(`repos/${plan.repo}/collaborators/${plan.login}/permission`, {}, runner);
    if (!access?.permission) throw new Error('Risposta GitHub sui permessi non riconosciuta.');
    if (access.permission !== 'none') {
      return { status: 'already-member', message: `${plan.login} ha già accesso. Permessi invariati.`, onboardingUrl: plan.onboardingUrl };
    }
  } catch (error) { if (error.status !== 404) throw error; }
  const pages = await api(`repos/${plan.repo}/invitations`, { paginate: true }, runner);
  const invitations = (pages || []).flat();
  if (invitations.some(item => item.invitee?.login?.toLowerCase() === plan.login.toLowerCase())) {
    return { status: 'pending', message: 'Esiste già un invito in attesa. Nessun nuovo invito inviato.', onboardingUrl: plan.onboardingUrl };
  }
  const invitation = await api(`repos/${plan.repo}/collaborators/${plan.login}`, {
    method: 'PUT', fields: { permission: 'push' },
  }, runner);
  return {
    status: invitation ? 'invited' : 'access-granted',
    message: invitation
      ? `Invito GitHub creato per ${plan.login}. GitHub gestisce la notifica e l’email associata all’account.`
      : `Accesso concesso a ${plan.login}; GitHub non ha richiesto l’accettazione di un invito.`,
    onboardingUrl: plan.onboardingUrl,
  };
}
