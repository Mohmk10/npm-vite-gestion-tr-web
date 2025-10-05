export function Header(): string {
  return `
  <header class="bg-base-100 border-b border-base-200">
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-xl bg-neutral"></div>
        <span class="font-semibold">Gestion Transaction</span>
      </div>
      <nav class="flex items-center gap-2 text-sm">
        <a data-link href="/dashboard"    class="btn btn-ghost btn-sm">Tableau de bord</a>
        <a data-link href="/comptes"      class="btn btn-ghost btn-sm">Comptes</a>
        <a data-link href="/transactions" class="btn btn-ghost btn-sm">Transactions</a>
      </nav>
    </div>
  </header>`;
}
