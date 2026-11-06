# Stato della versione 0.1.0-alpha.1

## Disponibile

- Template GitHub indipendente dallo stack applicativo.
- Procedure CREA-PROGETTO.md e INIZIA-QUI.md per proprietario e collaboratori.
- CLI per creazione privata, clone, preparazione locale ripetibile, registrazione Paseo, lettura attività e impostazioni GitHub.
- Regole condivise, richiami per Claude/Gemini e convenzioni di collaborazione.
- Plugin UserPlus per sidebar, pannello workspace e menu comandi: ricerca destinatario, anteprima, conferma e invito GitHub.
- Ticket invito monouso con scadenza; nessun cambio ai permessi di collaboratori già presenti.

## Verifiche

I test automatici usano servizi GitHub e Paseo simulati. Coprono accessi, email ambigue/private, inviti duplicati, cambi account/repository, scadenza delle anteprime e preparazione ripetuta senza duplicati. Nessun invito reale viene inviato dai test.

La verifica TypeScript usa il pacchetto SDK Paseo 0.15.0. L’installazione e la verifica visiva del plugin sono separate: richiedono l’abilitazione esplicita dei plugin sul daemon. Prima di chiamare l’alfa operativa, provare il pannello su desktop/compatto e tema chiaro/scuro, poi un invito a un destinatario scelto dall’utente.

## Limiti

- Non c’è invio email personalizzato: GitHub notifica l’account invitato. Un’email privata non è convertibile automaticamente in username.
- Non è un ambiente di editing simultaneo. Il lavoro diventa condiviso con push, pull request e aggiornamento dei documenti.
- Le protezioni del branch dipendono da piano e permessi GitHub; un template di file non le trasferisce automaticamente.
- Le istruzioni comuni non dimostrano da sole che ogni runtime le carichi automaticamente. INIZIA-QUI.md richiede all’agente di leggerle esplicitamente.
- I progetti già creati non ricevono automaticamente le nuove versioni del template.
- Con il lockfile SDK 0.15.0, `npm ci --ignore-scripts` il 6 novembre 2026 ha riportato zero vulnerabilità note. Rivalutare audit e compatibilità ai prossimi aggiornamenti.

Nessuna credenziale o cronologia personale deve essere aggiunta al template.
