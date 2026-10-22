# Paseo collaborativo · alfa

Una base per creare progetti condivisi: repository e conoscenza comuni, copia locale e agenti personali per ogni collaboratore.

**Se sei stato invitato a questo progetto, parti da [INIZIA-QUI.md](INIZIA-QUI.md).**

## Crea Sdrubale

Al tuo agente in Paseo puoi dire:

> Usa il template Thomas13t/paseo-collaborativo-template per creare un progetto privato chiamato Sdrubale sul mio account GitHub. Leggi la sua procedura CREA-PROGETTO.md, prepara la copia locale e registrala nel mio Paseo. Poi aspetta il materiale iniziale. Non invitare persone senza che io scelga il destinatario.

La procedura completa è in [CREA-PROGETTO.md](CREA-PROGETTO.md). Il template non obbliga a scegliere framework o linguaggi: il progetto può contenere software, documenti, ricerche o altri materiali.

## Invita una persona

Il plugin incluso aggiunge **Invita al progetto**, con icona UserPlus, alla sidebar e al menu comandi di un workspace. Controlli destinatario, repository e accesso; poi premi **Invia invito**. Le notifiche vengono gestite da GitHub. Dopo l’accettazione il collaboratore trova qui il file INIZIA-QUI.md.

Il campo accetta username o email pubblica. Se GitHub non espone l’email, serve lo username: non è possibile invitare una qualsiasi email tramite l’API dei collaboratori di repository personali. L’email di notifica effettiva è quella scelta nelle impostazioni GitHub del destinatario. Non viene spedito un messaggio personalizzato dal tuo account email.

[Configurazione del pulsante](docs/plugin.md). Il plugin è facoltativo; il progetto funziona anche senza.

## Come lavoriamo

- Prima di iniziare: aggiorniamo il contesto da GitHub e leggiamo le decisioni condivise.
- Lavoriamo su branch distinti e rendiamo visibili gli avanzamenti con push e pull request.
- Le decisioni utili entrano nei documenti del progetto, non rimangono soltanto nelle chat.
- Ognuno conserva i propri account, credenziali, conversazioni e preferenze dei modelli.

Le regole comuni sono in [AGENTS.md](AGENTS.md), il contenuto da personalizzare in [docs/progetto.md](docs/progetto.md).

## Requisiti e limiti dell’alfa

Node.js 20+, Git, GitHub CLI autenticata e Paseo 0.12.x per il plugin. Per il solo template servono i comandi project/workspace/script della CLI Paseo. Su macOS viene riconosciuta anche la CLI inclusa in `/Applications/Paseo.app`; altrove usa `paseo` nel PATH o `PASEO_BIN`.

La preparazione è un comando esplicito, non codice eseguito automaticamente dal clone. Il setup dei nuovi worktree esegue solo i controlli. Non installiamo provider, non modifichiamo le impostazioni globali degli agenti e non abilitiamo automaticamente i plugin.

Il template copia i file, non i permessi o le protezioni GitHub: la procedura `configure` applica le impostazioni e può richiedere la protezione del branch principale. Se il piano GitHub non la consente, viene riportato esplicitamente. Le istruzioni agli agenti sono una convenzione di lavoro; non sostituiscono autorizzazioni e controlli GitHub.

Gli aggiornamenti futuri del template non si propagano automaticamente ai progetti già creati. Prima di usare una nuova versione, rivedere le modifiche.

## Verifica

`npm test` esegue test locali senza inviare inviti né creare repository. Per il plugin: `npm ci --ignore-scripts` e `npm run typecheck` nella sua cartella.

Versione: **0.1.0-alpha.1**. Il runtime del plugin richiede l’abilitazione esplicita dei plugin sul daemon dell’utente.
