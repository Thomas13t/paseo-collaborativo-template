# Crea un nuovo progetto collaborativo

Questa procedura usa il template una sola volta per ogni nuovo progetto. I collaboratori seguiranno poi INIZIA-QUI.md nel repository nuovo.

1. Verifica il login GitHub e concorda nome, proprietario e cartella locale. Il default è un repository **privato**.
2. Scarica o apri una copia di `Thomas13t/paseo-collaborativo-template` e leggi gli script. La CLI richiede Node.js >=20, Git, `gh` e Paseo.
3. Dalla copia del template esegui, sostituendo la cartella con un percorso adatto al computer:

   ```sh
   node scripts/collab.mjs new --repo Thomas13t/Sdrubale --dest /percorso/Sdrubale --protect-main
   ```

   Per un altro proprietario cambia `Thomas13t`. Il comando genera il repository da template, lo clona, prepara l’ambiente, registra il progetto in Paseo e applica le impostazioni di collaborazione. La protezione di main richiede il supporto del piano GitHub; un errore di piano viene riportato senza dichiararla attiva.

4. Se GitHub è stato creato ma un passaggio locale fallisce, conserva il repository e riprendi la preparazione: non crearne un duplicato e non cancellarlo. Nella copia locale puoi ripetere `setup --register` e `configure --protect-main`.
5. Personalizza `docs/progetto.md` con nome e obiettivo, poi pubblica gli avanzamenti su un branch dedicato. Il primo materiale può essere una conversazione o un documento; non creare uno stack applicativo senza necessità.
6. Mostra il link del nuovo repository e del suo `INIZIA-QUI.md`. Non inviare inviti finché l’utente non sceglie la persona.
7. Mostra sempre all’utente lo stato `invitationPlugin` restituito dal setup. Spiega che il pulsante Invita richiede il plugin installato su quel Paseo, una sola volta per computer/daemon. Se manca o non è attivo, segui `docs/plugin.md` dopo il consenso; non abilitarlo silenziosamente e non reinstallarlo se è già attivo. Il clone/pull non installa il plugin e non genera una notifica push nativa.

Per creare dalla UI GitHub si può anche usare **Use this template**. Dopo il clone bisogna comunque eseguire `setup --register` e, come amministratore, `configure --protect-main`: i file copiati non applicano da soli le impostazioni del repository.
