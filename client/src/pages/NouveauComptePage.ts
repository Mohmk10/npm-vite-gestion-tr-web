import { Api } from "../api";

export function NouveauComptePage(): string {
  return `
  <main class="section">
    <a data-link href="/comptes" class="link">← Retour</a>
    <h1 class="text-2xl font-semibold">Nouveau compte</h1>

    <form id="form-compte" class="card bg-base-100 shadow max-w-xl">
      <div class="card-body gap-4">
        <label class="form-control">
          <div class="label"><span class="label-text">N° de compte</span></div>
          <input name="numero" class="input input-bordered" placeholder="77 913" required />
        </label>

        <label class="form-control">
          <div class="label"><span class="label-text">Type de compte</span></div>
          <select name="type" class="select select-bordered">
            <option value="CHEQUE">Compte chèque</option>
            <option value="EPARGNE">Compte épargne</option>
          </select>
        </label>

        <label class="form-control" id="blocage-wrap" style="display:none">
          <div class="label"><span class="label-text">Durée de blocage (mois)</span></div>
          <input name="dureeBlocage" type="number" min="0" class="input input-bordered" placeholder="6" />
        </label>

        <div class="flex gap-2 pt-2">
          <button type="submit" class="btn btn-primary join-item">Créer</button>
          <a data-link href="/comptes" class="btn join-item">Annuler</a>
        </div>
        <p id="msg" class="text-sm"></p>
      </div>
    </form>
  </main>
  `;
}

export function hydrateNouveauComptePage() {
  const form = document.getElementById("form-compte") as HTMLFormElement;
  const select = form.querySelector('select[name="type"]') as HTMLSelectElement;
  const blocWrap = document.getElementById("blocage-wrap")!;
  const msg = document.getElementById("msg")!;

  select.addEventListener("change", () => {
    blocWrap.style.display = select.value === "EPARGNE" ? "" : "none";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "Création…";
    const data = Object.fromEntries(new FormData(form).entries()) as any;
    const payload: any = { numero: data.numero, type: data.type };
    if (data.type === "EPARGNE" && data.dureeBlocage) payload.dureeBlocage = Number(data.dureeBlocage);

    try {
      await Api.createCompte(payload);
      msg.textContent = "Compte créé ✔";
      setTimeout(() => { (document.querySelector('a[data-link][href="/comptes"]') as HTMLAnchorElement)?.click(); }, 400);
    } catch (e: any) {
      msg.textContent = `Erreur: ${e.error || e.message}`;
      msg.classList.add("text-error");
    }
  });
}
