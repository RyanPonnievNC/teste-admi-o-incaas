import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';

import { ProcessoService } from '../../core/services/processo.service';
import { Processo } from '../../models/processo.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private service = inject(ProcessoService);

  processos: Processo[] = [];

  total = 0;
  ativos = 0;
  finalizados = 0;
  suspensos = 0;
  ultimosCinco: Processo[] = [];

  chartData: any;
  chartOptions: any;

  ngOnInit() {
    this.service.getAll().subscribe(data => {
      this.processos = data;
      this.total = data.length;
      this.ativos = data.filter(p => p.status === 'ATIVO').length;
      this.finalizados = data.filter(p => p.status === 'FINALIZADO').length;
      this.suspensos = data.filter(p => p.status === 'SUSPENSO').length;

      this.ultimosCinco = [...data]
        .sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime())
        .slice(0, 5);

      this.configurarGrafico();
    });
  }

  configurarGrafico() {
    this.chartData = {
      labels: ['Ativos', 'Finalizados', 'Suspensos'],
      datasets: [
        {
          label: 'Quantidade de Processos',
          data: [this.ativos, this.finalizados, this.suspensos]
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false
    };
  }
}