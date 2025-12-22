import React, { useState, useEffect } from 'react';
import { BankAccount } from '@/types/cashflow';
import { X } from 'lucide-react';

interface EditBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<BankAccount>) => Promise<void>;
  account: BankAccount;
}

export const EditBalanceModal: React.FC<EditBalanceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  account
}) => {
  const [newBalance, setNewBalance] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (account) {
      setNewBalance(String(account.saldo_attuale));
    }
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const balanceValue = parseFloat(newBalance);
    if (isNaN(balanceValue)) {
      alert('Per favore, inserisci un valore numerico valido.');
      return;
    }

    setIsSubmitting(true);
    await onSave(account.id, { saldo_attuale: balanceValue });
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  const inputClasses = "mt-1 block w-full px-3 py-2 bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring sm:text-sm";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-card p-6 rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-foreground">Modifica Saldo Conto</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-muted-foreground mb-4">
          Stai modificando il saldo per il conto: <strong className="text-foreground">{account.nome}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="newBalance" className="block text-sm font-medium text-muted-foreground">Nuovo Saldo (€)</label>
            <input
              type="number"
              id="newBalance"
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
              className={inputClasses}
              required
              step="0.01"
              autoFocus
            />
          </div>
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
              {isSubmitting ? 'Salvataggio...' : 'Salva Saldo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
