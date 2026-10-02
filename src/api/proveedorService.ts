import apiClient from './apiClient';

export interface Proveedor {
  idProveedor: number;
  ruc: string;
  razonSocial: string;
  contacto: string;
  telefono: string;
  direccion: string;
  activo: boolean;
  fechaRegistro: string;
}

export interface ProveedorRequest {
  ruc: string;
  razonSocial: string;
  contacto?: string;
  telefono?: string;
  direccion?: string;
}

export const proveedorService = {
  listar: async (): Promise<Proveedor[]> => {
    const { data } = await apiClient.get('/proveedores');
    return data;
  },

  obtener: async (id: number): Promise<Proveedor> => {
    const { data } = await apiClient.get(`/proveedores/${id}`);
    return data;
  },

  crear: async (request: ProveedorRequest): Promise<Proveedor> => {
    const { data } = await apiClient.post('/proveedores', request);
    return data;
  },

  actualizar: async (id: number, request: ProveedorRequest): Promise<Proveedor> => {
    const { data } = await apiClient.put(`/proveedores/${id}`, request);
    return data;
  },

  eliminar: async (id: number): Promise<void> => {
    await apiClient.delete(`/proveedores/${id}`);
  },
};