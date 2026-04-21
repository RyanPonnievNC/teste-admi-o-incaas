// Importa o decorator Injectable do Angular
// Ele permite transformar essa classe em um service
import { Injectable } from '@angular/core';

// Importa BehaviorSubject do RxJS
// Usado para armazenar dados reativos e avisar componentes quando houver mudanças
import { BehaviorSubject } from 'rxjs';

// Importa o model Processo (tipagem dos dados)
import { Processo } from '../../models/processo.model';

// Define que este service estará disponível globalmente no projeto
// Não precisa importar manualmente em módulos
@Injectable({
  providedIn: 'root'
})
export class ProcessoService {

  // Lista interna que simula um banco de dados
  // Aqui ficam os processos cadastrados
  private lista: Processo[] = [

    // Processo inicial 1
    {
      id: 1,
      numero: '0001-2026',
      cliente: 'João Silva',
      descricao: 'Ação trabalhista',
      status: 'ATIVO',
      dataCriacao: new Date()
    },

    // Processo inicial 2
    {
      id: 2,
      numero: '0002-2026',
      cliente: 'Maria Souza',
      descricao: 'Processo civil',
      status: 'FINALIZADO',
      dataCriacao: new Date()
    }
  ];

  // Cria um BehaviorSubject com a lista inicial
  // Todo componente inscrito será atualizado automaticamente
  private subject = new BehaviorSubject<Processo[]>(this.lista);

  // Retorna os dados em formato Observable
  // Componentes usam subscribe() para receber atualizações
  getAll() {
    return this.subject.asObservable();
  }

  // Adiciona novo processo
  // Omit significa:
  // quem chama esse método NÃO precisa enviar id e dataCriacao
  // pois o sistema gera automaticamente
  add(processo: Omit<Processo, 'id' | 'dataCriacao'>) {

    // Monta o novo objeto completo
    const novoProcesso: Processo = {

      // Copia numero, cliente, descricao e status
      ...processo,

      // Gera ID único usando timestamp atual
      id: Date.now(),

      // Define data atual
      dataCriacao: new Date()
    };

    // Adiciona no topo da lista
    this.lista = [novoProcesso, ...this.lista];

    // Notifica todos os componentes da nova lista
    this.subject.next(this.lista);
  }

  // Atualiza processo existente
  update(processoAtualizado: Processo) {

    // Percorre lista inteira
    // Se encontrar mesmo ID, substitui pelo atualizado
    this.lista = this.lista.map(p =>
      p.id === processoAtualizado.id
        ? processoAtualizado
        : p
    );

    // Envia lista atualizada
    this.subject.next(this.lista);
  }

  // Remove processo pelo ID
  delete(id: number) {

    // Mantém somente os que NÃO possuem esse id
    this.lista = this.lista.filter(p => p.id !== id);

    // Atualiza tela automaticamente
    this.subject.next(this.lista);
  }

  // Busca processo específico pelo ID
  getById(id: number) {

    // Procura o item
    // Se não encontrar, retorna null
    return this.lista.find(p => p.id === id) ?? null;
  }
}