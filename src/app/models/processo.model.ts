export interface Processo {
  id: number;
  numero: string;
  cliente: string;
  descricao: string;
  status: 'ATIVO' | 'FINALIZADO' | 'SUSPENSO';
  // Área do direito (trabalhista, civel, familia, criminal, tributario). Vazio = sem área.
  area?: string;
  dataCriacao: Date;
}