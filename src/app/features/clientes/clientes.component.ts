// Importa recursos principais do Angular
// - Component: cria o componente
// - OnInit: executa lógica quando o componente inicia
// - inject: injeta serviços sem usar constructor
import { Component, OnInit, inject } from '@angular/core';

// Importa funcionalidades comuns do Angular
// Exemplo: diretivas como *ngIf e *ngFor usadas no HTML
import { CommonModule } from '@angular/common';

// Importa suporte ao ngModel para trabalhar com formulário simples
import { FormsModule } from '@angular/forms';

// Importa o módulo da tabela do PrimeNG
import { TableModule } from 'primeng/table';

// Importa o módulo de botões do PrimeNG
import { ButtonModule } from 'primeng/button';

// Importa o módulo de tags do PrimeNG
// Ele é usado para exibir o status com destaque visual
import { TagModule } from 'primeng/tag';

// Importa o serviço responsável por fornecer os processos
import { ProcessoService } from '../../core/services/processo.service';

// Importa a tipagem do processo
import { Processo } from '../../models/processo.model';

// Cria um tipo para limitar os status permitidos
// Isso ajuda a evitar erros de digitação no código
type StatusProcesso = 'ATIVO' | 'FINALIZADO' | 'SUSPENSO';

// Decorador que define as configurações do componente
@Component({
  // Nome da tag usada no HTML para este componente
  selector: 'app-clientes',

  // Define que o componente é standalone
  standalone: true,

  // Lista os módulos necessários para o HTML funcionar
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule
  ],

  // Arquivo HTML associado a este componente
  templateUrl: './clientes.component.html'
})

// Classe principal do componente
export class ClientesComponent implements OnInit {

  // Injeta o serviço de processos
  private service = inject(ProcessoService);

  // Armazena todos os processos recebidos do serviço
  processos: Processo[] = [];

  // Lista completa de nomes de clientes, sem repetição
  clientes: string[] = [];

  // Lista de clientes depois da busca/filtro
  clientesFiltrados: string[] = [];

  // Texto digitado no campo de busca
  busca = '';

  // Guarda o nome do cliente atualmente selecionado
  // Pode ser null quando nenhum cliente estiver aberto
  clienteSelecionado: string | null = null;

  // Armazena os processos do cliente selecionado
  processosDoCliente: Processo[] = [];

  // Quantidade total de clientes únicos
  totalClientes = 0;

  // Método executado automaticamente quando o componente inicia
  ngOnInit() {

    // Busca todos os processos no serviço
    this.service.getAll().subscribe(data => {

      // Salva todos os processos recebidos
      this.processos = data;

      // Cria a lista de clientes únicos
      // Etapas:
      // 1. pega apenas o nome do cliente de cada processo
      // 2. remove espaços extras com trim()
      // 3. filtra nomes vazios
      // 4. remove duplicados com Set
      // 5. ordena em ordem alfabética
      this.clientes = [...new Set(
        data
          .map(processo => processo.cliente.trim())
          .filter(cliente => cliente.length > 0)
      )].sort((a, b) => a.localeCompare(b));

      // Atualiza a quantidade total de clientes
      this.totalClientes = this.clientes.length;

      // Aplica a busca atual para atualizar a lista visível
      this.aplicarBusca();

      // Se já existir um cliente selecionado,
      // atualiza novamente os processos dele
      if (this.clienteSelecionado) {
        this.selecionarCliente(this.clienteSelecionado);
      }
    });
  }

  // Método responsável por filtrar os clientes pela busca digitada
  aplicarBusca() {

    // Remove espaços no início/fim e transforma em minúsculo
    // para facilitar a comparação
    const termo = this.busca.trim().toLowerCase();

    // Filtra os clientes que contêm o texto digitado
    this.clientesFiltrados = this.clientes.filter(cliente =>
      cliente.toLowerCase().includes(termo)
    );
  }

  // Limpa o campo de busca e restaura a lista completa
  limparBusca() {
    this.busca = '';
    this.aplicarBusca();
  }

  // Seleciona um cliente e carrega os processos dele
  selecionarCliente(nomeCliente: string) {

    // Salva o nome do cliente selecionado
    this.clienteSelecionado = nomeCliente;

    // Filtra apenas os processos desse cliente
    // Depois ordena do mais recente para o mais antigo
    this.processosDoCliente = this.processos
      .filter(processo => processo.cliente.trim() === nomeCliente)
      .sort(
        (a, b) =>
          new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
      );
  }

  // Fecha a área de detalhes do cliente
  fecharDetalhes() {

    // Remove o cliente selecionado
    this.clienteSelecionado = null;

    // Limpa a lista de processos exibida
    this.processosDoCliente = [];
  }

  // Define a cor visual da tag de status
  // com base no status recebido
  getStatusSeverity(status: StatusProcesso): 'success' | 'danger' | 'warn' {
    switch (status) {

      // Processos ativos ficam com cor de sucesso
      case 'ATIVO':
        return 'success';

      // Processos finalizados ficam com cor de perigo
      case 'FINALIZADO':
        return 'danger';

      // Processos suspensos ficam com cor de aviso
      case 'SUSPENSO':
        return 'warn';
    }
  }
}