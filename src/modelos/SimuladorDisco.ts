import { ISimuladorDisco } from "../interfaces/ISimuladorDisco";
import { IInodo } from "../interfaces/IInodo";
import { IMetricas } from "../interfaces/IMetricas";
import { Inodo } from "./Inodo";

export class SimuladorDisco implements ISimuladorDisco {
  // null indica bloque libre; si no, guarda el nombre del archivo
  private readonly bloques: (string | null)[];
  private readonly tablaInodos = new Map<string, Inodo>();

  constructor(public readonly totalBloques: number = 64) {
    if (!Number.isInteger(totalBloques) || totalBloques <= 0) {
      throw new Error("el total de bloques debe ser un entero positivo");
    }

    this.bloques = new Array<string | null>(totalBloques).fill(null);
  }

  crearArchivo(nombre: string, tamanioBloques: number): readonly number[] {
    if (nombre.trim() === "") {
      throw new Error("el nombre del archivo no puede estar vacío");
    }

    if (!Number.isInteger(tamanioBloques) || tamanioBloques <= 0) {
      throw new Error("el tamaño debe ser un entero positivo de bloques");
    }

    // 1. validar nombre duplicado
    if (this.tablaInodos.has(nombre)) {
      throw new Error(`el archivo '${nombre}' ya existe`);
    }

    // 2. buscar bloques libres
    const bloquesLibres = this.obtenerIndicesLibres();

    if (bloquesLibres.length < tamanioBloques) {
      throw new Error("espacio en disco insuficiente / bloques agotados");
    }

    // 3. asignación indexada: toma los primeros bloques libres,
    // aunque no estén contiguos
    const inodo = new Inodo(nombre, tamanioBloques);

    for (let i = 0; i < tamanioBloques; i++) {
      const indice = bloquesLibres[i];
      this.bloques[indice] = nombre;
      inodo.agregarBloque(indice);
    }

    this.tablaInodos.set(nombre, inodo);
    return inodo.bloquesAsignados;
  }

  eliminarArchivo(nombre: string): void {
    const inodo = this.tablaInodos.get(nombre);

    if (inodo === undefined) {
      throw new Error(`archivo '${nombre}' no encontrado`);
    }

    // se recorren sólo los bloques del inodo, sin buscar en todo el disco
    for (const indice of inodo.bloquesAsignados) {
      this.bloques[indice] = null;
    }

    this.tablaInodos.delete(nombre);
  }

  obtenerBloques(): readonly (string | null)[] {
    return [...this.bloques];
  }

  obtenerInodos(): readonly IInodo[] {
    return [...this.tablaInodos.values()].map((inodo) => ({
      nombre: inodo.nombre,
      tamanioBloques: inodo.tamanioBloques,
      bloquesAsignados: inodo.bloquesAsignados,
    }));
  }

  calcularMetricas(): IMetricas {
    const bloquesLibres = this.obtenerIndicesLibres().length;
    const bloquesOcupados = this.totalBloques - bloquesLibres;

    return {
      totalBloques: this.totalBloques,
      bloquesOcupados,
      bloquesLibres,
      porcentajeOcupacion: (bloquesOcupados / this.totalBloques) * 100,
      mayorHuecoLibre: this.calcularMayorHuecoLibre(),
      fragmentacionExterna: this.calcularFragmentacionExterna(),
    };
  }

  calcularFragmentacionExterna(): number {
    const bloquesLibres = this.obtenerIndicesLibres().length;

    if (bloquesLibres === 0) {
      return 0;
    }

    return (1 - this.calcularMayorHuecoLibre() / bloquesLibres) * 100;
  }

  // secuencia consecutiva más larga de bloques libres
  private calcularMayorHuecoLibre(): number {
    let mayor = 0;
    let actual = 0;

    for (const bloque of this.bloques) {
      if (bloque === null) {
        actual++;
        mayor = Math.max(mayor, actual);
      } else {
        actual = 0;
      }
    }

    return mayor;
  }

  private obtenerIndicesLibres(): number[] {
    const libres: number[] = [];

    this.bloques.forEach((bloque, indice) => {
      if (bloque === null) {
        libres.push(indice);
      }
    });

    return libres;
  }
}
