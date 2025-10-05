import { Api, type Transaction, type Compte } from "../api";

export function ListTransactionsPage(): string {
  return `
  <main class="section">
    <h1 class="text-3xl font-semibold">Transactions</h1>

    <input id="filter-id" class="input input-bordered max-w-xs" placeholder="Filtrer par N° compte…" />

    <div class="table-wrap mt-4">
      <table class="table table-sm w-full">
        <thead class="bg-base-200">
          <tr>
            <th>N° Compte</th><th>Montant</th><th>Type</th><th>Date</th>
          </tr>
        </thead>
        <tbody id="tx-tbody"></tbody>
      </table>
    </div>
  </main>
  `;
}

export async function hydrateListTransactionsPage() {
  const tbody = document.getElementById("tx-tbody") as HTMLTableSectionElement;
  const filter = document.getElementById("filter-id") as HTMLInputElement;

  let data: Transaction[] = [];
  let indexNumeroById = new Map<number, string>();

  const numeroOf = (t: Transaction) => {
    if (t.compte?.numero) return t.compte.numero;
    if (t.compteId && indexNumeroById.has(t.compteId)) return indexNumeroById.get(t.compteId)!;
    return "?";
  };

  const renderRows = (rows: Transaction[]) => {
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="p-4">Aucune transaction</td></tr>`;
      return;
    }
    tbody.innerHTML = rows.map(t => {
      const numero = numeroOf(t);
      const isDepot = t.type === "DEPOT";
      const badgeCls = isDepot ? "badge-success" : "badge-error";
      const sign = isDepot ? "+ " : "− ";
      const montantFmt = `${sign}${Number(t.montant).toLocaleString("fr-FR")} F`;
      const dateFmt = new Date(t.date as any).toLocaleDateString("fr-FR");

      return `
        <tr>
          <td>${numero}</td>
          <td><span class="badge ${badgeCls}">${montantFmt}</span></td>
          <td>${isDepot ? "Dépôt" : "Retrait"}</td>
          <td>${dateFmt}</td>
        </tr>
      `;
    }).join("");
  };

  tbody.innerHTML = `<tr><td colspan="4" class="p-4">Chargement…</td></tr>`;
  try {
    const comptes = await Api.getComptes();
    indexNumeroById = new Map<number, string>(comptes.map((c: Compte) => [c.id, c.numero]));

    data = await Api.getTransactions();
    renderRows(data);
  } catch (e: any) {
    tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-error">Erreur: ${e.error || e.message}</td></tr>`;
  }

  filter?.addEventListener("input", () => {
    const q = filter.value.trim();
    if (!q) return renderRows(data);
    renderRows(
      data.filter(t => numeroOf(t).includes(q))
    );
  });
}
