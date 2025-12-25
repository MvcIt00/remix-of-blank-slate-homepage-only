# UX Fix Preventivi - Completato

## Modifiche Applicate

### File Modificato
- `src/components/preventivi-noleggio/PreventivoStatusButton.tsx`

### Cambiamenti
1. **Stato "approvato"**: Aggiunto bottone "Vedi Firmato" come prima opzione
2. **"Rifiutato dal cliente"**: Nascosto per preventivi approvati (non ha senso)
3. **Verificato**: Bottone "Salva Preventivo" è corretto (Zero-Draft)

## Test
Vai su `/noleggi/preventivi` e verifica le azioni per preventivo approvato.
