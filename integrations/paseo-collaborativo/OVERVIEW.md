# Invita al progetto

Aggiunge a Paseo una voce con icona UserPlus e un pannello per invitare collaboratori al repository del workspace. La ricerca prepara un’anteprima; il click finale invia l’invito GitHub con accesso in scrittura. Il destinatario, dopo aver accettato, segue INIZIA-QUI.md nel progetto.

Richiede Paseo 0.14.x, Git e GitHub CLI già autenticata con permessi amministratore sul repository. Usa le credenziali locali di gh senza portarle nel client. La ricerca per email è possibile solo per indirizzi pubblici; altrimenti serve lo username. GitHub gestisce le notifiche: il plugin non è un servizio di invio email personalizzate.

Legge origin del workspace e contatta le API GitHub per verificare account, permessi e inviti esistenti. Modifica gli accessi soltanto dopo il click finale. Le anteprime scadono dopo cinque minuti. Nessuna modifica ai permessi di collaboratori già presenti.

Apri il progetto e premi Invita: il repository viene letto automaticamente da origin. Inserisci soltanto il destinatario. Nei layout compatti trovi il pulsante nel menu del workspace.
