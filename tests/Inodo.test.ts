import { describe, expect, it } from "vitest";
import { Inodo } from "../src/modelos/Inodo";

describe("Inodo", () => {
  it("guarda el nombre y el tamaño en bloques", () => {
    const inodo = new Inodo("docA.txt", 4);

    expect(inodo.nombre).toBe("docA.txt");
    expect(inodo.tamanioBloques).toBe(4);
    expect(inodo.bloquesAsignados).toEqual([]);
  });

  it("agrega los bloques en el orden en que se asignan", () => {
    const inodo = new Inodo("docA.txt", 3);

    inodo.agregarBloque(2);
    inodo.agregarBloque(8);
    inodo.agregarBloque(20);

    expect(inodo.bloquesAsignados).toEqual([2, 8, 20]);
  });

  it("devuelve una copia de la lista de bloques", () => {
    const inodo = new Inodo("docA.txt", 1);
    inodo.agregarBloque(5);

    const copia = inodo.bloquesAsignados as number[];
    copia.push(99);

    expect(inodo.bloquesAsignados).toEqual([5]);
  });
});
