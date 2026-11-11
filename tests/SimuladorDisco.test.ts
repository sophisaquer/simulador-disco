import { describe, expect, it } from "vitest";
import { SimuladorDisco } from "../src/modelos/SimuladorDisco";

describe("SimuladorDisco", () => {
  describe("creación del disco", () => {
    it("tiene 64 bloques libres por defecto", () => {
      const simulador = new SimuladorDisco();

      expect(simulador.totalBloques).toBe(64);
      expect(simulador.obtenerBloques().every((b) => b === null)).toBe(true);
    });

    it("permite indicar otro tamaño de disco", () => {
      const simulador = new SimuladorDisco(128);

      expect(simulador.obtenerBloques()).toHaveLength(128);
    });

    it("rechaza un total de bloques inválido", () => {
      expect(() => new SimuladorDisco(0)).toThrow();
      expect(() => new SimuladorDisco(-5)).toThrow();
      expect(() => new SimuladorDisco(10.5)).toThrow();
    });
  });

  describe("crearArchivo", () => {
    it("asigna los primeros bloques libres y crea el inodo", () => {
      const simulador = new SimuladorDisco();

      const bloques = simulador.crearArchivo("docA.txt", 4);

      expect(bloques).toEqual([0, 1, 2, 3]);
      expect(simulador.obtenerBloques().slice(0, 5)).toEqual([
        "docA.txt",
        "docA.txt",
        "docA.txt",
        "docA.txt",
        null,
      ]);
      expect(simulador.obtenerInodos()).toEqual([
        { nombre: "docA.txt", tamanioBloques: 4, bloquesAsignados: [0, 1, 2, 3] },
      ]);
    });

    it("asigna bloques no contiguos (asignación indexada)", () => {
      const simulador = new SimuladorDisco(10);
      simulador.crearArchivo("a", 2); // 0-1
      simulador.crearArchivo("b", 2); // 2-3
      simulador.crearArchivo("c", 2); // 4-5
      simulador.eliminarArchivo("b");

      const bloques = simulador.crearArchivo("d", 4);

      expect(bloques).toEqual([2, 3, 6, 7]);
    });

    it("rechaza un nombre duplicado", () => {
      const simulador = new SimuladorDisco();
      simulador.crearArchivo("docA.txt", 4);

      expect(() => simulador.crearArchivo("docA.txt", 2)).toThrow(
        "el archivo 'docA.txt' ya existe"
      );
    });

    it("rechaza el archivo si no hay espacio suficiente", () => {
      const simulador = new SimuladorDisco(8);
      simulador.crearArchivo("a", 6);

      expect(() => simulador.crearArchivo("b", 3)).toThrow(
        "espacio en disco insuficiente / bloques agotados"
      );
    });

    it("no modifica el disco cuando falla por falta de espacio", () => {
      const simulador = new SimuladorDisco(8);
      simulador.crearArchivo("a", 6);
      const antes = simulador.obtenerBloques();

      expect(() => simulador.crearArchivo("b", 3)).toThrow();
      expect(simulador.obtenerBloques()).toEqual(antes);
      expect(simulador.obtenerInodos()).toHaveLength(1);
    });

    it("permite llenar el disco exactamente", () => {
      const simulador = new SimuladorDisco(8);

      simulador.crearArchivo("a", 8);

      expect(simulador.calcularMetricas().bloquesLibres).toBe(0);
    });

    it("rechaza un nombre vacío o un tamaño inválido", () => {
      const simulador = new SimuladorDisco();

      expect(() => simulador.crearArchivo("", 2)).toThrow();
      expect(() => simulador.crearArchivo("a", 0)).toThrow();
      expect(() => simulador.crearArchivo("a", -1)).toThrow();
      expect(() => simulador.crearArchivo("a", 1.5)).toThrow();
    });
  });

  describe("eliminarArchivo", () => {
    it("libera sólo los bloques del inodo y lo borra de la tabla", () => {
      const simulador = new SimuladorDisco(8);
      simulador.crearArchivo("a", 3);
      simulador.crearArchivo("b", 3);

      simulador.eliminarArchivo("a");

      expect(simulador.obtenerBloques()).toEqual([
        null, null, null, "b", "b", "b", null, null,
      ]);
      expect(simulador.obtenerInodos().map((i) => i.nombre)).toEqual(["b"]);
    });

    it("rechaza un archivo inexistente", () => {
      const simulador = new SimuladorDisco();

      expect(() => simulador.eliminarArchivo("noexiste.txt")).toThrow(
        "archivo 'noexiste.txt' no encontrado"
      );
    });
  });

  describe("calcularMetricas", () => {
    it("calcula ocupados, libres y porcentaje de ocupación", () => {
      const simulador = new SimuladorDisco(64);
      simulador.crearArchivo("a", 16);

      const metricas = simulador.calcularMetricas();

      expect(metricas.totalBloques).toBe(64);
      expect(metricas.bloquesOcupados).toBe(16);
      expect(metricas.bloquesLibres).toBe(48);
      expect(metricas.porcentajeOcupacion).toBe(25);
    });
  });

  describe("calcularFragmentacionExterna", () => {
    it("es 0 % cuando el espacio libre está en un solo hueco", () => {
      const simulador = new SimuladorDisco(64);
      simulador.crearArchivo("a", 10);

      expect(simulador.calcularFragmentacionExterna()).toBe(0);
    });

    it("es 0 % cuando no hay bloques libres", () => {
      const simulador = new SimuladorDisco(4);
      simulador.crearArchivo("a", 4);

      expect(simulador.calcularFragmentacionExterna()).toBe(0);
    });

    it("aplica la fórmula con el mayor hueco contiguo libre", () => {
      const simulador = new SimuladorDisco(10);
      simulador.crearArchivo("a", 2); // 0-1
      simulador.crearArchivo("b", 2); // 2-3
      simulador.crearArchivo("c", 2); // 4-5
      simulador.eliminarArchivo("b"); // libres: 2-3 y 6-9

      const metricas = simulador.calcularMetricas();

      expect(metricas.mayorHuecoLibre).toBe(4);
      expect(metricas.bloquesLibres).toBe(6);
      expect(metricas.fragmentacionExterna).toBeCloseTo((1 - 4 / 6) * 100);
    });
  });

  describe("caso de prueba de la guía de la cátedra", () => {
    it("guarda docD.txt en bloques no contiguos gracias al inodo", () => {
      const simulador = new SimuladorDisco(64);
      simulador.crearArchivo("docA.txt", 4);
      simulador.crearArchivo("docB.txt", 4);
      simulador.crearArchivo("docC.txt", 4);
      simulador.eliminarArchivo("docB.txt");

      expect(simulador.calcularMetricas().mayorHuecoLibre).toBe(52);
      expect(simulador.calcularFragmentacionExterna()).toBeCloseTo(
        (1 - 52 / 56) * 100
      );

      const bloques = simulador.crearArchivo("docD.txt", 6);

      expect(bloques).toEqual([4, 5, 6, 7, 12, 13]);
      expect(simulador.calcularMetricas().bloquesOcupados).toBe(14);
    });
  });
});
