import { IInodo } from "../interfaces/IInodo";

export class Inodo implements IInodo {
  // lista de índices de bloques en disco (asignación indexada)
  private readonly bloques: number[] = [];

  constructor(
    public readonly nombre: string,
    public readonly tamanioBloques: number
  ) {}

  get bloquesAsignados(): readonly number[] {
    return [...this.bloques];
  }

  agregarBloque(indice: number): void {
    this.bloques.push(indice);
  }
}
