import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

import { ProcessoService } from '../../core/services/processo.service';
import { Processo } from '../../models/processo.model';

type StatusProcesso = 'ATIVO' | 'FINALIZADO' | 'SUSPENSO';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule
  ],
  templateUrl: './clientes.component.html'
})
export class ClientesComponent implements OnInit {
  private service = inject(ProcessoService);

  processos: Processo[] = [];
  clientes: string[] = [];
  clientesFiltrados: string[] = [];

  busca = '';

  clienteSelecionado: string | null = null;
  processosDoCliente: Processo[] = [];

  totalClientes = 0;

  ngOnInit() {
    this.service.getAll().subscribe(data => {
      this.processos = data;

      this.clientes = [...new Set(
        data
          .map(processo => processo.cliente.trim())
          .filter(cliente => cliente.length > 0)
      )].sort((a, b) => a.localeCompare(b));

      this.totalClientes = this.clientes.length;
      this.aplicarBusca();

      if (this.clienteSelecionado) {
        this.selecionarCliente(this.clienteSelecionado);
      }
    });
  }

  aplicarBusca() {
    const termo = this.busca.trim().toLowerCase();

    this.clientesFiltrados = this.clientes.filter(cliente =>
      cliente.toLowerCase().includes(termo)
    );
  }

  limparBusca() {
    this.busca = '';
    this.aplicarBusca();
  }

  selecionarCliente(nomeCliente: string) {
    this.clienteSelecionado = nomeCliente;

    this.processosDoCliente = this.processos
      .filter(processo => processo.cliente.trim() === nomeCliente)
      .sort(
        (a, b) =>
          new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
      );
  }

  fecharDetalhes() {
    this.clienteSelecionado = null;
    this.processosDoCliente = [];
  }

  getStatusSeverity(status: StatusProcesso): 'success' | 'danger' | 'warn' {
    switch (status) {
      case 'ATIVO':
        return 'success';
      case 'FINALIZADO':
        return 'danger';
      case 'SUSPENSO':
        return 'warn';
    }
  }
}