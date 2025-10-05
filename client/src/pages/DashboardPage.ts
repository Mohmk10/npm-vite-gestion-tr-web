import { Api } from "../api";

export function DashboardPage(): string {
  return `
  <main class="section">
    <h1 class="text-3xl font-semibold">Tableau de bord</h1>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="stats shadow">
        <div class="stat">
          <div class="stat-title">Nombre de comptes</div>
          <div id="stat-comptes" class="stat-value">—</div>
        </div>
      </div>
    </div>
  </main>
  `;
}

export async function hydrateDashboardPage() {
  const el = document.getElementById("stat-comptes");
  if (!el) return;
  try {
    const comptes = await Api.getComptes();
    el.textContent = String(comptes.length);
  } catch {
    el.textContent = "0";
  }
}

