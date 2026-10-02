import apiClient from './apiClient';

export interface Producto {
  idProducto: number;
  codigoSku: string;
  nombre: string;
  descripcion: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  precioUnitario: number;
  idCategoria: number;
  nombreCategoria: string;
  activo: boolean;
  fechaRegistro: string;
  fechaModificacion: string | null;
}

export interface ProductoRequest {
  codigoSku: string;
  nombre: string;
  descripcion?: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  precioUnitario: number;
  idCategoria: number;
  activo?: boolean;
}

export const productoService = {
  listar: async (params?: { idCategoria?: number; nombre?: string }): Promise<Producto[]> => {
    const { data } = await apiClient.get('/productos', { params });
    return data;
  },

  obtener: async (id: number): Promise<Producto> => {
    const { data } = await apiClient.get(`/productos/${id}`);
    return data;
  },

  crear: async (request: ProductoRequest): Promise<Producto> => {
    const { data } = await apiClient.post('/productos', request);
    return data;
  },

  actualizar: async (id: number, request: ProductoRequest): Promise<Producto> => {
    const { data } = await apiClient.put(`/productos/${id}`, request);
    return data;
  },

  eliminar: async (id: number): Promise<void> => {
    await apiClient.delete(`/productos/${id}`);
  },
};