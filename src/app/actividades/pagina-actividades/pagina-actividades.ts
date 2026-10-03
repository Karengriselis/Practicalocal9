 import { Component, computed, inject, input, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, of, switchMap } from 'rxjs';
import { ActividadesApi } from '../../api/actividades-api';
import { ActividadesService } from '../actividades';
import { Actividad, EstadoActividad, FiltroEstado, FiltroPrioridad, Prioridad } from '../../modelos/actividad';
import { FiltrosActividades } from '../filtros-actividades/filtros-actividades';
import { ListaActividades } from '../lista-actividades/lista-actividades';
import { PanelSeccion } from '../../compartido/panel-seccion/panel-seccion';
import { ResumenActividades } from '../resumen-actividades/resumen-actividades';
import { TarjetaActividad } from '../tarjeta-actividad/tarjeta-actividad';

@Component({
  selector: 'app-pagina-actividades',
  imports: [
    FiltrosActividades,
    ListaActividades,
    PanelSeccion,
    ResumenActividades,
    RouterLink,
  ],
  templateUrl: './pagina-actividades.html',
  styleUrl: './pagina-actividades.css',
})
export class PaginaActividades {
  private readonly orden: Record<Prioridad, number> = { alta: 0, media: 1, baja: 2 };

  private readonly servicio = inject(ActividadesService);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);
    private readonly api = inject(ActividadesApi);

  protected readonly actividades = this.servicio.actividades;

  readonly buscar = input<string | undefined>('');
  readonly estado = input<FiltroEstado | undefined>('todas');
  readonly prioridad = input<FiltroPrioridad | undefined>('todas');

  protected readonly termino = computed(() => this.buscar() ?? '');
    protected readonly resultados = signal<Actividad[] | null>(null);
  protected readonly filtroEstado = computed(() => this.estado() ?? 'todas');
  protected readonly filtroPrioridad = computed(() => this.prioridad() ?? 'todas');

  protected readonly seleccionadaId = signal<number | null>(null);

  protected readonly seleccionada = computed(() => {
    const id = this.seleccionadaId();
    return id === null ? null : (this.actividades().find((a) => a.id === id) ?? null);
  });

  protected readonly visibles = computed(() => {
    const termino = this.termino().trim().toLocaleLowerCase('es');
    const estado = this.filtroEstado();
    const prioridad = this.filtroPrioridad();

    return this.actividades()
      .filter((a) => termino === '' || a.titulo.toLocaleLowerCase('es').includes(termino))
      .filter((a) => estado === 'todas' || a.estado === estado)
      .filter((a) => prioridad === 'todas' || a.prioridad === prioridad)
      .sort((primera, segunda) => this.orden[primera.prioridad] - this.orden[segunda.prioridad]);
  });

  protected readonly mostradas = computed(() => this.visibles().length);

  protected readonly hayFiltros = computed(
    () =>
      this.termino().trim() !== '' ||
      this.filtroEstado() !== 'todas' ||
      this.filtroPrioridad() !== 'todas',
  );

  protected readonly mensajeVacio = computed(() =>
    this.hayFiltros()
      ? 'No hay actividades que coincidan con los filtros.'
      : 'No hay actividades todavía.',
  );
    constructor() {
    toObservable(this.termino)
      .pipe(
        debounceTime(300),
        switchMap((t) => (t.trim() === '' ? of(null) : this.api.buscar(t))),
        takeUntilDestroyed(),
      )
      .subscribe((r) => this.resultados.set(r));
  }

  protected readonly total = this.servicio.total;
  protected readonly pendientes = this.servicio.pendientes;
  protected readonly enProgreso = this.servicio.enProgreso;
  protected readonly completadas = this.servicio.completadas;
  protected readonly porcentaje = this.servicio.porcentaje;

    protected readonly cargando = this.servicio.cargando;
  protected readonly errorCarga = this.servicio.error;

  protected alternarDestacada(id: number): void {
    this.servicio.alternarDestacada(id);
  }

  protected avanzarEstado(id: number): void {
    this.servicio.avanzarEstado(id);
  }

  protected eliminar(id: number): void {
    this.servicio.eliminar(id);
    this.seleccionadaId.update((actual) => (actual === id ? null : actual));
  }

  protected seleccionar(id: number): void {
    this.seleccionadaId.update((actual) => (actual === id ? null : id));
  }

  protected cambiarBuscar(valor: string): void {
    this.actualizar({ buscar: valor.trim() === '' ? null : valor });
  }

  protected cambiarEstado(valor: FiltroEstado): void {
    this.actualizar({ estado: valor === 'todas' ? null : valor });
  }

  protected cambiarPrioridad(valor: FiltroPrioridad): void {
    this.actualizar({ prioridad: valor === 'todas' ? null : valor });
  }

  protected limpiarFiltros(): void {
    this.actualizar({ buscar: null, estado: null, prioridad: null });
  }

  private actualizar(cambios: Record<string, string | null>): void {
    this.router.navigate([], {
      relativeTo: this.ruta,
      queryParams: cambios,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected recargar(): void {
    this.servicio.cargar();
  }
} 