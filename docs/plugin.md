# Pulsante “Invita al progetto”

Il plugin aggiunge **Invita**, con icona UserPlus, direttamente nella testata di ogni workspace che contiene il setup collaborativo (`INIZIA-QUI.md` e `scripts/collab.mjs`). Il pannello riconosce il progetto e legge il repository GitHub da `origin`: non c’è un campo proprietario/repository da compilare. Su finestre strette il pulsante è nel menu del workspace (`···`). Il pannello è disponibile anche nell’Explorer e dal menu comandi del workspace.

La versione alfa supporta Paseo 0.12.x. La voce globale nella sidebar è stata rimossa per evitare inviti scollegati dal progetto corrente.

## Prima apertura: il promemoria

Il clone o il pull non installa il plugin e non produce da solo una notifica push di Paseo. `setup --register`, `setup --check-only` e `doctor` controllano in sola lettura il catalogo locale: il campo `invitationPlugin` indica `ready`, `not-installed`, `needs-attention` o `unknown`, con messaggio e guida. L’agente deve mostrare il messaggio all’utente; è visibile anche nell’output dello script di preparazione in Paseo.

Per vedere **Invita** è necessario installare il plugin una sola volta per ogni computer/daemon. Anche ciascun collaboratore deve farlo sul proprio Paseo. Non confondere la registrazione del progetto con l’installazione del plugin.

## Attivazione locale

Il plugin è codice locale non sandboxato: può leggere file, avviare processi e usare il login `gh` sul computer del daemon. La procedura non abilita i plugin automaticamente.

Se l’utente ha già abilitato i plugin sul daemon locale, dalla copia del progetto:

```sh
node scripts/collab.mjs plugin-install
```

Se il controllo segnala che sono disabilitati, l’utente deve prima dare il consenso esplicito e abilitarli nelle impostazioni Paseo del proprio host. Non copiare configurazioni di un altro computer. L’installazione richiede npm e accesso al relativo registro; la prima esecuzione installa solo dipendenze di sviluppo per verificare i tipi.

I plugin appartengono al daemon: basta una sola installazione per usare il pannello nei diversi progetti. Il percorso locale della sorgente installata deve rimanere disponibile. Per cambiare sorgente o aggiornare il plugin, rivedere il codice e installare/ricaricare la versione scelta; nessun aggiornamento automatico dal template.

## Uso

1. Apri il workspace del progetto e premi **Invita** in alto. Progetto e repository sono già riconosciuti; devi inserire soltanto la persona.
2. Inserisci lo username GitHub (anche con @), il link diretto al profilo oppure un’email pubblica. La ricerca per email contatta GitHub e riesce solo se l’indirizzo è pubblicamente associabile a un unico account.
3. Premi **Prepara invito**. Verifica repository, identità del destinatario, account mittente e accesso in scrittura.
4. Premi **Invia invito a @username**. Solo questo passaggio modifica l’accesso. GitHub genera l’invito/notifica; l’email effettiva dipende dalle impostazioni del destinatario.
5. Dopo l’accettazione il collaboratore apre README e INIZIA-QUI.md. Il pannello mostra anche la frase pronta con il link corretto alla procedura.

Le anteprime durano cinque minuti e sono utilizzabili una sola volta. Se cambia l’account mittente o il repository, occorre prepararle nuovamente. Collaboratori esistenti mantengono i loro permessi; gli inviti già in attesa non vengono duplicati. Il plugin rifiuta inviti nel repository modello: bisogna prima creare il progetto.

Il plugin non spedisce email personalizzate, non installa Paseo sul computer del destinatario e non accetta inviti al suo posto. Sul suo computer l’agente segue INIZIA-QUI.md usando il login personale.
