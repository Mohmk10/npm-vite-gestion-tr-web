import { Compte } from "../entity/Compte.js";

export interface CompteRepository {
  save(compte: Compte): Promise<Compte | null>;
  existsByNumero(numero: string): Promise<boolean>;
  updateSolde(compteId: number, nouveauSolde: number): Promise<void>;
  findById(id: number): Promise<Compte | null>;
  findAll(): Promise<Compte[]>;
}
