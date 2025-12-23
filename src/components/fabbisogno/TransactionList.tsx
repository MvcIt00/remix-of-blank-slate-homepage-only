import React, { useState } from 'react';
import { Transaction } from '@/types/cashflow';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Check, Calendar, Pencil, Trash2, Undo2, ChevronDown, ChevronRight } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
};

interface TransactionTableProps {
  title: string;
  transactions: Transaction[];
  total: number;
  type: 'ENTRATA' | 'USCITA';
  onUpdateStatus: (id: string, isPaid: boolean) => void;
  onPostpone: (id: string, originalDate: string) => void;
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  emptyMessage: string;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  title,
  transactions,
  total,
  type,
  onUpdateStatus,
  onPostpone,
  onDelete,
  onEdit,
  emptyMessage
}) => {
  const headerColor = type === 'ENTRATA' ? 'text-green-600' : 'text-red-500';

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-border">
        <h3 className={`font-semibold ${headerColor}`}>{title}</h3>
        {transactions.length > 0 && (
          <span className={`font-bold ${headerColor}`}>{formatCurrency(total)}</span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Descrizione</th>
              <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase">Importo</th>
              <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? transactions.map(tx => (
              <tr key={tx.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="p-3 text-foreground">{tx.descrizione}</td>
                <td className={`p-3 text-right font-medium ${headerColor}`}>{formatCurrency(tx.importo)}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    {tx.pagato ? (
                      <button
                        onClick={() => onUpdateStatus(tx.id, false)}
                        title="Annulla pagamento"
                        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Undo2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => onUpdateStatus(tx.id, true)}
                          title={type === 'ENTRATA' ? "Incassa" : "Paga"}
                          className="p-1.5 text-green-500 hover:text-green-700 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onPostpone(tx.id, tx.data_scadenza_mese)}
                          title="Posticipa"
                          className="p-1.5 text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onEdit(tx)}
                      title="Modifica"
                      className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          title="Elimina"
                          className="p-1.5 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Elimina Transazione</AlertDialogTitle>
                          <AlertDialogDescription>
                            Sei sicuro di voler eliminare la transazione "{tx.descrizione}"?
                            {tx.pagato && (
                              <span className="block mt-2 font-medium text-destructive">
                                ATTENZIONE: Questa operazione stornerà anche l'importo dal saldo del conto.
                              </span>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(tx.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Elimina
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3} className="p-4 text-center text-muted-foreground">{emptyMessage}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PaidTransactionsSection: React.FC<{
  title: string;
  transactions: Transaction[];
  type: 'ENTRATA' | 'USCITA';
  onUpdateStatus: (id: string, isPaid: boolean) => void;
  onDelete: (id: string) => void;
}> = ({ title, transactions, type, onUpdateStatus, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (transactions.length === 0) return null;

  const total = transactions.reduce((sum, tx) => sum + Number(tx.importo), 0);
  const textColor = type === 'ENTRATA' ? 'text-green-600' : 'text-red-500';

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center p-2 bg-muted/50 rounded-md text-sm text-muted-foreground hover:bg-muted"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          {title} ({transactions.length})
        </div>
        <span className={textColor}>{formatCurrency(total)}</span>
      </button>
      {isExpanded && (
        <div className="mt-2 space-y-1 pl-4">
          {transactions.map(tx => (
            <div key={tx.id} className="flex justify-between items-center py-2 px-3 bg-muted/30 rounded-md">
              <div>
                <p className="text-sm text-foreground">{tx.descrizione}</p>
                <p className="text-xs text-muted-foreground">
                  {type === 'ENTRATA' ? 'Incassato il' : 'Pagato il'}: {tx.data_pagamento ? format(new Date(tx.data_pagamento), 'dd/MM/yyyy', { locale: it }) : 'N/D'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-medium ${textColor}`}>{formatCurrency(tx.importo)}</span>
                <button
                  onClick={() => onUpdateStatus(tx.id, false)}
                  title="Annulla pagamento"
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <Undo2 className="w-4 h-4" />
                </button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      title="Elimina"
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Elimina Transazione</AlertDialogTitle>
                      <AlertDialogDescription>
                        Sei sicuro di voler eliminare la transazione "{tx.descrizione}"?
                        <span className="block mt-2 font-medium text-destructive">
                          ATTENZIONE: Questa operazione stornerà l'importo dal saldo del conto.
                        </span>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annulla</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(tx.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Elimina
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface TransactionListProps {
  transactions: Transaction[];
  onUpdateStatus: (id: string, isPaid: boolean) => void;
  onPostpone: (id: string, originalDate: string) => void;
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onUpdateStatus,
  onPostpone,
  onDelete,
  onEdit
}) => {
  const incomes = transactions.filter(t => t.tipo === 'ENTRATA').sort((a, b) => {
    const dateCompare = new Date(a.data_scadenza_mese).getTime() - new Date(b.data_scadenza_mese).getTime();
    if (dateCompare !== 0) return dateCompare;
    return new Date(a.creato_il).getTime() - new Date(b.creato_il).getTime();
  });

  const expenses = transactions.filter(t => t.tipo === 'USCITA').sort((a, b) => {
    const dateCompare = new Date(a.data_scadenza_mese).getTime() - new Date(b.data_scadenza_mese).getTime();
    if (dateCompare !== 0) return dateCompare;
    return new Date(a.creato_il).getTime() - new Date(b.creato_il).getTime();
  });

  const unpaidIncomes = incomes.filter(t => !t.pagato);
  const paidIncomes = incomes.filter(t => t.pagato);
  const unpaidExpenses = expenses.filter(t => !t.pagato);
  const paidExpenses = expenses.filter(t => t.pagato);

  const totalUnpaidIncomes = unpaidIncomes.reduce((sum, tx) => sum + Number(tx.importo), 0);
  const totalUnpaidExpenses = unpaidExpenses.reduce((sum, tx) => sum + Number(tx.importo), 0);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Transazioni del Mese</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <TransactionTable
            title="Entrate da incassare"
            transactions={unpaidIncomes}
            total={totalUnpaidIncomes}
            type="ENTRATA"
            onUpdateStatus={onUpdateStatus}
            onPostpone={onPostpone}
            onDelete={onDelete}
            onEdit={onEdit}
            emptyMessage="Nessuna entrata prevista"
          />
          <PaidTransactionsSection
            title="Transazioni Incassate"
            transactions={paidIncomes}
            type="ENTRATA"
            onUpdateStatus={onUpdateStatus}
            onDelete={onDelete}
          />
        </div>
        <div>
          <TransactionTable
            title="Uscite da pagare"
            transactions={unpaidExpenses}
            total={totalUnpaidExpenses}
            type="USCITA"
            onUpdateStatus={onUpdateStatus}
            onPostpone={onPostpone}
            onDelete={onDelete}
            onEdit={onEdit}
            emptyMessage="Nessuna uscita prevista"
          />
          <PaidTransactionsSection
            title="Transazioni Pagate"
            transactions={paidExpenses}
            type="USCITA"
            onUpdateStatus={onUpdateStatus}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
};
