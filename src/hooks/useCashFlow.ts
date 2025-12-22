import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BankAccount, Transaction, CategoriaUscita, TipoMovimento } from '@/types/cashflow';
import { startOfMonth, endOfMonth, addMonths, format } from 'date-fns';

export const useCashFlow = () => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBankAccounts = useCallback(async () => {
    const { data, error } = await supabase
      .from('conti_bancari')
      .select('*')
      .order('nome');

    if (error) {
      console.error('Error fetching bank accounts:', error);
      setError('Errore nel caricamento dei conti bancari');
      return;
    }

    setBankAccounts(data || []);
  }, []);

  const fetchTransactions = useCallback(async () => {
    const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('transazioni')
      .select('*')
      .gte('data_scadenza_mese', startDate)
      .lte('data_scadenza_mese', endDate)
      .order('data_scadenza_mese');

    if (error) {
      console.error('Error fetching transactions:', error);
      setError('Errore nel caricamento delle transazioni');
      return;
    }

    setTransactions(data || []);
  }, [currentMonth]);

  const fetchAllTransactions = useCallback(async () => {
    const { data, error } = await supabase
      .from('transazioni')
      .select('*')
      .order('data_scadenza_mese');

    if (error) {
      console.error('Error fetching all transactions:', error);
      return;
    }

    setAllTransactions(data || []);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchBankAccounts(), fetchTransactions(), fetchAllTransactions()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchBankAccounts, fetchTransactions, fetchAllTransactions]);

  const changeMonth = (direction: number) => {
    setCurrentMonth(prev => addMonths(prev, direction));
  };

  const addTransaction = async (transaction: {
    descrizione: string;
    importo: number;
    tipo: 'ENTRATA' | 'USCITA';
    data_scadenza_mese: string;
    categoria: CategoriaUscita | null;
    conto_bancario_id: string;
    tipo_movimento: TipoMovimento;
    pagato: boolean;
  }) => {
    const { data, error } = await supabase
      .from('transazioni')
      .insert({
        descrizione: transaction.descrizione,
        importo: transaction.importo,
        tipo: transaction.tipo,
        data_scadenza_mese: transaction.data_scadenza_mese,
        data_scadenza_originale: transaction.data_scadenza_mese,
        categoria_uscita: transaction.categoria,
        conto_bancario_id: transaction.conto_bancario_id,
        tipo_movimento: transaction.tipo_movimento,
        pagato: transaction.pagato,
        data_pagamento: transaction.pagato ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) throw error;

    if (transaction.pagato && data) {
      const account = bankAccounts.find(a => a.id === transaction.conto_bancario_id);
      if (account) {
        const newBalance = transaction.tipo === 'ENTRATA'
          ? account.saldo_attuale + transaction.importo
          : account.saldo_attuale - transaction.importo;

        await supabase
          .from('conti_bancari')
          .update({ saldo_attuale: newBalance })
          .eq('id', transaction.conto_bancario_id);
      }
    }

    await Promise.all([fetchTransactions(), fetchAllTransactions(), fetchBankAccounts()]);
    return data;
  };

  const addTransfer = async (transfer: {
    importo: number;
    from_conto_bancario_id: string;
    to_conto_bancario_id: string;
  }) => {
    const fromAccount = bankAccounts.find(a => a.id === transfer.from_conto_bancario_id);
    const toAccount = bankAccounts.find(a => a.id === transfer.to_conto_bancario_id);

    if (!fromAccount || !toAccount) throw new Error('Conti non trovati');

    await supabase
      .from('conti_bancari')
      .update({ saldo_attuale: fromAccount.saldo_attuale - transfer.importo })
      .eq('id', transfer.from_conto_bancario_id);

    await supabase
      .from('conti_bancari')
      .update({ saldo_attuale: toAccount.saldo_attuale + transfer.importo })
      .eq('id', transfer.to_conto_bancario_id);

    await fetchBankAccounts();
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const currentTx = transactions.find(t => t.id === id) || allTransactions.find(t => t.id === id);
    
    if (updates.pagato !== undefined && currentTx) {
      const account = bankAccounts.find(a => a.id === currentTx.conto_bancario_id);
      if (account) {
        let newBalance = account.saldo_attuale;
        
        if (updates.pagato && !currentTx.pagato) {
          newBalance = currentTx.tipo === 'ENTRATA'
            ? account.saldo_attuale + Number(currentTx.importo)
            : account.saldo_attuale - Number(currentTx.importo);
        } else if (!updates.pagato && currentTx.pagato) {
          newBalance = currentTx.tipo === 'ENTRATA'
            ? account.saldo_attuale - Number(currentTx.importo)
            : account.saldo_attuale + Number(currentTx.importo);
        }

        await supabase
          .from('conti_bancari')
          .update({ saldo_attuale: newBalance })
          .eq('id', currentTx.conto_bancario_id);
      }
    }

    const { error } = await supabase
      .from('transazioni')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    await Promise.all([fetchTransactions(), fetchAllTransactions(), fetchBankAccounts()]);
  };

  const updateBankAccount = async (id: string, updates: Partial<BankAccount>) => {
    const { error } = await supabase
      .from('conti_bancari')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    await fetchBankAccounts();
  };

  const postponeTransaction = async (id: string, originalDate: string) => {
    const nextMonth = addMonths(new Date(originalDate), 1);
    const newDate = format(nextMonth, 'yyyy-MM-dd');

    await updateTransaction(id, { data_scadenza_mese: newDate });
  };

  const deleteTransaction = async (id: string) => {
    const tx = transactions.find(t => t.id === id) || allTransactions.find(t => t.id === id);
    
    if (tx && tx.pagato) {
      const account = bankAccounts.find(a => a.id === tx.conto_bancario_id);
      if (account) {
        const newBalance = tx.tipo === 'ENTRATA'
          ? account.saldo_attuale - Number(tx.importo)
          : account.saldo_attuale + Number(tx.importo);

        await supabase
          .from('conti_bancari')
          .update({ saldo_attuale: newBalance })
          .eq('id', tx.conto_bancario_id);
      }
    }

    const { error } = await supabase
      .from('transazioni')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await Promise.all([fetchTransactions(), fetchAllTransactions(), fetchBankAccounts()]);
  };

  return {
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
  };
};
