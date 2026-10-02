import apiClient from './apiClient';

export interface Usuario {
  idUsuario: number;
  nombreUsuario: string;
  nombres: string;
  apellidos: string;
  email: string;
  idRol: number;
  nombreRol: string;
  activo: boolean;
  fechaCreacion: string;
}

export interface UsuarioRequest {
  nombreUsuario: string;
  contrasena?: string;
  nombres: string;
  apellidos: string;
  email?: string;
  idRol: number;
  activo?: boolean;
}

export const usuarioService = {
  listar: async (): Promise<Usuario[]> => {
    const { data } = await apiClient.get('/usuarios');
    return data;
  },

  obtener: async (id: number): Promise<Usuario> => {
    const { data } = await apiClient.get(`/usuarios/${id}`);
    return data;
  },

  crear: async (request: UsuarioRequest): Promise<Usuario> => {
    const { data } = await apiClient.post('/usuarios', request);
    return data;
  },

  actualizar: async (id: number, request: UsuarioRequest): Promise<Usuario> => {
    const { data } = await apiClient.put(`/usuarios/${id}`, request);
    return data;
  },

  eliminar: async (id: number): Promise<void> => {
    await apiClient.delete(`/usuarios/${id}`);
  },
};