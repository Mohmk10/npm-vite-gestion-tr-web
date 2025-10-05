import { Compte } from "../entity/Compte.js";
import { CompteRepository } from "../repository/CompteRepository.js";
import { CompteRepositoryImpl } from "../repository/CompteRepositoryImpl.js";
import { CompteService } from "./CompteService.js";

export class CompteServiceImpl implements CompteService {
  private readonly compteRepository: CompteRepository = new CompteRepositoryImpl();

  addCompte(compte: Compte): Promise<Compte | null> {
    return this.compteRepository.save(compte);
  }

  numeroExiste(numero: string): Promise<boolean> {
    return this.compteRepository.existsByNumero(numero);
  }

  getCompteById(id: number): Promise<Compte | null> {
    return this.compteRepository.findById(id);
  }

  getAllComptes(): Promise<Compte[]> {
    return this.compteRepository.findAll();
  }
}
