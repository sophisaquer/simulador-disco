import { IInodo } from "../interfaces/IInodo";
import { IMetricas } from "../interfaces/IMetricas";

const BLOQUES_POR_FILA = 16;

export function mostrarMenu(): string {
  return [
    "",
    "=======================================",
    "   SIMULADOR DE SISTEMA DE ARCHIVOS",
    "=======================================",
    "1. Crear archivo",
    "2. Eliminar archivo",
    "3. Ver mapa de bloques",
    "4. Ver tabla de Inodos y métricas",
    "5. Salir",
  ].join("\n");
}

// [O] = bloque ocupado, [L] = bloque libre
export function mostrarMapa(bloques: readonly (string | null)[]): string {
  const ancho = String(bloques.length - 1).length;
  const lineas = ["", "Mapa del Disco ([O] ocupado, [L] libre):"];

  for (let inicio = 0; inicio < bloques.length; inicio += BLOQUES_POR_FILA) {
    const fila = bloques
      .slice(inicio, inicio + BLOQUES_POR_FILA)
      .map((bloque) => (bloque === null ? "[L]" : "[O]"))
      .join("");

    lineas.push(`${String(inicio).padStart(ancho)} ${fila}`);
  }

  return lineas.join("\n");
}

export function mostrarTablaInodos(inodos: readonly IInodo[]): string {
  if (inodos.length === 0) {
    return "\nTabla de Inodos: (vacía)";
  }

  const ancho = Math.max(6, ...inodos.map((inodo) => inodo.nombre.length));
  const lineas = [
    "",
    "Tabla de Inodos:",
    `${"Nombre".padEnd(ancho)}  Tamaño  Bloques asignados`,
    `${"-".repeat(ancho)}  ------  -----------------`,
  ];

  for (const inodo of inodos) {
    lineas.push(
      `${inodo.nombre.padEnd(ancho)}  ${String(inodo.tamanioBloques).padStart(6)}  [${inodo.bloquesAsignados.join(", ")}]`
    );
  }

  return lineas.join("\n");
}

export function mostrarMetricas(metricas: IMetricas): string {
  return [
    "",
    "Métricas del almacenamiento:",
    `Total de bloques:        ${metricas.totalBloques}`,
    `Bloques ocupados:        ${metricas.bloquesOcupados}`,
    `Bloques libres:          ${metricas.bloquesLibres}`,
    `Ocupación del disco:     ${metricas.porcentajeOcupacion.toFixed(2)} %`,
    `Mayor hueco libre:       ${metricas.mayorHuecoLibre} bloques`,
    `Fragmentación externa:   ${metricas.fragmentacionExterna.toFixed(2)} %`,
  ].join("\n");
}
