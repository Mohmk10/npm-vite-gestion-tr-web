import { Transaction } from "../entity/Transaction.js";
import { CompteRepository } from "../repository/CompteRepository.js";
import { CompteRepositoryImpl } from "../repository/CompteRepositoryImpl.js";
import { TransactionRepository } from "../repository/TransactionRepository.js";
import { TransactionRepositoryImpl } from "../repository/TransactionRepositoryImpl.js";
import { TransactionService } from "./TransactionService.js";

export class TransactionServiceImpl implements TransactionService {
  private readonly transactionRepository: TransactionRepository = new TransactionRepositoryImpl();
  private readonly compteRepository: CompteRepository = new CompteRepositoryImpl();

  async addTransaction(transaction: Transaction): Promise<Transaction | null> {
    const saved = await this.transactionRepository.save(transaction);
    if (saved) {
      await this.compteRepository.updateSolde(transaction.compte.id, transaction.compte.solde);
    }
    return saved;
  }

  getTransactionById(id: number): Promise<Transaction | null> {
    return this.transactionRepository.findById(id);
  }

  findByCompteId(compteId: number): Promise<Transaction[]> {
    return this.transactionRepository.findByCompteId(compteId);
  }

  getAllTransactions(): Promise<Transaction[]> {
    return this.transactionRepository.findAll();
  }
}
