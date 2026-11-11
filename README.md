# Simulador de Asignación de Espacio en Disco

Proyecto académico desarrollado en TypeScript para la Actividad de Evaluación 4 (TIFAS) de Sistemas Operativos, Universidad de la Cuenca del Plata.

El simulador modela el sistema de archivos de Linux Ubuntu (ext4) con **asignación indexada mediante inodos**. Se basa en el código provisto por la cátedra (`main.py`) e incorpora los desafíos de la guía de taller: métricas de almacenamiento, fragmentación externa y menú interactivo por consola.

**Integrantes:** Castillo, Camila · Saquer, Sophia

## Tecnologías

- TypeScript
- Node.js
- Vitest
- GitHub Actions

## Requisitos

- Node.js 24 o superior
- npm

## Instalación

Clonar el repositorio e instalar las dependencias:

```bash
npm ci
```

## Ejecución

Para iniciar el simulador por consola:

```bash
npm start
```

Al iniciar, el programa pide la cantidad total de bloques del disco. Si se presiona Enter sin escribir nada, usa 64 bloques. Después muestra el menú:

```text
=======================================
   SIMULADOR DE SISTEMA DE ARCHIVOS
=======================================
1. Crear archivo
2. Eliminar archivo
3. Ver mapa de bloques
4. Ver tabla de Inodos y métricas
5. Salir
```

## Pruebas

Para ejecutar todos los tests:

```bash
npm test
```

## Verificación de TypeScript

Para comprobar que el proyecto no presenta errores de TypeScript:

```bash
npx tsc --noEmit
```

## Cobertura

Para ejecutar los tests y generar el reporte de cobertura:

```bash
npm run coverage
```

## Funcionalidades principales

El simulador permite:

- configurar el tamaño del disco en bloques;
- crear archivos indicando nombre y tamaño en bloques;
- asignar el espacio mediante asignación indexada, con la lista de bloques guardada en el inodo;
- eliminar archivos liberando sólo los bloques registrados en su inodo;
- visualizar el mapa de bloques del disco (libres y ocupados);
- consultar la tabla de inodos;
- calcular métricas de ocupación;
- calcular la fragmentación externa;
- informar errores ante nombres duplicados, archivos inexistentes y falta de espacio.

## Estructuras de datos

| Concepto teórico | Implementación |
|---|---|
| Disco dividido en bloques | Arreglo `bloques` de `SimuladorDisco`: `null` = bloque libre; un nombre = bloque ocupado por ese archivo |
| Mapa de bits | El mismo arreglo cumple esa función: cada posición indica si el bloque está libre u ocupado |
| Inodo | Clase `Inodo`, con el nombre, el tamaño en bloques y la lista `bloquesAsignados` |
| Tabla de inodos | `Map` de `SimuladorDisco` que asocia cada nombre con su inodo |

## Asignación de espacio

Para crear un archivo, el simulador:

1. verifica que el nombre no exista;
2. busca todos los bloques libres del disco;
3. verifica que alcancen para el tamaño pedido;
4. toma los primeros bloques libres, aunque no estén contiguos, y los registra en el inodo.

Como el inodo guarda la lista de bloques, el archivo puede quedar repartido en distintas zonas del disco. Esto corresponde a una asignación indexada y no a una asignación contigua.

Al eliminar un archivo, el simulador recorre sólo la lista de bloques de su inodo para liberarlos, sin recorrer todo el disco.

## Métricas

- Total de bloques
- Bloques ocupados
- Bloques libres
- Porcentaje de ocupación = (bloques ocupados / total de bloques) × 100
- Mayor hueco libre: la secuencia más larga de bloques libres consecutivos
- Fragmentación externa = (1 − mayor hueco libre / total de bloques libres) × 100. Vale 0 % si no hay bloques libres.

## Errores contemplados

| Situación | Mensaje |
|---|---|
| Nombre duplicado | `el archivo '<nombre>' ya existe` |
| Archivo inexistente | `archivo '<nombre>' no encontrado` |
| Falta de espacio | `espacio en disco insuficiente / bloques agotados` |
| Datos inválidos | Nombre vacío, tamaño que no es entero positivo o tamaño de disco inválido |

Cuando una operación falla, el disco no se modifica.

## Caso de prueba de la guía

1. Crear `docA.txt` de 4 bloques → bloques 0 a 3.
2. Crear `docB.txt` de 4 bloques → bloques 4 a 7.
3. Crear `docC.txt` de 4 bloques → bloques 8 a 11.
4. Eliminar `docB.txt` → queda un hueco libre en los bloques 4 a 7.
5. Crear `docD.txt` de 6 bloques → bloques 4, 5, 6, 7, 12 y 13.

Con asignación contigua, `docD.txt` no podría usar el hueco de 4 bloques y tendría que ubicarse a partir del bloque 12. Con asignación indexada, el inodo registra los bloques de las dos zonas. Este caso está incluido en los tests automatizados.

## Estructura del proyecto

```text
src/
├── interfaces/
├── modelos/
└── consola/

tests/

.github/
└── workflows/
    └── tests.yml
```

- Las interfaces se encuentran en `src/interfaces/`.
- Las implementaciones se encuentran en `src/modelos/`.
- El menú y la presentación por consola se encuentran en `src/consola/`. Los modelos no dependen de la consola.
- Las pruebas automatizadas se encuentran en `tests/`.

## Integración continua

El proyecto utiliza GitHub Actions para ejecutar verificaciones automáticas.

En cada push o pull request sobre la rama `main` se ejecutan:

1. instalación de dependencias;
2. verificación de TypeScript;
3. tests automatizados;
4. generación del reporte de cobertura.

El workflow se encuentra en:

```text
.github/workflows/tests.yml
```
