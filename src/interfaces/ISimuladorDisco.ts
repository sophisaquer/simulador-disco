import { IInodo } from "./IInodo";
import { IMetricas } from "./IMetricas";

export interface ISimuladorDisco {
  readonly totalBloques: number;

  crearArchivo(nombre: string, tamanioBloques: number): readonly number[];
  eliminarArchivo(nombre: string): void;

  obtenerBloques(): readonly (string | null)[];
  obtenerInodos(): readonly IInodo[];

  calcularMetricas(): IMetricas;
  calcularFragmentacionExterna(): number;
}
