import { TypeCompte } from "./TypeCompte.js";
import { Compte } from "./Compte.js";

export class CompteCheque extends Compte {
  private static readonly FRAIS = 0.08;

  constructor(id: number, numero: string, solde: number, dateOuverture: Date) {
    super(id, numero, solde, dateOuverture, TypeCompte.CHEQUE);
  }

  depot(montant: number): void {
    const fact = montant * CompteCheque.FRAIS;
    this._solde += montant - fact;
  }

  retrait(montant: number): boolean {
    const fact = montant * CompteCheque.FRAIS;
    const total = montant + fact;
    if (this._solde >= total) {
      this._solde -= total;
      return true;
    }
    return false;
  }
}
