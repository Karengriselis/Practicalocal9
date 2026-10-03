export type EstadoActividad = 'pendiente' | 'en_progreso' | 'completada';

export type Prioridad = 'baja' | 'media' | 'alta';

export interface Actividad {
  id: number;
  titulo: string;
  estado: EstadoActividad;
  prioridad: Prioridad;
  creadaEn: string;
  destacada: boolean;
  descripcion: string;
}

export const LIMITES = {
  tituloMin: 3,
  tituloMax: 80,
  descripcionMax: 300,
} as const;


export function esEstadoActividad(valor: unknown): valor is EstadoActividad {
  return valor === 'pendiente' || valor === 'en_progreso' || valor === 'completada';
}

export function esPrioridad(valor: unknown): valor is Prioridad {
  return valor === 'baja' || valor === 'media' || valor === 'alta';
}



export type FiltroEstado = EstadoActividad | 'todas';
export type FiltroPrioridad = Prioridad | 'todas';

export const ETIQUETAS: Record<EstadoActividad, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En progreso',
  completada: 'Completada',
};  