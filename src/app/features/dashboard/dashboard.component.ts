// Importa o Component, OnInit e inject do Angular
// - Component: cria o componente
// - OnInit: executa lógica quando a tela inicia
// - inject: injeta serviços sem precisar de constructor
import { Component, OnInit, inject } from '@angular/core';

// Importa recursos básicos do Angular para HTML comum
import { CommonModule } from '@angular/common';

// Importa módulo de gráfico do PrimeNG
import { ChartModule } from 'primeng/chart';

// Importa o service de processos
// Ele fornece os dados para o dashboard
import { ProcessoService } from '../../core/services/processo.service';

// Importa o model Processo para tipagem
import { Processo } from '../../models/processo.model';

@Component({
  // Nome da tag do componente
  selector: 'app-dashboard',

  // Diz que o componente é standalone
  standalone: true,

  // Módulos usados no HTML
  imports: [CommonModule, ChartModule],

  // Arquivo HTML da tela
  templateUrl: './dashboard.component.html',

  // Arquivo SCSS da tela
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  // Injeta o service para acessar os processos
  private service = inject(ProcessoService);

  // Lista completa de processos
  processos: Processo[] = [];

  // Totais usados nos cards
  total = 0;
  ativos = 0;
  finalizados = 0;
  suspensos = 0;

  // Lista dos 5 processos mais recentes
  ultimosCinco: Processo[] = [];

  // Dados do gráfico
  chartData: any;

  // Configurações do gráfico
  chartOptions: any;

  // Executa quando o componente carrega
  ngOnInit() {
    // Escuta a lista de processos do service
    this.service.getAll().subscribe(data => {
      // Guarda todos os processos
      this.processos = data;

      // Calcula total de processos
      this.total = data.length;

      // Conta quantos estão ATIVOS
      this.ativos = data.filter(p => p.status === 'ATIVO').length;

      // Conta quantos estão FINALIZADOS
      this.finalizados = data.filter(p => p.status === 'FINALIZADO').length;

      // Conta quantos estão SUSPENSOS
      this.suspensos = data.filter(p => p.status === 'SUSPENSO').length;

      // Ordena por data mais recente e pega os 5 primeiros
      this.ultimosCinco = [...data]
        .sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime())
        .slice(0, 5);

      // Monta o gráfico
      this.configurarGrafico();
    });
  }

  // Função que prepara os dados do gráfico
  configurarGrafico() {
    // Dados que o PrimeNG Chart vai usar
    this.chartData = {
      labels: ['Ativos', 'Finalizados', 'Suspensos'],
      datasets: [
        {
          label: 'Quantidade de Processos',
          data: [this.ativos, this.finalizados, this.suspensos]
        }
      ]
    };

    // Configurações visuais básicas do gráfico
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false
    };
  }
}