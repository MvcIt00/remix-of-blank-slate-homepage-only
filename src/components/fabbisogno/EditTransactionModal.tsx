import React, { useState, useEffect } from 'react';
import { CategoriaUscita, TipoMovimento, BankAccount, Transaction } from '@/types/cashflow';
import { X } from 'lucide-react';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  transaction: Transaction;
  bankAccounts: BankAccount[];
}

const categorieDisponibili: CategoriaUscita[] = ["Spese Bancarie", "Fornitori", "Tasse/Imposte", "Varie"];

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  isOpen,
  onClose,
  onUpdateTransaction,
  transaction,
  bankAccounts
}) => {
  const [importo, setImporto] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [dataScadenza, setDataScadenza] = useState('');
  const [categoria, setCategoria] = useState<CategoriaUscita | null>(null);
  const [contoBancarioId, setContoBancarioId] = useState('');
  const [tipoMovimento, setTipoMovimento] = useState<TipoMovimento>('BONIFICO');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (transaction) {
      setImporto(String(transaction.importo));
      setDescrizione(transaction.descrizione);
      setDataScadenza(transaction.data_scadenza_mese);
      setCategoria(transaction.categoria_uscita);
      setContoBancarioId(transaction.conto_bancario_id);
      setTipoMovimento(transaction.tipo_movimento);
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descrizione || !importo || !dataScadenza || !contoBancarioId) {
      alert('Per favore, compila tutti i campi obbligatori.');
      return;
    }

    setIsSubmitting(true);
    await onUpdateTransaction(transaction.id, {
      descrizione,
      importo: parseFloat(importo),
      data_scadenza_mese: dataScadenza,
      categoria_uscita: transaction.tipo === 'USCITA' ? categoria : null,
      conto_bancario_id: contoBancarioId,
      tipo_movimento: tipoMovimento,
    });
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  const inputClasses = "mt-1 block w-full px-3 py-2 bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring sm:text-sm";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-card p-6 rounded-lg shadow-xl w-full max-w-md m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-foreground">Modifica Transazione</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="importo" className="block text-sm font-medium text-muted-foreground">Importo (€)</label>
            <input
              type="number"
              id="importo"
              value={importo}
              onChange={(e) => setImporto(e.target.value)}
              className={inputClasses}
              required
              step="0.01"
            />
          </div>
          <div>
            <label htmlFor="descrizione" className="block text-sm font-medium text-muted-foreground">Descrizione</label>
            <input
              type="text"
              id="descrizione"
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label htmlFor="dataScadenzaOriginale" className="block text-sm font-medium text-muted-foreground">Data Scadenza Originale</label>
            <input
              type="date"
              id="dataScadenzaOriginale"
              value={new Date(transaction.data_scadenza_originale).toISOString().split('T')[0]}
              className={`${inputClasses} bg-muted cursor-not-allowed`}
              readOnly
            />
          </div>
          <div>
            <label htmlFor="dataScadenza" className="block text-sm font-medium text-muted-foreground">Data Rinvio</label>
            <input
              type="date"
              id="dataScadenza"
              value={dataScadenza}
              onChange={(e) => setDataScadenza(e.target.value)}
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label htmlFor="contoBancario" className="block text-sm font-medium text-muted-foreground">Conto Bancario</label>
            <select
              id="contoBancario"
              value={contoBancarioId}
              onChange={(e) => setContoBancarioId(e.target.value)}
              className={inputClasses}
              required
            >
              <option value="">Seleziona un conto</option>
              {bankAccounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tipoMovimento" className="block text-sm font-medium text-muted-foreground">Tipo Movimento</label>
            <select
              id="tipoMovimento"
              value={tipoMovimento}
              onChange={(e) => setTipoMovimento(e.target.value as TipoMovimento)}
              className={inputClasses}
            >
              <option value="BONIFICO">Bonifico</option>
              <option value="RICEVUTA_BANCARIA">Ricevuta Bancaria</option>
              <option value="ASSEGNO">Assegno</option>
              <option value="CONTANTI">Contanti</option>
              <option value="ALTRO">Altro</option>
            </select>
          </div>
          {transaction.tipo === 'USCITA' && (
            <div>
              <label htmlFor="categoria" className="block text-sm font-medium text-muted-foreground">Categoria (Opzionale)</label>
              <select
                id="categoria"
                value={categoria ?? ''}
                onChange={(e) => setCategoria(e.target.value as CategoriaUscita || null)}
                className={inputClasses}
              >
                <option value="">Nessuna categoria</option>
                {categorieDisponibili.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}
          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
