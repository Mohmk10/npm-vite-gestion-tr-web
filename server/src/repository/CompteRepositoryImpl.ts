import { CompteRepository } from "./CompteRepository.js";
import { Database } from "../utils/Database.js";
import { Compte } from "../entity/Compte.js";
import { CompteCheque } from "../entity/CompteCheque.js";
import { CompteEpargne } from "../entity/CompteEpargne.js";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { TypeCompte } from "../entity/TypeCompte.js";
import { DateFormat } from "../utils/DateFormat.js";

export class CompteRepositoryImpl implements CompteRepository {
  private readonly db: Database = Database.getInstance();

  async save(compte: Compte): Promise<Compte | null> {
    const sqlCompte =
      "INSERT INTO compte (numero, solde, date_ouverture, type) VALUES (?, ?, ?, ?)";

    try {
      const [res] = await this.db.execute<ResultSetHeader>(sqlCompte, [
        compte.numero,
        compte.solde,
        DateFormat.toSqlDate(compte.dateOuverture),
        compte.type,
      ]);

      const insertId = res.insertId;

      if (compte instanceof CompteCheque) {
        await this.saveCompteCheque(insertId);
        return new CompteCheque(insertId, compte.numero, compte.solde, compte.dateOuverture);
      } else if (compte instanceof CompteEpargne) {
        const e = compte as CompteEpargne;
        await this.saveCompteEpargne(insertId, e.dateDebut, e.dureeBlocage);
        return new CompteEpargne(
          insertId,
          e.numero,
          e.solde,
          e.dateOuverture,
          e.dateDebut,
          e.dureeBlocage
        );
      }
    } catch (error) {
      console.error(error);
    }

    return null;
  }

  private async saveCompteCheque(compteId: number): Promise<void> {
    const sql = "INSERT INTO compte_cheque (id_compte) VALUES (?)";
    await this.db.execute(sql, [compteId]);
  }

  private async saveCompteEpargne(compteId: number, dateDebut: Date, duree: number): Promise<void> {
    const sql =
      "INSERT INTO compte_epargne (id_compte, date_debut, duree) VALUES (?, ?, ?)";
    await this.db.execute(sql, [compteId, DateFormat.toSqlDate(dateDebut), duree]);
  }

  async existsByNumero(numero: string): Promise<boolean> {
    const sql = "SELECT COUNT(*) as count FROM compte WHERE numero = ?";
    const rows = await this.db.queryRows<RowDataPacket[]>(sql, [numero]);
    return Number(rows[0].count) > 0;
  }

  async updateSolde(compteId: number, nouveauSolde: number): Promise<void> {
    const sql = "UPDATE compte SET solde = ? WHERE id = ?";
    await this.db.execute(sql, [nouveauSolde, compteId]);
  }

  async findById(id: number): Promise<Compte | null> {
    const sql = "SELECT * FROM compte WHERE id = ?";
    const rows = await this.db.queryRows<RowDataPacket[]>(sql, [id]);
    const compteData = rows[0];
    if (compteData) {
      return this.mapCompte(compteData);
    }
    return null;
  }

  async findAll(): Promise<Compte[]> {
    const comptes: Compte[] = [];
    const sql = "SELECT * FROM compte";
    const rows = await this.db.queryRows<RowDataPacket[]>(sql);
    for (const row of rows) {
      const c = await this.mapCompte(row);
      if (c) comptes.push(c);
    }
    return comptes;
  }

  private async mapCompte(row: RowDataPacket): Promise<Compte | null> {
    const type = String(row.type) as TypeCompte; // 'CHEQUE' | 'EPARGNE'
    const id = Number(row.id);
    const numero = String(row.numero);
    const solde =
      typeof row.solde === "number" ? row.solde : parseFloat(row.solde);
    const dateOuverture =
      row.date_ouverture instanceof Date
        ? row.date_ouverture
        : new Date(row.date_ouverture);

    if (type === TypeCompte.CHEQUE) {
      return new CompteCheque(id, numero, solde, dateOuverture);
    } else if (type === TypeCompte.EPARGNE) {
      return this.loadCompteEpargne(id, numero, solde, dateOuverture);
    }
    return null;
  }

  private async loadCompteEpargne(
    id: number,
    numero: string,
    solde: number,
    dateOuverture: Date
  ): Promise<CompteEpargne | null> {
    const sql =
      "SELECT date_debut, duree FROM compte_epargne WHERE id_compte = ?";
    const rows = await this.db.queryRows<RowDataPacket[]>(sql, [id]);
    const epargneData = rows[0];

    if (epargneData) {
      const dateDebut =
        epargneData.date_debut instanceof Date
          ? epargneData.date_debut
          : new Date(epargneData.date_debut);
      const duree = Number(epargneData.duree);
      return new CompteEpargne(id, numero, solde, dateOuverture, dateDebut, duree);
    }
    return null;
  }
}
