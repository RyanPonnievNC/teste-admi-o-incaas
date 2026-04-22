// Importa recursos do Angular
import { Component, OnInit, inject } from '@angular/core';

// Importa recursos básicos do Angular
import { CommonModule } from '@angular/common';

// Importa FormsModule para usar ngModel
import { FormsModule } from '@angular/forms';

// Importa módulos do PrimeNG usados na tela
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

// Importa o service dos processos
import { ProcessoService } from '../../core/services/processo.service';

// Importa o model Processo
import { Processo } from '../../models/processo.model';

// Tipo dos status do processo
type StatusProcesso = 'ATIVO' | 'FINALIZADO' | 'SUSPENSO';

@Component({
  // Nome da tag do componente
  selector: 'app-clientes',

  // Define como standalone
  standalone: true,

  // Módulos usados no HTML
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule
  ],

  // Arquivo HTML
  templateUrl: './clientes.component.html',

  // Arquivo SCSS
  styleUrl: './clientes.component.scss'
})
export class ClientesComponent implements OnInit {
  // Injeta service dos processos
  private service = inject(ProcessoService);

  // Lista completa de processos
  processos: Processo[] = [];

  // Lista de nomes únicos de clientes
  clientes: string[] = [];

  // Lista filtrada pela busca
  clientesFiltrados: string[] = [];

  // Texto digitado na busca
  busca = '';

  // Cliente atualmente selecionado
  clienteSelecionado: string | null = null;

  // Processos pertencentes ao cliente selecionado
  processosDoCliente: Processo[] = [];

  // Total de clientes únicos
  totalClientes = 0;

  // Executa quando a tela abre
  ngOnInit() {
    // Escuta todos os processos
    this.service.getAll().subscribe(data => {
      this.processos = data;

      // Gera lista única de nomes de clientes
      this.clientes = [...new Set(
        data
          .map(processo => processo.cliente.trim())
          .filter(cliente => cliente.length > 0)
      )].sort((a, b) => a.localeCompare(b));

      // Conta total de clientes únicos
      this.totalClientes = this.clientes.length;

      // Aplica busca inicial
      this.aplicarBusca();

      // Se já havia cliente selecionado, atualiza processos dele
      if (this.clienteSelecionado) {
        this.selecionarCliente(this.clienteSelecionado);
      }
    });
  }

  // Filtra clientes pela busca digitada
  aplicarBusca() {
    const termo = this.busca.trim().toLowerCase();

    this.clientesFiltrados = this.clientes.filter(cliente =>
      cliente.toLowerCase().includes(termo)
    );
  }

  // Limpa campo de busca
  limparBusca() {
    this.busca = '';
    this.aplicarBusca();
  }

  // Mostra os processos do cliente clicado
  selecionarCliente(nomeCliente: string) {
    this.clienteSelecionado = nomeCliente;

    this.processosDoCliente = this.processos
      .filter(processo => processo.cliente.trim() === nomeCliente)
      .sort(
        (a, b) =>
          new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
      );
  }

  // Fecha o painel de detalhes
  fecharDetalhes() {
    this.clienteSelecionado = null;
    this.processosDoCliente = [];
  }

  // Define cor da tag conforme status
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