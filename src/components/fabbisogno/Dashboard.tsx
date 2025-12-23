import React, { useState, useMemo } from 'react';
import { useCashFlow } from '@/hooks/useCashFlow';
import { useToast } from "@/hooks/use-toast";
import { BankAccount, Transaction } from '@/types/cashflow';
import { BankStatus } from './BankStatus';
import { TransactionList } from './TransactionList';
import { AddTransactionModal } from './AddTransactionModal';
import { EditTransactionModal } from './EditTransactionModal';
import { EditBalanceModal } from './EditBalanceModal';
import { format, endOfMonth, isAfter } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, ChevronDown, Pencil, Trash2 } from 'lucide-react';
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

interface CollapsibleSectionProps {
  title: string;
  total: number;
  colorClass: string;
  children: React.ReactNode;
  hasContent: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, total, colorClass, children, hasContent }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!hasContent) return null;

  return (
    <div className="border-t border-border">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center p-3 hover:bg-muted/50 transition-colors"
        aria-expanded={isExpanded}
      >
        <span className={`font-medium ${colorClass}`}>{title}</span>
        <div className="flex items-center gap-2">
          <span className={`font-semibold ${colorClass}`}>{formatCurrency(total)}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {isExpanded && (
        <div className="p-4 pt-0 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const {
    bankAccounts,
    transactions,
    allTransactions,
    currentMonth,
    isLoading,
    error,
    changeMonth,
    addTransaction,
    addTransfer,
    updateTransaction,
    updateBankAccount,
    postponeTransaction,
    deleteTransaction,
  } = useCashFlow();

  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [includedFutureTransactions, setIncludedFutureTransactions] = useState<Set<string>>(new Set());

  const handleToggleFutureTransaction = (txId: string) => {
    setIncludedFutureTransactions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(txId)) {
        newSet.delete(txId);
      } else {
        newSet.add(txId);
      }
      return newSet;
    });
  };

  const handleAddTransaction = async (transaction: Parameters<typeof addTransaction>[0]) => {
    try {
      await addTransaction(transaction);
      setIsModalOpen(false);
    } catch (e) {
      console.error("Failed to add transaction:", e);
    }
  };

  const handleAddTransfer = async (transfer: Parameters<typeof addTransfer>[0]) => {
    try {
      await addTransfer(transfer);
      setIsModalOpen(false);
    } catch (e) {
      console.error("Failed to add transfer:", e);
    }
  };

  const handleUpdateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      await updateTransaction(id, updates);
      setEditingTransaction(null);
    } catch (e) {
      console.error("Failed to update transaction:", e);
    }
  };

  const handleUpdateBankAccount = async (id: string, updates: Partial<BankAccount>) => {
    try {
      await updateBankAccount(id, updates);
      setEditingAccount(null);
    } catch (e) {
      console.error("Failed to update bank account:", e);
    }
  };

  const handleUpdateStatus = (id: string, isPaid: boolean) => {
    handleUpdateTransaction(id, { pagato: isPaid, data_pagamento: isPaid ? new Date().toISOString() : null });
  };

  const { liquiditaFineMese, futureExpenses, futureIncomes, futureExpensesTotal, futureIncomesTotal, groupedFutureExpenses } = useMemo(() => {
    const totalBalance = bankAccounts.reduce((sum, acc) => sum + acc.saldo_attuale, 0);

    const unPaidMonthlyIncomes = transactions
      .filter(t => t.tipo === 'ENTRATA' && !t.pagato)
      .reduce((sum, t) => sum + Number(t.importo), 0);

    const unPaidMonthlyExpenses = transactions
      .filter(t => t.tipo === 'USCITA' && !t.pagato)
      .reduce((sum, t) => sum + Number(t.importo), 0);

    const baseLiquiditaFineMese = totalBalance + unPaidMonthlyIncomes - unPaidMonthlyExpenses;

    const endOfCurrentMonth = endOfMonth(currentMonth);

    const futureTransactions = allTransactions
      .filter(t => isAfter(new Date(t.data_scadenza_mese), endOfCurrentMonth) && !t.pagato && t.tipo !== 'TRASFERIMENTO')
      .sort((a, b) => {
        const dateCompare = new Date(a.data_scadenza_mese).getTime() - new Date(b.data_scadenza_mese).getTime();
        if (dateCompare !== 0) return dateCompare;
        return new Date(a.creato_il).getTime() - new Date(b.creato_il).getTime();
      });

    const futureExpenses = futureTransactions.filter(t => t.tipo === 'USCITA');
    const futureIncomes = futureTransactions.filter(t => t.tipo === 'ENTRATA');

    const futureExpensesTotal = futureExpenses.reduce((sum, t) => sum + Number(t.importo), 0);
    const futureIncomesTotal = futureIncomes.reduce((sum, t) => sum + Number(t.importo), 0);

    const groupedFutureExpenses: Record<string, Transaction[]> = {};
    futureExpenses.forEach(tx => {
      const category = tx.categoria_uscita || 'Varie';
      if (!groupedFutureExpenses[category]) {
        groupedFutureExpenses[category] = [];
      }
      groupedFutureExpenses[category].push(tx);
    });

    const simulatedAdjustment = Array.from(includedFutureTransactions).reduce((total: number, txId) => {
      const tx = allTransactions.find(t => t.id === txId);
      if (!tx) return total;
      if (tx.tipo === 'ENTRATA') {
        return total + Number(tx.importo);
      }
      if (tx.tipo === 'USCITA') {
        return total - Number(tx.importo);
      }
      return total;
    }, 0);

    const liquiditaFineMese = baseLiquiditaFineMese + simulatedAdjustment;

    return { liquiditaFineMese, futureExpenses, futureIncomes, futureExpensesTotal, futureIncomesTotal, groupedFutureExpenses };
  }, [bankAccounts, transactions, allTransactions, currentMonth, includedFutureTransactions]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Caricamento...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-64 text-destructive">{error}</div>;
  }

  const formattedMonth = format(currentMonth, 'MMMM yyyy', { locale: it });

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
      toast({
        title: "Successo",
        description: "Transazione eliminata correttamente.",
      });
    } catch (error) {
      console.error("Errore durante l'eliminazione:", error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile eliminare la transazione. Riprova o contatta l'assistenza.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-muted transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold capitalize text-foreground">{formattedMonth}</h1>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-muted transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-semibold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Aggiungi
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <p className="text-sm text-muted-foreground text-center">
              Liquidità a Fine Mese {includedFutureTransactions.size > 0 ? '(Simulata)' : '(Prevista)'}
            </p>
            <p className={`text-4xl font-bold text-center my-4 ${liquiditaFineMese >= 0 ? 'text-foreground' : 'text-destructive'}`}>
              {formatCurrency(liquiditaFineMese)}
            </p>

            {(futureExpenses.length > 0 || futureIncomes.length > 0) && (
              <div>
                <CollapsibleSection
                  title="Uscite Future"
                  total={-futureExpensesTotal}
                  colorClass="text-red-500"
                  hasContent={futureExpenses.length > 0}
                >
                  {Object.keys(groupedFutureExpenses).map((category) => {
                    const txs = groupedFutureExpenses[category];
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium text-muted-foreground">{category}</p>
                          <p className="text-sm text-red-500">{formatCurrency(-txs.reduce((s, t) => s + Number(t.importo), 0))}</p>
                        </div>
                        <div className="space-y-1 pl-2">
                          {txs.map(tx => (
                            <div key={tx.id} className="flex justify-between items-center py-1">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={includedFutureTransactions.has(tx.id)}
                                  onChange={() => handleToggleFutureTransaction(tx.id)}
                                  className="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
                                  title="Includi nella simulazione di liquidità"
                                />
                                <span className="text-sm text-foreground">
                                  {tx.descrizione} ({format(new Date(tx.data_scadenza_mese), 'MMM yyyy', { locale: it })})
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-red-500">{formatCurrency(-Number(tx.importo))}</span>
                                <button onClick={() => setEditingTransaction(tx)} title="Modifica" className="p-1 text-muted-foreground hover:text-primary transition-colors">
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <button
                                      title="Elimina"
                                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Elimina Transazione Futura</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Sei sicuro di voler eliminare la transazione futura "{tx.descrizione}"?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Annulla</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteTransaction(tx.id)}
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
                      </div>
                    );
                  })}
                </CollapsibleSection>

                <CollapsibleSection
                  title="Entrate Future"
                  total={futureIncomesTotal}
                  colorClass="text-green-600"
                  hasContent={futureIncomes.length > 0}
                >
                  <div className="space-y-1">
                    {futureIncomes.map(tx => (
                      <div key={tx.id} className="flex justify-between items-center py-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={includedFutureTransactions.has(tx.id)}
                            onChange={() => handleToggleFutureTransaction(tx.id)}
                            className="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
                            title="Includi nella simulazione di liquidità"
                          />
                          <span className="text-sm text-foreground">
                            {tx.descrizione} ({format(new Date(tx.data_scadenza_mese), 'MMM yyyy', { locale: it })})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-green-600">{formatCurrency(Number(tx.importo))}</span>
                          <button onClick={() => setEditingTransaction(tx)} title="Modifica" className="p-1 text-muted-foreground hover:text-primary transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                title="Elimina"
                                className="p-1 text-red-500 hover:text-red-700 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Elimina Transazione Futura</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Sei sicuro di voler eliminare la transazione futura "{tx.descrizione}"?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annulla</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTransaction(tx.id)}
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
                </CollapsibleSection>
              </div>
            )}
          </div>
        </div>

        <div>
          <BankStatus bankAccounts={bankAccounts} onEditAccount={setEditingAccount} />
        </div>
      </div>

      <TransactionList
        transactions={transactions.filter(t => t.tipo !== 'TRASFERIMENTO')}
        onUpdateStatus={handleUpdateStatus}
        onPostpone={postponeTransaction}
        onDelete={handleDeleteTransaction}
        onEdit={setEditingTransaction}
      />

      {isModalOpen && (
        <AddTransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddTransaction={handleAddTransaction}
          onAddTransfer={handleAddTransfer}
          bankAccounts={bankAccounts}
        />
      )}

      {editingTransaction && (
        <EditTransactionModal
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onUpdateTransaction={handleUpdateTransaction}
          transaction={editingTransaction}
          bankAccounts={bankAccounts}
        />
      )}

      {editingAccount && (
        <EditBalanceModal
          isOpen={!!editingAccount}
          onClose={() => setEditingAccount(null)}
          onSave={handleUpdateBankAccount}
          account={editingAccount}
        />
      )}
    </div>
  );
};
