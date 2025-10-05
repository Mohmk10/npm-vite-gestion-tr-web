import { Transaction } from "../entity/Transaction.js";

export interface TransactionRepository {
  save(transaction: Transaction): Promise<Transaction | null>;
  findById(id: number): Promise<Transaction | null>;
  findByCompteId(compteId: number): Promise<Transaction[]>;
  findAll(): Promise<Transaction[]>;
}
