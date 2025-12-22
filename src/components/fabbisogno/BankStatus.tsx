import React from 'react';
import { BankAccount } from '@/types/cashflow';
import { Pencil } from 'lucide-react';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
};

interface BankStatusProps {
  bankAccounts: BankAccount[];
  onEditAccount: (account: BankAccount) => void;
}

export const BankStatus: React.FC<BankStatusProps> = ({ bankAccounts, onEditAccount }) => {
  const totalBalance = bankAccounts.reduce((sum, acc) => sum + acc.saldo_attuale, 0);

  return (
    <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold text-foreground">Situazione Conti</h2>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Saldo Totale</p>
          <p className="text-xl font-bold text-primary">{formatCurrency(totalBalance)}</p>
        </div>
      </div>

      <div className="space-y-3">
        {bankAccounts.length > 0 ? bankAccounts.map(acc => (
          <div key={acc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium text-foreground">{acc.nome}</p>
              <p className="text-xs text-muted-foreground">{acc.nome_banca}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">{formatCurrency(acc.saldo_attuale)}</p>
              <button
                onClick={() => onEditAccount(acc)}
                title="Modifica Saldo"
                className="p-1 text-muted-foreground hover:text-primary transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          </div>
        )) : <p className="text-muted-foreground text-center py-4">Nessun conto bancario aggiunto.</p>}
      </div>
    </div>
  );
};
