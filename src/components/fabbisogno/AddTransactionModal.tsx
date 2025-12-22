import React, { useState, useEffect } from 'react';
import { CategoriaUscita, TipoMovimento, BankAccount, FormTransactionType } from '@/types/cashflow';
import { X } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: {
    descrizione: string;
    importo: number;
    tipo: 'ENTRATA' | 'USCITA';
    data_scadenza_mese: string;
    categoria: CategoriaUscita | null;
    conto_bancario_id: string;
    tipo_movimento: TipoMovimento;
    pagato: boolean;
  }) => Promise<void>;
  onAddTransfer: (transfer: {
    importo: number;
    from_conto_bancario_id: string;
    to_conto_bancario_id: string;
  }) => Promise<void>;
  bankAccounts: BankAccount[];
}

const categorieDisponibili: CategoriaUscita[] = ["Spese Bancarie", "Fornitori", "Tasse/Imposte", "Varie"];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  onAddTransfer,
  bankAccounts
}) => {
  const [formType, setFormType] = useState<FormTransactionType>('USCITA');
  const [importo, setImporto] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [descrizione, setDescrizione] = useState('');
  const [dataScadenza, setDataScadenza] = useState(new Date().toISOString().split('T')[0]);
  const [categoria, setCategoria] = useState<CategoriaUscita | null>(null);
  const [contoBancarioId, setContoBancarioId] = useState('');
  const [tipoMovimento, setTipoMovimento] = useState<TipoMovimento>('BONIFICO');
  const [pagato, setPagato] = useState(false);
  const [fromContoId, setFromContoId] = useState('');
  const [toContoId, setToContoId] = useState('');

  const resetForm = () => {
    setDescrizione('');
    setImporto('');
    setDataScadenza(new Date().toISOString().split('T')[0]);
    setCategoria(null);
    setContoBancarioId('');
    setTipoMovimento('BONIFICO');
    setPagato(false);
    setFromContoId('');
    setToContoId('');
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
      setFormType('USCITA');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (formType === 'GIROCONTO') {
      if (!importo || !fromContoId || !toContoId || fromContoId === toContoId) {
        alert('Per favore, compila tutti i campi del trasferimento e assicurati che i conti siano diversi.');
        setIsSubmitting(false);
        return;
      }
      await onAddTransfer({
        importo: parseFloat(importo),
        from_conto_bancario_id: fromContoId,
        to_conto_bancario_id: toContoId,
      });
    } else {
      if (!descrizione || !importo || !dataScadenza || !contoBancarioId) {
        alert('Per favore, compila tutti i campi obbligatori.');
        setIsSubmitting(false);
        return;
      }
      await onAddTransaction({
        descrizione,
        importo: parseFloat(importo),
        tipo: formType,
        data_scadenza_mese: dataScadenza,
        categoria: formType === 'USCITA' ? categoria : null,
        conto_bancario_id: contoBancarioId,
        tipo_movimento: tipoMovimento,
        pagato: pagato
      });
    }

    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  const inputClasses = "mt-1 block w-full px-3 py-2 bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring sm:text-sm";
  const buttonBaseClasses = "px-4 py-2 rounded-md transition-colors text-sm font-medium";
  const activeTabClasses = "bg-primary text-primary-foreground";
  const inactiveTabClasses = "bg-muted text-muted-foreground hover:bg-muted/80";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-card p-6 rounded-lg shadow-xl w-full max-w-md m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-foreground">Aggiungi Operazione</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {(['USCITA', 'ENTRATA', 'GIROCONTO'] as FormTransactionType[]).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setFormType(type)}
              className={`${buttonBaseClasses} w-full ${formType === type ? activeTabClasses : inactiveTabClasses}`}
            >
              {type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          ))}
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

          {formType !== 'GIROCONTO' && (
            <>
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
                <label htmlFor="dataScadenza" className="block text-sm font-medium text-muted-foreground">Data Scadenza</label>
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
              {formType === 'USCITA' && (
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
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pagato"
                  checked={pagato}
                  onChange={(e) => setPagato(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-ring border-input rounded"
                />
                <label htmlFor="pagato" className="text-sm text-muted-foreground">
                  Già pagato / incassato
                </label>
              </div>
            </>
          )}

          {formType === 'GIROCONTO' && (
            <>
              <div>
                <label htmlFor="fromConto" className="block text-sm font-medium text-muted-foreground">Dal Conto</label>
                <select
                  id="fromConto"
                  value={fromContoId}
                  onChange={(e) => setFromContoId(e.target.value)}
                  className={inputClasses}
                  required
                >
                  <option value="">Seleziona conto di partenza</option>
                  {bankAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.nome} ({new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(acc.saldo_attuale)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="toConto" className="block text-sm font-medium text-muted-foreground">Al Conto</label>
                <select
                  id="toConto"
                  value={toContoId}
                  onChange={(e) => setToContoId(e.target.value)}
                  className={inputClasses}
                  required
                >
                  <option value="">Seleziona conto di arrivo</option>
                  {bankAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.nome} ({new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(acc.saldo_attuale)})
                    </option>
                  ))}
                </select>
              </div>
            </>
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
              {isSubmitting ? 'Salvataggio...' : 'Salva Operazione'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
