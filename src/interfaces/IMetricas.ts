export interface IMetricas {
  readonly totalBloques: number;
  readonly bloquesOcupados: number;
  readonly bloquesLibres: number;
  readonly porcentajeOcupacion: number;
  readonly mayorHuecoLibre: number;
  readonly fragmentacionExterna: number;
}
