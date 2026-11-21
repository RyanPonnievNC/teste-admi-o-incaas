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

  // Nome com que a lista é guardada no navegador (localStorage)
  // Precisa ficar ANTES da lista, porque ela já usa esse nome ao iniciar
  private readonly chave = 'processos';

  // Lista interna que simula um banco de dados
  // Começa com o que estava salvo no navegador (ou com os processos iniciais)
  private lista: Processo[] = this.carregar();

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

      // Copia numero, cliente, descricao, status e area
      ...processo,

      // Gera ID único usando timestamp atual
      id: Date.now(),

      // Define data atual
      dataCriacao: new Date()
    };

    // Adiciona no topo da lista, salva e avisa a tela
    this.atualizar([novoProcesso, ...this.lista]);
  }

  // Atualiza processo existente
  update(processoAtualizado: Processo) {

    // Percorre lista inteira
    // Se encontrar mesmo ID, substitui pelo atualizado
    this.atualizar(
      this.lista.map(p =>
        p.id === processoAtualizado.id
          ? processoAtualizado
          : p
      )
    );
  }

  // Remove processo pelo ID
  delete(id: number) {

    // Mantém somente os que NÃO possuem esse id
    this.atualizar(this.lista.filter(p => p.id !== id));
  }

  // Busca processo específico pelo ID
  getById(id: number) {

    // Procura o item
    // Se não encontrar, retorna null
    return this.lista.find(p => p.id === id) ?? null;
  }

  // Troca a lista, guarda no navegador e avisa todos os componentes
  private atualizar(novaLista: Processo[]) {
    this.lista = novaLista;
    this.salvar();
    this.subject.next(this.lista);
  }

  // Guarda a lista no navegador
  private salvar() {
    try {
      localStorage.setItem(this.chave, JSON.stringify(this.lista));
    } catch {
      // Se o navegador bloquear o armazenamento, o sistema segue funcionando sem salvar
    }
  }

  // Lê a lista guardada no navegador
  private carregar(): Processo[] {
    try {
      const texto = localStorage.getItem(this.chave);

      if (texto) {
        const dados = JSON.parse(texto);

        if (Array.isArray(dados)) {
          // O JSON guarda datas como texto, então converte de volta para Date
          return dados.map((p: Processo) => ({
            ...p,
            dataCriacao: new Date(p.dataCriacao)
          }));
        }
      }
    } catch {
      // Se o dado estiver corrompido, começa com a lista inicial
    }

    return this.processosIniciais();
  }

  // Processos de exemplo, usados só na primeira vez que o site abre
  private processosIniciais(): Processo[] {
    return [

      // Processo inicial 1
      {
        id: 1,
        numero: '0001-2026',
        cliente: 'João Silva',
        descricao: 'Ação trabalhista',
        status: 'ATIVO',
        area: 'trabalhista',
        dataCriacao: new Date()
      },

      // Processo inicial 2
      {
        id: 2,
        numero: '0002-2026',
        cliente: 'Maria Souza',
        descricao: 'Processo civil',
        status: 'FINALIZADO',
        area: 'civel',
        dataCriacao: new Date()
      }
    ];
  }
}