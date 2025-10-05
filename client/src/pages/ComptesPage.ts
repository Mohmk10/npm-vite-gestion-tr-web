import { Api, type Compte } from "../api";

export function ComptesPage(): string {
  return `
  <main class="section">
    <h1 class="text-3xl font-semibold">Comptes</h1>

    <div class="flex items-center gap-3">
      <input class="input input-bordered max-w-xs" placeholder="Rechercher…"/>
      <a data-link href="/nouveau-compte" class="btn btn-primary">Nouveau compte</a>
    </div>

    <div class="table-wrap mt-4">
      <table class="table table-sm w-full">
        <thead class="bg-base-200">
          <tr class="tr-divide-x">
            <th class="text-left">ID</th>
            <th class="text-left">N°</th>
            <th class="text-left">Type</th>
            <th class="text-left">Solde</th>
            <th class="text-left">Ouverture</th>
            <th class="text-right">Détails</th>
          </tr>
        </thead>
        <tbody id="comptes-tbody" class="[&>tr]:hover:bg-base-200/40 divide-y divide-base-200"></tbody>
      </table>
    </div>
  </main>
  `;
}

export async function hydrateComptesPage() {
  const tbody = document.getElementById("comptes-tbody") as HTMLTableSectionElement;
  tbody.innerHTML = `<tr><td colspan="6" class="p-4">Chargement…</td></tr>`;

  try {
    const comptes = await Api.getComptes();
    if (!comptes.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="p-4">Aucun compte</td></tr>`;
      return;
    }

    tbody.innerHTML = comptes.map((c: Compte) => `
      <tr class="tr-divide-x">
        <td>${c.id}</td>
        <td>${c.numero}</td>
        <td><span class="badge">${c.type === "CHEQUE" ? "Compte Chèque" : "Compte Épargne"}</span></td>
        <td>${c.solde.toLocaleString("fr-FR")} F</td>
        <td>${new Date(c.dateOuverture as any).toLocaleDateString("fr-FR")}</td>
        <td class="text-right">
          <a data-link href="/detail-compte?id=${c.id}" class="link">Voir</a>
        </td>
      </tr>
    `).join("");

  } catch (e: any) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-error">Erreur: ${e.error || e.message}</td></tr>`;
  }
}
