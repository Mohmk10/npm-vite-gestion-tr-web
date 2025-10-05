import http from "node:http";
import { URL } from "node:url";

import { CompteServiceImpl } from "../services/CompteServiceImpl.js";
import { TransactionServiceImpl } from "../services/TransactionServiceImpl.js";

import { CompteCheque } from "../entity/CompteCheque.js";
import { CompteEpargne } from "../entity/CompteEpargne.js";
import { TypeCompte } from "../entity/TypeCompte.js";
import { Transaction } from "../entity/Transaction.js";
import { TypeTransaction } from "../entity/TypeTransaction.js";

function compteToDTO(c: any) {
  return {
    id: c.id,
    numero: c.numero,
    solde: c.solde,
    dateOuverture: c.dateOuverture,
    type: c.type,
  };
}

function transactionToDTO(t: any) {
  const c = t.compte;
  return {
    id: t.id,
    montant: t.montant,
    date: t.date,
    type: t.type,
    compteId: c?.id,
    compte: c ? compteToDTO(c) : null,
  };
}


const compteService = new CompteServiceImpl();
const transactionService = new TransactionServiceImpl();

const PORT = Number(process.env.PORT || 5174);

function write(res: http.ServerResponse, status: number, data: unknown) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(data));
}

async function readBody<T = any>(req: http.IncomingMessage): Promise<T | null> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  if (chunks.length === 0) return null;
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { return null; }
}

const server = http.createServer(async (req, res) => {
  if (!req.url || !req.method) return write(res, 404, { error: "Not found" });

  // Preflight CORS
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);


  if (url.pathname === "/api/health" && req.method === "GET") {
    return write(res, 200, { ok: true });
  }


  if (url.pathname === "/api/comptes" && req.method === "GET") {
    const comptes = await compteService.getAllComptes();
    return write(res, 200, comptes);
  }

  if (url.pathname === "/api/comptes" && req.method === "POST") {
    const body = await readBody<{
      numero?: string;
      type?: "CHEQUE" | "EPARGNE";
      dureeBlocage?: number;
    }>(req);

    if (!body?.numero || !body.type) {
      return write(res, 400, { error: "numero et type requis" });
    }
    const numeroExiste = await compteService.numeroExiste(body.numero);
    if (numeroExiste) return write(res, 409, { error: "numero déjà utilisé" });

    const now = new Date();
    const compte =
      body.type === TypeCompte.CHEQUE
        ? new CompteCheque(0, body.numero, 0, now)
        : new CompteEpargne(0, body.numero, 0, now, now, Number(body.dureeBlocage || 0));

    const saved = await compteService.addCompte(compte);
    return saved ? write(res, 201, saved) : write(res, 500, { error: "insert compte échoué" });
  }

  if (url.pathname.startsWith("/api/comptes/") && req.method === "GET") {
    const id = Number(url.pathname.split("/").pop());
    if (Number.isNaN(id)) return write(res, 400, { error: "id invalide" });
    const c = await compteService.getCompteById(id);
    return c ? write(res, 200, c) : write(res, 404, { error: "compte introuvable" });
  }

  
  if (url.pathname === "/api/transactions" && req.method === "GET") {
    const byCompte = url.searchParams.get("compteId");
    if (byCompte) {
      const list = await transactionService.findByCompteId(Number(byCompte));
      return write(res, 200, list);
    }
    const list = await transactionService.getAllTransactions();
    return write(res, 200, list);
  }

    if (url.pathname === "/api/transactions" && req.method === "POST") {
    const body = await readBody<{
      compteId?: number;
      montant?: number;
      type?: string;
    }>(req);

    if (!body?.compteId || !body?.montant || !body?.type) {
      return write(res, 400, { error: "compteId, montant, type requis" });
    }

    
    let txType: TypeTransaction | null = null;
    if (body.type === "DEPOT") txType = TypeTransaction.DEPOT;
    else if (body.type === "RETRAIT") txType = TypeTransaction.RETRAIT;
    else return write(res, 400, { error: "type invalide (DEPOT|RETRAIT)" });

    const compte = await compteService.getCompteById(Number(body.compteId));
    if (!compte) return write(res, 404, { error: "compte introuvable" });

    
    if (txType === TypeTransaction.DEPOT) {
      compte.depot(body.montant);
    } else {
      const ok = compte.retrait(body.montant);
      if (!ok) {
        return write(res, 400, { error: "fonds insuffisants (ou blocage épargne)" });
      }
    }

    const tr = new Transaction(0, body.montant, new Date(), txType, compte);
    const saved = await transactionService.addTransaction(tr);
    return saved ? write(res, 201, saved) : write(res, 500, { error: "insert transaction échoué" });
  }

  return write(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT}`);
});
