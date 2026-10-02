import apiClient from './apiClient';

export interface Categoria {
  idCategoria: number;
  nombre: string;
  descripcion: string;
}

export interface CategoriaRequest {
  nombre: string;
  descripcion: string;
}

export const categoriaService = {
  listar: async (): Promise<Categoria[]> => {
    const { data } = await apiClient.get('/categorias');
    return data;
  },

  obtener: async (id: number): Promise<Categoria> => {
    const { data } = await apiClient.get(`/categorias/${id}`);
    return data;
  },

  crear: async (request: CategoriaRequest): Promise<Categoria> => {
    const { data } = await apiClient.post('/categorias', request);
    return data;
  },

  actualizar: async (id: number, request: CategoriaRequest): Promise<Categoria> => {
    const { data } = await apiClient.put(`/categorias/${id}`, request);
    return data;
  },

  eliminar: async (id: number): Promise<void> => {
    await apiClient.delete(`/categorias/${id}`);
  },
};