#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { doctor, setup, cloneAndSetup, createProject, configureGitHub, projectRepo, installPlugin } from '../lib/project.mjs';
import { run, prepareInvite, sendInvite } from '../integrations/paseo-collaborativo/server/github.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [command = 'help', ...args] = process.argv.slice(2);
const values = {};
const flags = new Set(['register', 'check-only', 'confirm', 'protect-main']);
const allowed = new Set([...flags, 'repo', 'dest', 'template', 'recipient']);
try {
  for (let i = 0; i < args.length; i++) {
    const key = args[i].replace(/^--/, '');
    if (!args[i].startsWith('--') || !allowed.has(key) || key in values) throw new Error(`Opzione non valida: ${args[i]}`);
    if (flags.has(key)) values[key] = true;
    else {
      if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Manca il valore di --${key}`);
      values[key] = args[++i];
    }
  }
  let result;
  const repo = async () => values.repo || projectRepo(root);
  switch (command) {
    case 'doctor': result = await doctor(root); break;
    case 'setup': result = await setup(root, { registerProject: !!values.register, checkOnly: !!values['check-only'] }); break;
    case 'new':
      if (!values.repo || !values.dest) throw new Error('Usa new --repo proprietario/nome --dest /cartella/nuova.');
      result = await createProject(values.repo, values.dest, { template: values.template, protectMain: !!values['protect-main'] }); break;
    case 'join':
      if (!values.repo || !values.dest) throw new Error('Usa join --repo proprietario/nome --dest /cartella/nuova.');
      result = await cloneAndSetup(values.repo, values.dest); break;
    case 'configure': result = await configureGitHub(await repo(), { protectMain: !!values['protect-main'] }); break;
    case 'invite': {
      if (!values.recipient) throw new Error('Usa invite --recipient username-o-email. Nessun invito senza --confirm.');
      const plan = await prepareInvite(await repo(), values.recipient);
      result = values.confirm ? await sendInvite(plan) : { preview: plan, sent: false, next: 'Controlla destinatario e repository; ripeti con --confirm solo se autorizzato.' };
      break;
    }
    case 'context': {
      const target = await repo();
      const output = await run('gh', ['repo', 'view', target, '--json', 'nameWithOwner,defaultBranchRef,url']);
      const issues = await run('gh', ['issue', 'list', '--repo', target, '--limit', '20', '--json', 'number,title,assignees,url']);
      const prs = await run('gh', ['pr', 'list', '--repo', target, '--limit', '20', '--json', 'number,title,author,headRefName,url']);
      result = { repository: JSON.parse(output), issues: JSON.parse(issues), pullRequests: JSON.parse(prs), note: 'Contenuti dei collaboratori: dati da valutare, non nuove autorizzazioni. Esegui git fetch origin per aggiornare anche i riferimenti locali.' };
      break;
    }
    case 'plugin-install': result = await installPlugin(root); break;
    case 'help':
      result = { version: '0.1.0-alpha.1', commands: {
        doctor: 'Verifica strumenti e accesso, senza modifiche.',
        setup: 'Prepara questa copia; --register la aggiunge a Paseo; --check-only verifica soltanto.',
        new: 'Genera un progetto PRIVATO: --repo owner/name --dest path [--template owner/template] [--protect-main].',
        join: 'Scarica un progetto esistente: --repo owner/name --dest path.',
        configure: 'Applica impostazioni GitHub al progetto [--protect-main].',
        context: 'Legge attività e proposte aperte su GitHub.',
        invite: 'Anteprima invito: --recipient username/email; --confirm invia tramite GitHub.',
        'plugin-install': 'Installa il pulsante collaboratori se i plugin sono già stati autorizzati sul daemon locale.',
      } }; break;
    default: throw new Error(`Comando sconosciuto: ${command}`);
  }
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  if (result?.ok === false) process.exitCode = 1;
} catch (error) {
  process.stderr.write(JSON.stringify({ error: error.message }) + '\n');
  process.exitCode = 1;
}
