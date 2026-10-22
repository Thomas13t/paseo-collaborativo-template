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

La verifica TypeScript usa il pacchetto SDK Paseo 0.12.0. L’installazione e la verifica visiva del plugin sono separate: richiedono l’abilitazione esplicita dei plugin sul daemon. Prima di chiamare l’alfa operativa, provare il pannello su desktop/compatto e tema chiaro/scuro, poi un invito a un destinatario scelto dall’utente.

## Limiti

- Non c’è invio email personalizzato: GitHub notifica l’account invitato. Un’email privata non è convertibile automaticamente in username.
- Non è un ambiente di editing simultaneo. Il lavoro diventa condiviso con push, pull request e aggiornamento dei documenti.
- Le protezioni del branch dipendono da piano e permessi GitHub; un template di file non le trasferisce automaticamente.
- Le istruzioni comuni non dimostrano da sole che ogni runtime le carichi automaticamente. INIZIA-QUI.md richiede all’agente di leggerle esplicitamente.
- I progetti già creati non ricevono automaticamente le nuove versioni del template.
- Le dipendenze di sviluppo React Native richieste dal SDK 0.12 includono avvisi npm audit transitivi relativi a braces/micromatch. Non viene usato Metro né codice React Native da questo pacchetto nel daemon: Paseo fornisce i moduli del client. Non è stato applicato un aggiornamento forzato incompatibile con i peer del SDK. Prima di aggiornare il SDK ricontrollare l’audit e la compatibilità.

Nessuna credenziale o cronologia personale deve essere aggiunta al template.
