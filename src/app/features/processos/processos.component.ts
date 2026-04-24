// Importa recursos principais do Angular
import { Component, OnInit, inject } from '@angular/core';

// Importa recursos básicos como *ngIf, *ngFor e pipes
import { CommonModule } from '@angular/common';

// Importa recursos para formulário reativo e ngModel
import {
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

// Importa componentes PrimeNG usados na tela
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

// Importa o service de processos
import { ProcessoService } from '../../core/services/processo.service';

// Importa o service de autenticação
import { AuthService } from '../../core/services/auth.service';

// Importa o model de Processo
import { Processo } from '../../models/processo.model';

// Define os status válidos de um processo
type StatusProcesso = 'ATIVO' | 'FINALIZADO' | 'SUSPENSO';

// Define os status usados no formulário
type StatusFormulario = 'NENHUM' | StatusProcesso;

// Define o componente de processos
@Component({
  // Nome da tag do componente
  selector: 'app-processos',

  // Define que o componente é standalone
  standalone: true,

  // Importa recursos usados no HTML deste componente
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    TagModule
  ],

  // Arquivo HTML do componente
  templateUrl: './processos.component.html',

  // Arquivo SCSS do componente
  styleUrl: './processos.component.scss'
})
export class ProcessosComponent implements OnInit {

  // Cria o formulário de forma tipada
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  // Injeta o service de processos
  private readonly service: ProcessoService = inject(ProcessoService);

  // Injeta o service de autenticação
  public readonly authService: AuthService = inject(AuthService);

  // Lista completa de processos
  processos: Processo[] = [];

  // Lista de processos depois dos filtros
  processosFiltrados: Processo[] = [];

  // Guarda o ID do processo que está sendo editado
  // Quando for null, significa que está cadastrando novo processo
  editandoId: number | null = null;

  // Texto usado para filtrar por cliente
  filtroCliente = '';

  // Status usado para filtrar processos
  filtroStatus: '' | StatusProcesso = '';

  // Formulário de cadastro/edição de processo
  form = this.fb.group({
    numero: ['', Validators.required],
    cliente: ['', Validators.required],
    descricao: [''],
    status: ['NENHUM' as StatusFormulario, Validators.required]
  });

  // Executa quando a tela abre
  ngOnInit() {

    // Garante que a tela começa em modo cadastro
    this.editandoId = null;

    // Escuta a lista de processos do service
    this.service.getAll().subscribe((data: Processo[]) => {

      // Guarda todos os processos recebidos
      this.processos = data;

      // Aplica os filtros na lista
      this.aplicarFiltros();

    });

  }

  // Salva novo processo ou atualiza processo existente
  salvar() {

    // Se não for admin, bloqueia cadastro/edição
    if (!this.authService.ehAdmin()) {
      window.alert('Apenas administradores podem cadastrar ou editar processos.');
      return;
    }

    // Pega os valores atuais do formulário
    const valor = this.form.getRawValue();

    // Se o formulário estiver inválido ou o status for NENHUM, mostra erros
    if (this.form.invalid || valor.status === 'NENHUM') {
      this.form.markAllAsTouched();
      return;
    }

    // Se editandoId for diferente de null, significa que é atualização
    if (this.editandoId !== null) {

      // Busca o processo antigo pelo ID
      const processoExistente = this.service.getById(this.editandoId);

      // Se não encontrar o processo, cancela
      if (!processoExistente) {
        return;
      }

      // Atualiza o processo mantendo ID e data de criação
      this.service.update({
        ...processoExistente,
        numero: valor.numero,
        cliente: valor.cliente,
        descricao: valor.descricao,
        status: valor.status as StatusProcesso
      });

      // Depois de atualizar, volta para o modo cadastro
      this.cancelarEdicao();

      // Atualiza a lista filtrada
      this.aplicarFiltros();

      return;
    }

    // Se editandoId for null, significa que é novo cadastro
    this.service.add({
      numero: valor.numero,
      cliente: valor.cliente,
      descricao: valor.descricao,
      status: valor.status as StatusProcesso
    });

    // Depois de salvar, limpa o formulário e mantém modo cadastro
    this.limparFormularioCadastro();

    // Atualiza a lista filtrada
    this.aplicarFiltros();

  }

  // Coloca o formulário em modo edição
  editar(processo: Processo) {

    // Se não for admin, bloqueia edição
    if (!this.authService.ehAdmin()) {
      window.alert('Apenas administradores podem editar processos.');
      return;
    }

    // Define o ID do processo que está sendo editado
    // Isso faz o botão mudar para "Atualizar Processo"
    this.editandoId = processo.id;

    // Preenche o formulário com os dados do processo escolhido
    this.form.setValue({
      numero: processo.numero,
      cliente: processo.cliente,
      descricao: processo.descricao,
      status: processo.status
    });

  }

  // Cancela edição e volta para modo cadastro
  cancelarEdicao() {

    // Deixa editandoId como null
    // Isso faz o botão voltar para "Salvar Processo"
    this.editandoId = null;

    // Limpa o formulário
    this.limparFormularioCadastro();

  }

  // Limpa o formulário e garante modo cadastro
  limparFormularioCadastro() {

    // Garante que não está editando nenhum processo
    this.editandoId = null;

    // Reseta os campos do formulário
    this.form.reset({
      numero: '',
      cliente: '',
      descricao: '',
      status: 'NENHUM'
    });

  }

  // Exclui processo pelo ID
  excluir(id: number) {

    // Se não for admin, bloqueia exclusão
    if (!this.authService.ehAdmin()) {
      window.alert('Apenas administradores podem excluir processos.');
      return;
    }

    // Confirma antes de excluir
    const confirmou = window.confirm('Tem certeza que deseja excluir este processo?');

    // Se cancelar, para a função
    if (!confirmou) {
      return;
    }

    // Se estiver editando o processo que será excluído, cancela edição
    if (this.editandoId === id) {
      this.cancelarEdicao();
    }

    // Exclui o processo
    this.service.delete(id);

    // Atualiza a lista filtrada
    this.aplicarFiltros();

  }

  // Aplica filtros por cliente e status
  aplicarFiltros() {

    // Filtra a lista de processos
    this.processosFiltrados = this.processos.filter((processo: Processo) => {

      // Verifica filtro de cliente
      const clienteOk =
        !this.filtroCliente ||
        processo.cliente.toLowerCase().includes(this.filtroCliente.toLowerCase());

      // Verifica filtro de status
      const statusOk =
        !this.filtroStatus ||
        processo.status === this.filtroStatus;

      // Retorna se passou nos dois filtros
      return clienteOk && statusOk;

    });

  }

  // Limpa os filtros
  limparFiltros() {

    // Limpa filtro de cliente
    this.filtroCliente = '';

    // Limpa filtro de status
    this.filtroStatus = '';

    // Aplica filtros novamente
    this.aplicarFiltros();

  }

  // Define a cor da tag conforme status
  getStatusSeverity(status: StatusProcesso): 'success' | 'danger' | 'warn' {

    // Verifica o status
    switch (status) {

      // Ativo fica verde
      case 'ATIVO':
        return 'success';

      // Finalizado fica vermelho
      case 'FINALIZADO':
        return 'danger';

      // Suspenso fica amarelo
      case 'SUSPENSO':
        return 'warn';

    }

  }

}