import * as readline from "node:readline";
import { SimuladorDisco } from "../modelos/SimuladorDisco";
import {
  mostrarMapa,
  mostrarMenu,
  mostrarMetricas,
  mostrarTablaInodos,
} from "./vista";

const lector = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const lineas = lector[Symbol.asyncIterator]();

// muestra el texto y espera la próxima línea ingresada
async function preguntar(texto: string): Promise<string> {
  process.stdout.write(texto);
  const { value, done } = await lineas.next();

  if (done) {
    return "5"; // si se cierra la entrada, se sale del simulador
  }

  if (!process.stdin.isTTY) {
    console.log(value); // muestra lo leído cuando la entrada viene de un archivo
  }

  return value.trim();
}

async function crearSimulador(): Promise<SimuladorDisco> {
  while (true) {
    const respuesta = await preguntar(
      "Cantidad total de bloques del disco (Enter = 64): "
    );

    try {
      return new SimuladorDisco(respuesta === "" ? 64 : Number(respuesta));
    } catch (error) {
      console.log(`Error: ${(error as Error).message}.`);
    }
  }
}

async function crearArchivo(simulador: SimuladorDisco): Promise<void> {
  const nombre = await preguntar("Nombre del archivo: ");
  const tamanio = Number(await preguntar("Tamaño en bloques: "));

  const bloques = simulador.crearArchivo(nombre, tamanio);
  console.log(
    `Archivo '${nombre}' creado con éxito. Bloques asignados: [${bloques.join(", ")}]`
  );
  console.log(mostrarMapa(simulador.obtenerBloques()));
}

async function eliminarArchivo(simulador: SimuladorDisco): Promise<void> {
  const nombre = await preguntar("Nombre del archivo a eliminar: ");

  simulador.eliminarArchivo(nombre);
  console.log(`Archivo '${nombre}' eliminado correctamente.`);
  console.log(mostrarMapa(simulador.obtenerBloques()));
}

async function main(): Promise<void> {
  const simulador = await crearSimulador();

  while (true) {
    console.log(mostrarMenu());
    const opcion = await preguntar("Seleccione una opción: ");

    try {
      switch (opcion) {
        case "1":
          await crearArchivo(simulador);
          break;
        case "2":
          await eliminarArchivo(simulador);
          break;
        case "3":
          console.log(mostrarMapa(simulador.obtenerBloques()));
          break;
        case "4":
          console.log(mostrarTablaInodos(simulador.obtenerInodos()));
          console.log(mostrarMetricas(simulador.calcularMetricas()));
          break;
        case "5":
          console.log("Fin de la simulación.");
          lector.close();
          return;
        default:
          console.log("Opción inválida. Ingrese un número del 1 al 5.");
      }
    } catch (error) {
      console.log(`Error: ${(error as Error).message}.`);
    }
  }
}

main();
