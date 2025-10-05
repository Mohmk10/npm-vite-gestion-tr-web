import { Database } from "../utils/Database.js";
import { Transaction } from "../entity/Transaction.js";
import { TransactionRepository } from "./TransactionRepository.js";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise.js";
import { CompteRepositoryImpl } from "./CompteRepositoryImpl.js";
import { TypeTransaction } from "../entity/TypeTransaction.js";
import { DateFormat } from "../utils/DateFormat.js";

export class TransactionRepositoryImpl implements TransactionRepository {
  private readonly db: Database = Database.getInstance();
  private readonly compteRepo: CompteRepositoryImpl = new CompteRepositoryImpl();

  async save(transaction: Transaction): Promise<Transaction | null> {
    const sql =
      "INSERT INTO `transaction` (montant, date_transaction, type, compte_id) VALUES (?, ?, ?, ?)";
    try {
      const [res] = await this.db.execute<ResultSetHeader>(sql, [
        transaction.montant,
        DateFormat.toSqlDate(transaction.date),
        transaction.type,
        transaction.compte.id,
      ]);
      const insertId = res.insertId;
      return new Transaction(
        insertId,
        transaction.montant,
        transaction.date,
        transaction.type,
        transaction.compte
      );
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  async findById(id: number): Promise<Transaction | null> {
    const sql = "SELECT * FROM `transaction` WHERE id = ?";
    try {
      const rows = await this.db.queryRows<RowDataPacket[]>(sql, [id]);
      const row = rows[0];
      if (row) return this.mapTransaction(row);
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  async findByCompteId(compteId: number): Promise<Transaction[]> {
    const sql = "SELECT * FROM `transaction` WHERE compte_id = ?";
    const out: Transaction[] = [];
    try {
      const rows = await this.db.queryRows<RowDataPacket[]>(sql, [compteId]);
      for (const row of rows) {
        const t = await this.mapTransaction(row);
        if (t) out.push(t);
      }
    } catch (error) {
      console.error(error);
    }
    return out;
  }

  async findAll(): Promise<Transaction[]> {
    const sql = "SELECT * FROM `transaction`";
    const out: Transaction[] = [];
    try {
      const rows = await this.db.queryRows<RowDataPacket[]>(sql);
      for (const row of rows) {
        const t = await this.mapTransaction(row);
        if (t) out.push(t);
      }
    } catch (error) {
      console.error(error);
    }
    return out;
  }

  private async mapTransaction(row: RowDataPacket): Promise<Transaction | null> {
    const id = Number(row.id);
    const montant =
      typeof row.montant === "number" ? row.montant : parseFloat(row.montant);
    const date =
      row.date_transaction instanceof Date
        ? row.date_transaction
        : new Date(row.date_transaction);
    const type = String(row.type) as TypeTransaction;

    const compteId = Number(row.compte_id);
    const compte = await this.compteRepo.findById(compteId);

    if (compte) {
      return new Transaction(id, montant, date, type, compte);
    }
    return null;
  }
}
