import { DateFormat } from "../utils/DateFormat.js";
import { Compte } from "./Compte.js";
import { TypeTransaction } from "./TypeTransaction.js";

export class Transaction {
  constructor (
    private _id: number,
    private _montant: number,
    private _date: Date,
    private _type: TypeTransaction,
    private _compte: Compte,
  ) {}

  get id(): number { return this._id; }
  get montant(): number { return this._montant; }
  get date(): Date { return this._date; }
  get type(): TypeTransaction { return this._type; }
  get compte(): Compte { return this._compte; }

  toString(): string {
    return (
      `\nID: ${this.id}` +
      `\nMontant: ${this.montant}` +
      `\nType de transaction: ${this.type}` +
      `\nDate de transaction: ${DateFormat.formatDate(this.date)}`
    );
  }
}
