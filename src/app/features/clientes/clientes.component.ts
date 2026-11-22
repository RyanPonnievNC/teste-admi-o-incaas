// Tela de clientes: lista os clientes cadastrados e mostra os processos de cada um.

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProcessoService } from '../../core/services/processo.service';
import { Processo } from '../../models/processo.model';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss'
})
export class ClientesComponent implements OnInit {
  private service = inject(ProcessoService);

  // Quantos itens aparecem por página nas duas tabelas.
  readonly porPagina = 5;

  processos: Processo[] = [];
  clientes: string[] = [];
  clientesFiltrados: string[] = [];
  busca = '';

  clienteSelecionado: string | null = null;
  processosDoCliente: Processo[] = [];
  totalClientes = 0;

  // Página atual de cada tabela (começa em 1).
  paginaClientes = 1;
  paginaProcessos = 1;

  ngOnInit() {
    this.service.getAll().subscribe(data => {
      this.processos = data;

      // Lista de nomes sem repetição, em ordem alfabética.
      this.clientes = [...new Set(
        data
          .map(processo => processo.cliente.trim())
          .filter(cliente => cliente.length > 0)
      )].sort((a, b) => a.localeCompare(b));

      this.totalClientes = this.clientes.length;
      this.aplicarBusca();

      // Mantém o cliente aberto atualizado quando os processos mudam.
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

    this.paginaClientes = 1;
  }

  limparBusca() {
    this.busca = '';
    this.aplicarBusca();
  }

  selecionarCliente(nomeCliente: string) {
    // Só volta para a primeira página quando troca de cliente.
    if (nomeCliente !== this.clienteSelecionado) {
      this.paginaProcessos = 1;
    }

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

  // ---------- Paginação ----------

  get totalPaginasClientes(): number {
    return Math.max(1, Math.ceil(this.clientesFiltrados.length / this.porPagina));
  }

  get totalPaginasProcessos(): number {
    return Math.max(1, Math.ceil(this.processosDoCliente.length / this.porPagina));
  }

  get clientesDaPagina(): string[] {
    const pagina = Math.min(this.paginaClientes, this.totalPaginasClientes);
    const inicio = (pagina - 1) * this.porPagina;
    return this.clientesFiltrados.slice(inicio, inicio + this.porPagina);
  }

  get processosDaPagina(): Processo[] {
    const pagina = Math.min(this.paginaProcessos, this.totalPaginasProcessos);
    const inicio = (pagina - 1) * this.porPagina;
    return this.processosDoCliente.slice(inicio, inicio + this.porPagina);
  }

  mudarPaginaClientes(passo: number) {
    this.paginaClientes = Math.min(
      Math.max(1, this.paginaClientes + passo),
      this.totalPaginasClientes
    );
  }

  mudarPaginaProcessos(passo: number) {
    this.paginaProcessos = Math.min(
      Math.max(1, this.paginaProcessos + passo),
      this.totalPaginasProcessos
    );
  }

  // Nome da variação de cor da etiqueta de status.
  classeStatus(status: string): string {
    return 'ui-badge--' + status.toLowerCase();
  }
}
