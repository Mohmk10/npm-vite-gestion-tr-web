import { Transaction } from "../entity/Transaction.js";

export interface TransactionService {
  addTransaction(transaction: Transaction): Promise<Transaction | null>;
  getTransactionById(id: number): Promise<Transaction | null>;
  findByCompteId(compteId: number): Promise<Transaction[]>;
  getAllTransactions(): Promise<Transaction[]>;
}
