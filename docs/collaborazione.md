# Coordinamento tra persone e agenti

## Dove leggere cosa

| Informazione | Fonte condivisa |
| --- | --- |
| Obiettivo e referenti | [progetto.md](progetto.md) |
| Fase, pausa, blocchi e prossimo passo | [STATO-PROGETTO.md](../STATO-PROGETTO.md) |
| Incarico, responsabile e avanzamento dettagliato | Issue GitHub dell'attività |
| Lavoro da revisionare | Pull request collegata all'issue |
| Ipotesi, proposte e approvazioni | [decisioni.md](decisioni.md) |
| Fonti e deliverable accessibili | [materiali.md](materiali.md) |

Le chat restano personali. Riportare soltanto le istruzioni e decisioni necessarie al team, senza pubblicare intere conversazioni private. Il riepilogo deve distinguere evidenza diretta, dichiarazione di un collaboratore e informazione non verificata.

## Avvio di un incarico

Prima di lavorare, leggere lo stato condiviso e aggiornare i riferimenti remoti senza sovrascrivere modifiche locali. Consultare anche issue e PR pertinenti, comprese quelle chiuse o integrate se spiegano le decisioni; l'elenco delle ultime attività aperte da solo non è una verifica completa.

Per un incarico sostanziale, riusare l'issue esistente oppure crearne una quando la pubblicazione è autorizzata. Indicare obiettivo, responsabile umano, perimetro, risultato atteso e criterio di completamento. L'agente/sessione si annota solo se noto: l'autore Git non prova quale modello abbia lavorato. Correzioni minori nello stesso incarico non richiedono nuove issue.

Controllare chi lavora già sul tema prima di iniziare. Se un secondo approccio è utile, registrarlo come confronto indipendente e stabilire chi riconcilia i risultati. Usare branch e copie/worktree distinti per modifiche parallele; non cambiare il branch di una cartella usata da un altro agente attivo.

## Passaggi di fase e ipotesi

Rispettare i limiti dell'incarico umano: se richiede domande prima del design o approvazione prima dell'implementazione, fermarsi a quel confine. Non occorre una nuova conferma per ogni azione ordinaria già autorizzata. Un progetto non deve avere per forza una Fase 0: le fasi si definiscono per il suo obiettivo.

Un'ipotesi può sostenere una bozza soltanto entro il perimetro autorizzato e deve essere visibile come tale, con conseguenze e verifica mancante. Una stima condizionata non è un budget approvato; una PR aperta non è una decisione condivisa.

Quando l'utente approva un passaggio in una chat personale, riportare nel registro la sintesi, chi ha approvato, quando, il perimetro e l'evidenza disponibile. Se la chat non è accessibile al team, indicare «autorizzazione riferita da @account, da confermare dal referente»; non inventare link o dichiararla verificata. Per chi non ha ricevuto direttamente quell'istruzione, la conferma pubblica del referente nell'issue/PR può risolvere l'incertezza. Le approvazioni non si estendono ad altri incarichi.

Se una chat sembra contraddire lo stato condiviso, segnalare il disallineamento prima del passaggio dipendente. Continuare soltanto il lavoro indipendente già autorizzato. Non accusare un altro agente di aver ignorato una regola senza verificare quali istruzioni abbia effettivamente ricevuto.

## Pausa e ripresa

Una pausa esplicita dell'utente ferma le attività nel perimetro indicato. Registrare cosa è sospeso e cosa resta consentito; una consultazione autorizzata non riapre progettazione o implementazione. La ripresa richiede l'istruzione del referente competente, non un nuovo commit o l'iniziativa di un agente. Non terminare sessioni altrui senza autorizzazione.

## Consegna e riconciliazione

Pubblicare il risultato dove autorizzato e collegarlo nell'issue/PR e nell'indice materiali. Aggiornare decisioni e stato solo se cambiano. Un file sul proprio computer, un commit senza push o un link non accessibile non sono una consegna al team.

Se esistono risultati paralleli, il responsabile della riconciliazione indica quali parti si accettano, quali restano ipotesi e quali si superano, con motivazione e approvazione richiesta. Conservare le versioni precedenti. Alla consegna riportare risultato, verifiche, limiti e prossimo passo; non dedurre conclusioni definitive dai soli titoli o dalle valutazioni di un documento non disponibile.
