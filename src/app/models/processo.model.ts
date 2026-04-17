export interface Processo {
  id: number;
  numero: string;
  cliente: string;
  descricao: string;
  status: 'ATIVO' | 'FINALIZADO' | 'SUSPENSO';
  dataCriacao: Date;
}