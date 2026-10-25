# Paseo collaborativo · alfa

Una base per creare progetti condivisi: repository e conoscenza comuni, copia locale e agenti personali per ogni collaboratore.

**Se sei stato invitato a questo progetto, parti da [INIZIA-QUI.md](INIZIA-QUI.md).**

## Prima apertura in Paseo: controlla il plugin

**Per avere il pulsante Invita, devi installare il plugin sul tuo Paseo. Serve una sola installazione per computer/daemon, anche se partecipi a più progetti.** Il clone o il pull del repository non installa né aggiorna il plugin.

Esegui `node scripts/collab.mjs setup --register`: l’output `invitationPlugin` dice se il pulsante è pronto o mostra il promemoria di installazione. Il tuo agente deve riportartelo. È un avviso nel setup, non una notifica push nativa al semplice clone.

Se manca, segui [la guida di installazione](docs/plugin.md). Dopo il consenso e l’abilitazione dei plugin, esegui `node scripts/collab.mjs plugin-install`. Se è già attivo, non reinstallarlo. Puoi lavorare sul repository anche senza il pulsante.

## Crea Sdrubale

Al tuo agente in Paseo puoi dire:

> Usa il template Thomas13t/paseo-collaborativo-template per creare un progetto privato chiamato Sdrubale sul mio account GitHub. Leggi la sua procedura CREA-PROGETTO.md, prepara la copia locale e registrala nel mio Paseo. Poi aspetta il materiale iniziale. Non invitare persone senza che io scelga il destinatario.

La procedura completa è in [CREA-PROGETTO.md](CREA-PROGETTO.md). Il template non obbliga a scegliere framework o linguaggi: il progetto può contenere software, documenti, ricerche o altri materiali.

## Invita una persona

Il plugin incluso aggiunge **Invita al progetto**, con icona UserPlus, nella testata dei workspace collaborativi e al loro menu comandi. Il repository viene riconosciuto automaticamente dal progetto aperto; non devi scriverlo a mano. Controlli destinatario, repository e accesso; poi premi **Invia invito**. Le notifiche vengono gestite da GitHub. Dopo l’accettazione il collaboratore trova qui il file INIZIA-QUI.md.

Il campo accetta username, link diretto al profilo GitHub o email pubblica. Se GitHub non espone l’email, serve lo username: non è possibile invitare una qualsiasi email tramite l’API dei collaboratori di repository personali. L’email di notifica effettiva è quella scelta nelle impostazioni GitHub del destinatario. Non viene spedito un messaggio personalizzato dal tuo account email.

[Configurazione del pulsante](docs/plugin.md). Il plugin è facoltativo; il progetto funziona anche senza.

## Come lavoriamo

- Prima di iniziare: aggiorniamo il contesto da GitHub e leggiamo [lo stato del progetto](STATO-PROGETTO.md), gli incarichi e le decisioni condivise.
- Lavoriamo su branch distinti e rendiamo visibili gli avanzamenti con push e pull request.
- Ogni incarico sostanziale ha un obiettivo, un responsabile, un perimetro e un criterio di completamento nell'issue; evitiamo filoni sovrapposti non concordati.
- Ipotesi, proposte e approvazioni restano distinte nel [registro decisioni](docs/decisioni.md). Rispettiamo i passaggi di fase e le pause indicati dall'utente.
- Fonti e deliverable, inclusi PDF e sorgenti, sono nell'[indice materiali](docs/materiali.md): un file rimasto sul computer di una persona non è ancora condiviso.
- Ognuno conserva i propri account, credenziali, conversazioni e preferenze dei modelli.

Le regole comuni sono in [AGENTS.md](AGENTS.md) e la procedura in [docs/collaborazione.md](docs/collaborazione.md). Alla creazione compila [docs/progetto.md](docs/progetto.md) e lo stato con l'incarico ricevuto: il template non presume una metodologia o una fase specifica.

Sono convenzioni condivise per persone e agenti, non un blocco tecnico che impedisce a un modello di andare oltre il proprio incarico. In caso di informazioni mancanti, il riepilogo deve dichiarare l'incertezza.

## Requisiti e limiti dell’alfa

Node.js 20+, Git, GitHub CLI autenticata e Paseo 0.12.x per il plugin. Per il solo template servono i comandi project/workspace/script della CLI Paseo. Su macOS viene riconosciuta anche la CLI inclusa in `/Applications/Paseo.app`; altrove usa `paseo` nel PATH o `PASEO_BIN`.

La preparazione è un comando esplicito, non codice eseguito automaticamente dal clone. Il setup dei nuovi worktree esegue solo i controlli. Non installiamo provider, non modifichiamo le impostazioni globali degli agenti e non abilitiamo automaticamente i plugin.

Il template copia i file, non i permessi o le protezioni GitHub: la procedura `configure` applica le impostazioni e può richiedere la protezione del branch principale. Se il piano GitHub non la consente, viene riportato esplicitamente. Le istruzioni agli agenti sono una convenzione di lavoro; non sostituiscono autorizzazioni e controlli GitHub.

Gli aggiornamenti futuri del template non si propagano automaticamente ai progetti già creati. Prima di usare una nuova versione, rivedere le modifiche.

## Verifica

`npm test` esegue test locali senza inviare inviti né creare repository. Per il plugin: `npm ci --ignore-scripts` e `npm run typecheck` nella sua cartella.

Versione: **0.1.0-alpha.1**. Il runtime del plugin richiede l’abilitazione esplicita dei plugin sul daemon dell’utente.
