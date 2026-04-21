// Importa os recursos principais do Angular
// - Component: usado para criar o componente
// - OnInit: interface para executar lógica quando o componente inicia
// - inject: forma moderna de injetar serviços sem usar constructor
import { Component, OnInit, inject } from '@angular/core';

// Importa funcionalidades comuns do Angular
// Exemplo: diretivas como *ngIf, *ngFor e outras usadas no HTML
import { CommonModule } from '@angular/common';

// Importa o módulo de gráficos do PrimeNG
// Ele permite usar o componente <p-chart> no template
import { ChartModule } from 'primeng/chart';

// Importa o serviço responsável por buscar os processos
import { ProcessoService } from '../../core/services/processo.service';

// Importa o model/interface Processo
// Isso ajuda a tipar corretamente os dados
import { Processo } from '../../models/processo.model';

// Decorador que define as configurações do componente
@Component({
  // Nome da tag usada para chamar este componente no HTML
  selector: 'app-dashboard',

  // Define que este componente é standalone
  // Ou seja, ele não precisa estar declarado em um módulo tradicional
  standalone: true,

  // Lista de módulos que este componente precisa para funcionar
  imports: [CommonModule, ChartModule],

  // Arquivo HTML associado a este componente
  templateUrl: './dashboard.component.html'
})

// Classe principal do componente
// Implementa OnInit para usar o método ngOnInit
export class DashboardComponent implements OnInit {

  // Injeta o serviço de processos
  // Esse serviço será usado para buscar os dados
  private service = inject(ProcessoService);

  // Array que armazenará todos os processos vindos do serviço
  processos: Processo[] = [];

  // Variáveis usadas para mostrar os totais no dashboard
  total = 0;
  ativos = 0;
  finalizados = 0;
  suspensos = 0;

  // Array com os 5 processos mais recentes
  ultimosCinco: Processo[] = [];

  // Objeto com os dados do gráfico
  chartData: any;

  // Objeto com as configurações do gráfico
  chartOptions: any;

  // Método executado automaticamente quando o componente é iniciado
  ngOnInit() {

    // Chama o serviço para buscar todos os processos
    // subscribe() é usado porque o retorno é assíncrono
    this.service.getAll().subscribe(data => {

      // Salva todos os processos na variável principal
      this.processos = data;

      // Calcula o total geral de processos
      this.total = data.length;

      // Conta quantos processos possuem status "ATIVO"
      this.ativos = data.filter(p => p.status === 'ATIVO').length;

      // Conta quantos processos possuem status "FINALIZADO"
      this.finalizados = data.filter(p => p.status === 'FINALIZADO').length;

      // Conta quantos processos possuem status "SUSPENSO"
      this.suspensos = data.filter(p => p.status === 'SUSPENSO').length;

      // Cria uma cópia do array de processos
      // Depois ordena do mais recente para o mais antigo
      // Por fim, pega apenas os 5 primeiros
      this.ultimosCinco = [...data]
        .sort(
          (a, b) =>
            new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
        )
        .slice(0, 5);

      // Depois de calcular os dados, monta o gráfico
      this.configurarGrafico();
    });
  }

  // Método responsável por preparar os dados do gráfico
  configurarGrafico() {

    // Define os dados que serão exibidos no gráfico
    this.chartData = {

      // Rótulos das colunas
      labels: ['Ativos', 'Finalizados', 'Suspensos'],

      // Conjunto de dados do gráfico
      datasets: [
        {
          // Nome da série de dados
          label: 'Quantidade de Processos',

          // Valores que serão exibidos no gráfico
          data: [this.ativos, this.finalizados, this.suspensos]
        }
      ]
    };

    // Define as opções de comportamento e visualização do gráfico
    this.chartOptions = {

      // Faz o gráfico se adaptar ao tamanho da tela
      responsive: true,

      // Permite que o gráfico ocupe melhor a altura do container
      maintainAspectRatio: false
    };
  }
}