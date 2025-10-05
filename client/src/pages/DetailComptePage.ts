import { Api, type Transaction as Tx } from "../api";

function q<T extends HTMLElement>(sel: string, root: ParentNode = document): T {
  return root.querySelector(sel) as T;
}

export function DetailComptePage(): string {
  return `
  <main class="section">
    <a data-link href="/comptes" class="link">← Retour</a>
    <h1 id="compte-title" class="text-2xl font-semibold">Compte</h1>

    <div class="grid md:grid-cols-3 gap-6">
      <section class="card bg-base-100 shadow md:col-span-2">
        <div class="card-body">
          <h2 class="font-semibold mb-2">Historique</h2>
          <ul id="historique" class="divide-y divide-base-200">
            <li class="py-3 text-sm text-base-content/60">Chargement…</li>
          </ul>
        </div>
      </section>

      <aside class="card bg-base-100 shadow">
        <div class="card-body gap-3">
          <div class="text-xs text-base-content/60">Solde</div>
          <div id="solde" class="text-3xl font-bold">—</div>
          <div class="text-xs text-base-content/60">Type</div>
          <div id="type">—</div>
        </div>
      </aside>
    </div>

    <h2 class="text-2xl font-semibold">Nouvelle transaction</h2>

    <form id="tx-form" class="card bg-base-100 shadow max-w-xl">
      <div class="card-body gap-4">
        <label class="form-control">
          <div class="label"><span class="label-text">Montant</span></div>
          <input name="montant" type="number" min="1" class="input input-bordered" placeholder="210000" required />
        </label>

        <label class="form-control">
          <div class="label"><span class="label-text">N° de compte</span></div>
          <input id="numero" class="input input-bordered" readonly />
        </label>

        <label class="form-control">
          <div class="label"><span class="label-text">Type de transaction</span></div>
          <select name="type" class="select select-bordered">
            <option value="DEPOT">Dépôt</option>
            <option value="RETRAIT">Retrait</option>
          </select>
        </label>

        <div class="flex gap-2 pt-2">
          <button type="submit" class="btn btn-primary">Valider</button>
          <a data-link href="/detail-compte" id="cancel-link" class="btn">Annuler</a>
        </div>
        <p id="msg" class="text-sm"></p>
      </div>
    </form>
  </main>
  `;
}

export async function hydrateDetailComptePage() {
  const params = new URLSearchParams(location.search);
  const idStr = params.get("id");
  const id = idStr ? Number(idStr) : NaN;

  const title = q<HTMLHeadingElement>("#compte-title");
  const numeroInput = q<HTMLInputElement>("#numero");
  const soldeEl = q<HTMLDivElement>("#solde");
  const typeEl = q<HTMLDivElement>("#type");
  const hist = q<HTMLUListElement>("#historique");
  const form = q<HTMLFormElement>("#tx-form");
  const msg = q<HTMLParagraphElement>("#msg");
  const cancelLink = q<HTMLAnchorElement>("#cancel-link");

  if (!id || Number.isNaN(id)) {
    title.textContent = "Compte introuvable";
    hist.innerHTML = `<li class="py-3 text-error">Paramètre ?id manquant</li>`;
    form.style.display = "none";
    return;
  }

  const renderHistorique = (txs: Tx[]) => {
    if (!txs.length) {
      hist.innerHTML = `<li class="py-3 text-sm text-base-content/60">Aucune transaction</li>`;
      return;
    }
    hist.innerHTML = txs.map(t => {
      const isDepot = t.type === "DEPOT";
      const sign = isDepot ? "+" : "−";
      const color = isDepot ? "text-success" : "text-error";
      const montant = `${sign} ${Number(t.montant).toLocaleString("fr-FR")} F`;
      const date = new Date(t.date as any).toLocaleDateString("fr-FR");
      const lib = isDepot ? "Dépôt" : "Retrait";
      return `
        <li class="py-3 flex justify-between">
          <span class="font-medium ${color}">${montant}</span>
          <span class="text-sm text-base-content/60">${date} · ${lib}</span>
        </li>
      `;
    }).join("");
  };

  async function refreshAll() {
    const c = await Api.getCompte(id);
    title.textContent = `Co.${c.numero}`;
    numeroInput.value = c.numero;
    soldeEl.textContent = `${Number(c.solde).toLocaleString("fr-FR")} F`;
    soldeEl.classList.toggle("text-success", true);
    typeEl.textContent = c.type === "CHEQUE" ? "Compte chèque" : "Compte épargne";

    const txs = await Api.getTransactionsByCompte(c.id);
    renderHistorique(txs);

    cancelLink.setAttribute("href", `/detail-compte?id=${c.id}`);
  }

  try {
    await refreshAll();
  } catch (e: any) {
    msg.textContent = `Erreur: ${e.error || e.message}`;
    msg.classList.add("text-error");
    form.style.display = "none";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.classList.remove("text-error");
    msg.textContent = "Traitement…";

    const fd = new FormData(form);
    const montant = Number(fd.get("montant"));
    const type = String(fd.get("type") || "DEPOT") as "DEPOT" | "RETRAIT";

    if (!montant || montant <= 0) {
      msg.textContent = "Montant invalide";
      msg.classList.add("text-error");
      return;
    }

    try {
      await Api.createTransaction({ compteId: id, montant, type });
      msg.textContent = "Transaction effectuée ✔";
      (form.querySelector('input[name="montant"]') as HTMLInputElement).value = "";
      await refreshAll();
    } catch (e: any) {
      msg.textContent = `Erreur: ${e.error || e.message}`;
      msg.classList.add("text-error");
    }
  });
}
