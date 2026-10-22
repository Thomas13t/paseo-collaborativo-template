# Pulsante “Invita al progetto”

Il plugin aggiunge un’icona **UserPlus** con il comando **Invita al progetto** nella sidebar. Nel menu comandi di un workspace è disponibile **Invita una persona al progetto**, che apre un pannello con il repository ricavato da origin. La versione alfa supporta Paseo 0.12.x; non modifica i pulsanti nativi dell’app.

## Attivazione locale

Il plugin è codice locale non sandboxato: può leggere file, avviare processi e usare il login `gh` sul computer del daemon. La procedura non abilita i plugin automaticamente.

Se l’utente ha già abilitato i plugin sul daemon locale, dalla copia del progetto:

```sh
node scripts/collab.mjs plugin-install
```

Se il controllo segnala che sono disabilitati, l’utente deve prima dare il consenso esplicito e abilitarli nelle impostazioni Paseo del proprio host. Non copiare configurazioni di un altro computer. L’installazione richiede npm e accesso al relativo registro; la prima esecuzione installa solo dipendenze di sviluppo per verificare i tipi.

I plugin appartengono al daemon: basta una sola installazione per usare il pannello nei diversi progetti. Il percorso locale della sorgente installata deve rimanere disponibile. Per cambiare sorgente o aggiornare il plugin, rivedere il codice e installare/ricaricare la versione scelta; nessun aggiornamento automatico dal template.

## Uso

1. Apri il pannello dal workspace, oppure la voce nella sidebar e inserisci `proprietario/progetto`.
2. Inserisci lo username GitHub o un’email pubblica. La ricerca per email contatta GitHub e riesce solo se l’indirizzo è pubblicamente associabile a un unico account.
3. Premi **Prepara invito**. Verifica repository, identità del destinatario, account mittente e accesso in scrittura.
4. Premi **Invia invito a @username**. Solo questo passaggio modifica l’accesso. GitHub genera l’invito/notifica; l’email effettiva dipende dalle impostazioni del destinatario.
5. Dopo l’accettazione il collaboratore apre README e INIZIA-QUI.md. Il pannello mostra anche la frase pronta con il link corretto alla procedura.

Le anteprime durano cinque minuti e sono utilizzabili una sola volta. Se cambia l’account mittente o il repository, occorre prepararle nuovamente. Collaboratori esistenti mantengono i loro permessi; gli inviti già in attesa non vengono duplicati. Il plugin rifiuta inviti nel repository modello: bisogna prima creare il progetto.

Il plugin non spedisce email personalizzate, non installa Paseo sul computer del destinatario e non accetta inviti al suo posto. Sul suo computer l’agente segue INIZIA-QUI.md usando il login personale.
