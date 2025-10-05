import { Compte } from "./Compte.js";
import { TypeCompte } from "./TypeCompte.js";

export class CompteEpargne extends Compte {
  constructor(
    id: number,
    numero: string,
    solde: number,
    dateOuverture: Date,
    private _dateDebut: Date,
    private _dureeBlocage: number
  ) {
    super(id, numero, solde, dateOuverture, TypeCompte.EPARGNE);
  }

  get dateDebut(): Date { return this._dateDebut; }
  get dureeBlocage(): number { return this._dureeBlocage; }

  depot(montant: number): void {
    this._solde += montant;
  }

  retrait(montant: number): boolean {
    const fin = new Date(this._dateDebut);
    fin.setMonth(fin.getMonth() + this._dureeBlocage);
    if (new Date() > fin && this._solde >= montant) {
      this._solde -= montant;
      return true;
    }
    return false;
  }
}
