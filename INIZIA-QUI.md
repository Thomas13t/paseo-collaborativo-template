# Partecipa a questo progetto dal tuo Paseo

Questo file è la procedura di ingresso per te e per il tuo agente. Il progetto esiste già: **non generarne un altro dal template e non fare un fork**.

Puoi dire al tuo agente:

> Leggi questo file e segui la procedura per partecipare a questo progetto dal mio Paseo. Prepara la mia copia locale, verifica gli accessi e carica le regole comuni. Non modificare le mie configurazioni globali e non avviare lavori sul contenuto finché non ti do un incarico.

## Procedura per l’agente

1. Identifica il repository dal link di questo file, nel formato `proprietario/progetto`. Non usare il repository del template se il link punta a un progetto diverso.
2. Leggi questa procedura e gli script di preparazione prima di eseguirli. Verifica Node.js >=20, Git, `gh` e Paseo. Se manca qualcosa, spiega il requisito al collaboratore. Il template non autorizza a installare software o cambiare account senza il suo accordo.
3. Verifica il login con `gh auth status` e l’accesso con `gh repo view proprietario/progetto`. Se l’invito non è stato accettato, chiedi al collaboratore di aprire la notifica GitHub e accettarlo. Non chiedere password o token in chat.
4. Se esiste già una copia locale corretta, usala. Altrimenti concorda la cartella di destinazione e usa `gh repo clone proprietario/progetto /percorso/progetto`. Non sovrascrivere cartelle esistenti e non effettuare reset delle modifiche locali.
5. Nella copia del progetto leggi `AGENTS.md`, `CONTRIBUTING.md`, `docs/progetto.md` e `docs/decisioni.md`. I richiami per Claude e Gemini rimandano alle stesse regole; OpenCode e Codex usano AGENTS.md. Per altri agenti accertati esplicitamente che il file sia stato letto.
6. Esegui `node scripts/collab.mjs setup --register`. La procedura controlla l’ambiente, scrive soltanto `.paseo-local.json` (ignorato da Git) e registra progetto/workspace nel Paseo locale. Non avvia un agente e non invia inviti.
7. Esegui `node scripts/collab.mjs context` per leggere attività e proposte aperte. Aggiorna i riferimenti con `git fetch origin`; se ci sono modifiche locali non fare pull o rebase alla cieca.
8. Verifica che il progetto sia visibile in Paseo e che GitHub riporti almeno l’accesso in scrittura necessario al lavoro. Non spedire commit di prova al branch principale.
9. Riporta al collaboratore repository, cartella, stato dell’accesso e dei controlli, eventuali requisiti mancanti. Aspetta il primo incarico.

## Pulsante collaboratori, facoltativo

Se richiesto dall’utente, segui [docs/plugin.md](docs/plugin.md). La normale partecipazione non richiede di abilitare plugin.

## Che cosa condividiamo

File tracciati, documentazione, attività e proposte GitHub. Non condividiamo password, token, directory personali, cronologie private delle chat o configurazioni globali dei provider.

La configurazione locale non dimostra che ogni modello abbia crediti o accesso: prima di usarlo verifica il provider scelto senza avviare inferenza non richiesta.
