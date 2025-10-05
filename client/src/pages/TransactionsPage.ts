export function TransactionsPage(): string {
  return `
    <section class="space-y-4">
      <h1 class="text-2xl font-bold">Transactions</h1>
      <ul class="space-y-2">
        <li class="rounded-lg border bg-white p-3 shadow-sm">
          <div class="flex items-center justify-between">
            <span>Dépôt</span>
            <span class="font-medium">+12000</span>
          </div>
          <p class="text-xs text-gray-500">2025-10-04</p>
        </li>
      </ul>
    </section>
  `;
}
