import apiClient from './apiClient';

export interface LoginRequest {
  nombreUsuario: string;
  contrasena: string;
}

export interface Usuario {
  token: string;
  tipo: string;
  nombreUsuario: string;
  nombres: string;
  apellidos: string;
  rol: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<Usuario> => {
    const response = await apiClient.post<Usuario>('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.reload();
  },

  getUsuarioActual: (): Usuario | null => {
    const raw = localStorage.getItem('usuario');
    return raw ? JSON.parse(raw) : null;
  },

  estaAutenticado: (): boolean => {
    return !!localStorage.getItem('token');
  },
};