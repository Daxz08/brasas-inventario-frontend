import apiClient from './apiClient';

export const reporteService = {
  descargarStockPdf: async (): Promise<Blob> => {
    const { data } = await apiClient.get('/reportes/stock/pdf', { responseType: 'blob' });
    return data;
  },

  descargarStockExcel: async (): Promise<Blob> => {
    const { data } = await apiClient.get('/reportes/stock/excel', { responseType: 'blob' });
    return data;
  },

  descargarMovimientosPdf: async (desde: string, hasta: string): Promise<Blob> => {
    const { data } = await apiClient.get('/reportes/movimientos/pdf', {
      params: { desde, hasta },
      responseType: 'blob',
    });
    return data;
  },

  descargarMovimientosExcel: async (desde: string, hasta: string): Promise<Blob> => {
    const { data } = await apiClient.get('/reportes/movimientos/excel', {
      params: { desde, hasta },
      responseType: 'blob',
    });
    return data;
  },
};

// Helper para descargar blobs
export const descargarArchivo = (blob: Blob, nombreArchivo: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};