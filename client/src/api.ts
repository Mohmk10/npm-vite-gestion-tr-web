export type TypeCompte = "CHEQUE" | "EPARGNE";
export type TypeTransaction = "DEPOT" | "RETRAIT";

export interface Compte {
  id: number;
  numero: string;
  solde: number;
  dateOuverture: string | Date;
  type: TypeCompte;
}

export interface Transaction {
  id: number;
  montant: number;
  date: string | Date;
  type: TypeTransaction;
  compte: Compte | null;
  compteId?: number;
}

function normCompte(raw: any): Compte {
  return {
    id: raw?.id ?? raw?._id,
    numero: raw?.numero ?? raw?._numero,
    solde: raw?.solde ?? raw?._solde ?? 0,
    dateOuverture: raw?.dateOuverture ?? raw?._dateOuverture ?? raw?.date_ouverture ?? raw?._date_ouverture,
    type: (raw?.type ?? raw?._type) as TypeCompte,
  };
}

function normTx(raw: any): Transaction {
  const rawCompte = raw?.compte ?? raw?._compte ?? null;
  const compte = rawCompte ? normCompte(rawCompte) : null;

  return {
    id: raw?.id ?? raw?._id,
    montant: raw?.montant ?? raw?._montant,
    date: raw?.date ?? raw?._date ?? raw?.date_transaction ?? raw?._date_transaction,
    type: (raw?.type ?? raw?._type) as TypeTransaction,
    compte,
    compteId:
      raw?.compteId ?? raw?.compte_id ??
      raw?._compteId ?? raw?._compte_id ??
      compte?.id,
  };
}

async function http<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw await res.json().catch(() => new Error(res.statusText));
  return res.json();
}

export const Api = {
  async getComptes(): Promise<Compte[]> {
    const data = await http<any[]>("/api/comptes");
    return (Array.isArray(data) ? data : []).map(normCompte);
  },

  async getCompte(id: number): Promise<Compte> {
    const raw = await http<any>(`/api/comptes/${id}`);
    return normCompte(raw);
  },

  async createCompte(data: { numero: string; type: TypeCompte; dureeBlocage?: number }): Promise<Compte> {
    const raw = await http<any>("/api/comptes", { method: "POST", body: JSON.stringify(data) });
    return normCompte(raw);
  },

  async getTransactions(): Promise<Transaction[]> {
    const data = await http<any[]>("/api/transactions");
    return (Array.isArray(data) ? data : []).map(normTx);
  },

  async getTransactionsByCompte(compteId: number): Promise<Transaction[]> {
    const data = await http<any[]>(`/api/transactions?compteId=${compteId}`);
    return (Array.isArray(data) ? data : []).map(normTx);
  },

  async createTransaction(data: { compteId: number; montant: number; type: TypeTransaction }): Promise<Transaction> {
    const raw = await http<any>("/api/transactions", { method: "POST", body: JSON.stringify(data) });
    return normTx(raw);
  },
};
