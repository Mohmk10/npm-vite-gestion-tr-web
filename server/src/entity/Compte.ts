import { TypeCompte } from "./TypeCompte.js";
import { DateFormat } from "../utils/DateFormat.js";

export abstract class Compte {
  constructor (
    protected _id: number,
    protected _numero: string,
    protected _solde: number,
    protected _dateOuverture: Date,
    protected _type: TypeCompte
  ) {}

  get id(): number { return this._id; }
  get numero(): string { return this._numero; }
  get solde(): number { return this._solde; }
  get dateOuverture(): Date { return this._dateOuverture; }
  get type(): TypeCompte { return this._type; }

  abstract depot(montant: number): void;
  abstract retrait(montant: number): boolean;

  toString(): string {
    return (
      `\nID: ${this.id}` +
      `\nNumero: ${this.numero}` +
      `\nSolde: ${this.solde}` +
      `\nType de compte: ${this.type}` +
      `\nDate d'ouverture: ${DateFormat.formatDate(this.dateOuverture)}`
    );
  }
}
