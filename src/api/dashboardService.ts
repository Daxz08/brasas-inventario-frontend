import apiClient from './apiClient';

export interface Dashboard {
  totalProductos: number;
  productosStockBajo: number;
  movimientosHoy: number;
  mermasDelMes: number;
}

export interface StockProducto {
  idProducto: number;
  codigoSku: string;
  nombre: string;
  nombreCategoria: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  estado: 'NORMAL' | 'BAJO' | 'CRITICO';
}

export interface AlertaStock {
  idProducto: number;
  codigoSku: string;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
  faltante: number;
}

export const dashboardService = {
  obtener: async (): Promise<Dashboard> => {
    const { data } = await apiClient.get('/dashboard');
    return data;
  },
};

export const stockService = {
  listar: async (): Promise<StockProducto[]> => {
    const { data } = await apiClient.get('/stock');
    return data;
  },
};

export const alertaService = {
  listar: async (): Promise<AlertaStock[]> => {
    const { data } = await apiClient.get('/alertas/stock-minimo');
    return data;
  },
};