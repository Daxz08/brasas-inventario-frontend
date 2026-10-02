import apiClient from './apiClient';

export interface DetalleMovimiento {
  idDetalle: number;
  idProducto: number;
  nombreProducto: string;
  codigoSku: string;
  cantidad: number;
  precioCosto: number;
  fechaVencimiento: string | null;
}

export interface Movimiento {
  idMovimiento: number;
  tipoMovimiento: 'ENTRADA' | 'SALIDA' | 'MERMA' | 'AJUSTE';
  fechaMovimiento: string;
  observacion: string;
  estado: string;
  idUsuario: number;
  nombreUsuario: string;
  idProveedor: number | null;
  razonSocialProveedor: string | null;
  detalles: DetalleMovimiento[];
}

export interface DetalleMovimientoRequest {
  idProducto: number;
  cantidad: number;
  precioCosto?: number;
  fechaVencimiento?: string;
}

export interface MovimientoRequest {
  tipoMovimiento: string;
  observacion?: string;
  idProveedor?: number;
  detalles: DetalleMovimientoRequest[];
}

export const movimientoService = {
  listar: async (params?: { tipo?: string; desde?: string; hasta?: string }): Promise<Movimiento[]> => {
    const { data } = await apiClient.get('/movimientos', { params });
    return data;
  },

  obtener: async (id: number): Promise<Movimiento> => {
    const { data } = await apiClient.get(`/movimientos/${id}`);
    return data;
  },

  registrar: async (request: MovimientoRequest): Promise<Movimiento> => {
    const { data } = await apiClient.post('/movimientos', request);
    return data;
  },
};