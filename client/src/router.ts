import { Header } from "./components/Header";

import { DashboardPage } from "./pages/DashboardPage";
import { ComptesPage } from "./pages/ComptesPage";
import { ListTransactionsPage } from "./pages/ListTransactionsPage";
import { NouveauComptePage } from "./pages/NouveauComptePage";
import { DetailComptePage } from "./pages/DetailComptePage";

import * as DashMod from "./pages/DashboardPage";
import * as ComptesMod from "./pages/ComptesPage";
import * as TxListMod from "./pages/ListTransactionsPage";
import * as NewCompteMod from "./pages/NouveauComptePage";
import * as DetailMod from "./pages/DetailComptePage";

type PageFn = () => string;

const routes: Record<string, PageFn> = {
  "/": DashboardPage,
  "/dashboard": DashboardPage,
  "/comptes": ComptesPage,
  "/transactions": ListTransactionsPage,
  "/nouveau-compte": NouveauComptePage,
  "/detail-compte": DetailComptePage,
};

const hydrates: Record<string, (() => void | Promise<void>) | undefined> = {
  "/": (DashMod as any).hydrateDashboardPage,
  "/dashboard": (DashMod as any).hydrateDashboardPage,
  "/comptes": (ComptesMod as any).hydrateComptesPage,
  "/transactions": (TxListMod as any).hydrateListTransactionsPage,
  "/nouveau-compte": (NewCompteMod as any).hydrateNouveauComptePage,
  "/detail-compte": (DetailMod as any).hydrateDetailComptePage,
};

function routeKey(inputPath: string): string {
  const url = new URL(inputPath, location.origin);
  const p = url.pathname;
  if (p.startsWith("/detail-compte")) return "/detail-compte";
  if (routes[p]) return p;
  return "/";
}

function currentPath(): string {
  return routeKey(location.pathname + location.search);
}

export function setActive(path: string) {
  document.querySelectorAll("header nav a[data-link]").forEach(a => {
    a.classList.remove("btn-active");
    const href = (a as HTMLAnchorElement).getAttribute("href") || "/";
    // /detail-compte => surbrillance "Comptes"
    const activeHref = path.startsWith("/detail-compte") ? "/comptes" : path;
    if (href === activeHref) a.classList.add("btn-active");
  });
}

export function render(path?: string) {
  const key = path ? routeKey(path) : currentPath();

  const app = document.getElementById("app") as HTMLDivElement;
  const page = routes[key] ?? DashboardPage;

  app.innerHTML = `${Header()}${page()}`;
  setActive(key);

  const h = hydrates[key];
  if (typeof h === "function") h();
}

// Navigation SPA
document.addEventListener("click", (e) => {
  const a = (e.target as HTMLElement).closest("a[data-link]") as HTMLAnchorElement | null;
  if (!a) return;
  const href = a.getAttribute("href");
  if (!href?.startsWith("/")) return;
  e.preventDefault();
  history.pushState({}, "", href);
  render(href);
});

window.addEventListener("popstate", () => render());

// Boot
render();
