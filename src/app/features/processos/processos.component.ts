// Importa recursos principais do Angular
import { Component, OnInit, inject } from '@angular/core';

// Importa recursos básicos para diretivas como *ngIf e *ngFor
import { CommonModule } from '@angular/common';

// Importa módulos de formulário do Angular
// - FormsModule: usado no ngModel
// - NonNullableFormBuilder: cria formulário tipado sem null
// - ReactiveFormsModule: usado no formGroup e formControlName
// - Validators: valida campos obrigatórios
import {
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

// Importa componentes do PrimeNG usados nesta tela
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

// Importa o service de processos
import { ProcessoService } from '../../core/services/processo.service';

// Importa o model Processo
import { Processo } from '../../models/processo.model';

// Tipo dos status reais de um processo
type StatusProcesso = 'ATIVO' | 'FINALIZADO' | 'SUSPENSO';

// Tipo usado só no formulário, incluindo NENHUM
type StatusFormulario = 'NENHUM' | StatusProcesso;

@Component({
  // Nome da tag do componente
  selector: 'app-processos',

  // Componente standalone
  standalone: true,

  // Módulos usados pelo HTML
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    TagModule
  ],

  // Arquivo HTML
  templateUrl: './processos.component.html',

  // Arquivo SCSS
  styleUrl: './processos.component.scss'
})
export class ProcessosComponent implements OnInit {
  // Cria formulário de forma tipada
  private fb = inject(NonNullableFormBuilder);

  // Injeta o service dos processos
  private service = inject(ProcessoService);

  // Lista completa de processos
  processos: Processo[] = [];

  // Lista filtrada exibida na tabela
  processosFiltrados: Processo[] = [];

  // Guarda o ID do processo em edição
  editandoId: number | null = null;

  // Filtro por cliente
  filtroCliente = '';

  // Filtro por status
  filtroStatus: '' | StatusProcesso = '';

  // Formulário reativo
  form = this.fb.group({
    numero: ['', Validators.required],
    cliente: ['', Validators.required],
    descricao: [''],
    status: ['NENHUM' as StatusFormulario, Validators.required]
  });

  // Executa quando a tela abre
  ngOnInit() {
    // Escuta a lista do service
    this.service.getAll().subscribe(data => {
      // Guarda todos os processos
      this.processos = data;

      // Aplica filtros iniciais
      this.aplicarFiltros();
    });
  }

  // Salva novo processo ou atualiza um existente
  salvar() {
    // Pega os valores do formulário
    const valor = this.form.getRawValue();

    // Se formulário estiver inválido ou status for NENHUM, bloqueia
    if (this.form.invalid || valor.status === 'NENHUM') {
      this.form.markAllAsTouched();
      return;
    }

    // Se estiver editando um processo já existente
    if (this.editandoId !== null) {
      // Busca o processo antigo pelo ID
      const processoExistente = this.service.getById(this.editandoId);

      // Se não encontrar, interrompe
      if (!processoExistente) return;

      // Atualiza os dados mantendo id e dataCriacao
      this.service.update({
        ...processoExistente,
        numero: valor.numero,
        cliente: valor.cliente,
        descricao: valor.descricao,
        status: valor.status as StatusProcesso
      });

      // Sai do modo edição
      this.cancelarEdicao();

      // Reaplica filtros
      this.aplicarFiltros();
      return;
    }

    // Se não estiver editando, cria novo processo
    this.service.add({
      numero: valor.numero,
      cliente: valor.cliente,
      descricao: valor.descricao,
      status: valor.status as StatusProcesso
    });

    // Limpa formulário
    this.form.reset({
      numero: '',
      cliente: '',
      descricao: '',
      status: 'NENHUM'
    });

    // Atualiza lista filtrada
    this.aplicarFiltros();
  }

  // Preenche formulário com dados do processo selecionado
  editar(processo: Processo) {
    // Marca qual processo está sendo editado
    this.editandoId = processo.id;

    // Preenche o formulário
    this.form.setValue({
      numero: processo.numero,
      cliente: processo.cliente,
      descricao: processo.descricao,
      status: processo.status
    });
  }

  // Cancela edição e limpa formulário
  cancelarEdicao() {
    this.editandoId = null;

    this.form.reset({
      numero: '',
      cliente: '',
      descricao: '',
      status: 'NENHUM'
    });
  }

  // Exclui processo
  excluir(id: number) {
    // Confirma com usuário antes de excluir
    const confirmou = window.confirm('Tem certeza que deseja excluir este processo?');

    if (!confirmou) return;

    // Se estiver editando esse mesmo processo, sai da edição
    if (this.editandoId === id) {
      this.cancelarEdicao();
    }

    // Remove do service
    this.service.delete(id);

    // Reaplica filtros
    this.aplicarFiltros();
  }

  // Filtra processos por cliente e status
  aplicarFiltros() {
    this.processosFiltrados = this.processos.filter(processo => {
      const clienteOk =
        !this.filtroCliente ||
        processo.cliente.toLowerCase().includes(this.filtroCliente.toLowerCase());

      const statusOk =
        !this.filtroStatus || processo.status === this.filtroStatus;

      return clienteOk && statusOk;
    });
  }

  // Limpa filtros
  limparFiltros() {
    this.filtroCliente = '';
    this.filtroStatus = '';
    this.aplicarFiltros();
  }

  // Define cor visual da tag conforme status
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