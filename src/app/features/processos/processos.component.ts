// Importa recursos principais do Angular.
import { Component, OnInit, inject } from '@angular/core';

// Importa recursos básicos como *ngIf, *ngFor, date pipe e outros.
import { CommonModule } from '@angular/common';

// Importa recursos de formulário do Angular.
import {
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

// Importa módulos do PrimeNG usados na tela.
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

// Importa o serviço de processos.
import { ProcessoService } from '../../core/services/processo.service';

// Importa o serviço de autenticação.
import { AuthService } from '../../core/services/auth.service';

// Importa o model de processo.
import { Processo } from '../../models/processo.model';

// Tipo dos status reais de um processo.
type StatusProcesso = 'ATIVO' | 'FINALIZADO' | 'SUSPENSO';

// Tipo usado no formulário, incluindo a opção inicial NENHUM.
type StatusFormulario = 'NENHUM' | StatusProcesso;

// Define o componente da tela de processos.
@Component({
  // Nome da tag do componente.
  selector: 'app-processos',

  // Define que o componente é standalone.
  standalone: true,

  // Módulos usados pelo HTML deste componente.
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    TagModule
  ],

  // Arquivo HTML do componente.
  templateUrl: './processos.component.html',

  // Arquivo SCSS do componente.
  styleUrl: './processos.component.scss'
})

// Classe principal da tela de processos.
export class ProcessosComponent implements OnInit {
  // Cria o formulário de forma tipada.
  private fb = inject(NonNullableFormBuilder);

  // Injeta o serviço de processos.
  private service = inject(ProcessoService);

  // Injeta o serviço de autenticação.
  private authService = inject(AuthService);

  // Lista completa de processos.
  processos: Processo[] = [];

  // Lista de processos depois dos filtros.
  processosFiltrados: Processo[] = [];

  // Guarda o ID do processo que está sendo editado.
  editandoId: number | null = null;

  // Guarda o texto digitado no filtro por cliente.
  filtroCliente = '';

  // Guarda o status selecionado no filtro.
  filtroStatus: '' | StatusProcesso = '';

  // Mensagem exibida quando o visitante tenta fazer uma ação bloqueada.
  mensagemPermissao = '';

  // Guarda o processo selecionado para exclusão.
  processoSelecionadoParaExcluir: Processo | null = null;

  // Controla se o modal de exclusão está aberto.
  modalExclusaoAberto = false;

  // Formulário reativo usado para cadastrar e editar processos.
  form = this.fb.group({
    // Campo número do processo.
    numero: ['', Validators.required],

    // Campo nome do cliente.
    cliente: ['', Validators.required],

    // Campo descrição do processo.
    descricao: [''],

    // Campo status do processo.
    status: ['NENHUM' as StatusFormulario, Validators.required]
  });

  // Executa quando a tela é aberta.
  ngOnInit(): void {
    // Escuta a lista de processos vinda do service.
    this.service.getAll().subscribe(data => {
      // Guarda todos os processos.
      this.processos = data;

      // Aplica os filtros iniciais.
      this.aplicarFiltros();
    });
  }

  // Verifica se o usuário atual pode criar, editar ou excluir processos.
  podeAlterarProcessos(): boolean {
    // Usa o AuthService para permitir alterações apenas para administrador.
    return this.authService.podeAlterar();
  }

  // Verifica se o usuário atual é visitante.
  usuarioVisitante(): boolean {
    // Usa o AuthService para identificar visitante.
    return this.authService.ehVisitante();
  }

  // Mostra uma mensagem quando visitante tenta fazer algo bloqueado.
  mostrarAvisoPermissao(): void {
    // Define a mensagem de permissão.
    this.mensagemPermissao = 'Visitantes podem visualizar os processos, mas não podem criar, editar ou excluir.';

    // Remove a mensagem depois de alguns segundos.
    setTimeout(() => {
      this.mensagemPermissao = '';
    }, 3500);
  }

  // Salva um novo processo ou atualiza um processo existente.
  salvar(): void {
    // Se não tiver permissão, bloqueia a ação.
    if (!this.podeAlterarProcessos()) {
      this.mostrarAvisoPermissao();
      return;
    }

    // Pega os valores atuais do formulário.
    const valor = this.form.getRawValue();

    // Se o formulário estiver inválido ou o status for NENHUM, marca os campos e para.
    if (this.form.invalid || valor.status === 'NENHUM') {
      this.form.markAllAsTouched();
      return;
    }

    // Se estiver editando um processo existente.
    if (this.editandoId !== null) {
      // Busca o processo antigo pelo ID.
      const processoExistente = this.service.getById(this.editandoId);

      // Se não encontrar o processo, para a função.
      if (!processoExistente) {
        return;
      }

      // Atualiza os dados mantendo id e data de criação.
      this.service.update({
        ...processoExistente,
        numero: valor.numero,
        cliente: valor.cliente,
        descricao: valor.descricao,
        status: valor.status as StatusProcesso
      });

      // Sai do modo edição.
      this.cancelarEdicao();

      // Atualiza a lista filtrada.
      this.aplicarFiltros();

      return;
    }

    // Se não estiver editando, cria um novo processo.
    this.service.add({
      numero: valor.numero,
      cliente: valor.cliente,
      descricao: valor.descricao,
      status: valor.status as StatusProcesso
    });

    // Limpa o formulário depois de salvar.
    this.form.reset({
      numero: '',
      cliente: '',
      descricao: '',
      status: 'NENHUM'
    });

    // Atualiza a lista filtrada.
    this.aplicarFiltros();
  }

  // Preenche o formulário com os dados do processo selecionado.
  editar(processo: Processo): void {
    // Se não tiver permissão, bloqueia a edição.
    if (!this.podeAlterarProcessos()) {
      this.mostrarAvisoPermissao();
      return;
    }

    // Marca qual processo está sendo editado.
    this.editandoId = processo.id;

    // Preenche o formulário com os dados do processo.
    this.form.setValue({
      numero: processo.numero,
      cliente: processo.cliente,
      descricao: processo.descricao,
      status: processo.status
    });
  }

  // Cancela a edição e limpa o formulário.
  cancelarEdicao(): void {
    // Remove o ID de edição.
    this.editandoId = null;

    // Reseta os campos do formulário.
    this.form.reset({
      numero: '',
      cliente: '',
      descricao: '',
      status: 'NENHUM'
    });
  }

  // Abre o modal de confirmação antes de excluir.
  abrirModalExclusao(processo: Processo): void {
    // Se não tiver permissão, bloqueia a exclusão.
    if (!this.podeAlterarProcessos()) {
      this.mostrarAvisoPermissao();
      return;
    }

    // Guarda o processo que será excluído.
    this.processoSelecionadoParaExcluir = processo;

    // Abre o modal.
    this.modalExclusaoAberto = true;
  }

  // Fecha o modal sem excluir.
  cancelarExclusao(): void {
    // Fecha o modal.
    this.modalExclusaoAberto = false;

    // Limpa o processo selecionado.
    this.processoSelecionadoParaExcluir = null;
  }

  // Confirma a exclusão do processo selecionado.
  confirmarExclusao(): void {
    // Se não tiver processo selecionado, fecha o modal.
    if (!this.processoSelecionadoParaExcluir) {
      this.cancelarExclusao();
      return;
    }

    // Guarda o ID do processo selecionado.
    const id = this.processoSelecionadoParaExcluir.id;

    // Se estiver editando esse mesmo processo, cancela a edição.
    if (this.editandoId === id) {
      this.cancelarEdicao();
    }

    // Exclui o processo.
    this.service.delete(id);

    // Atualiza a lista.
    this.aplicarFiltros();

    // Fecha o modal.
    this.cancelarExclusao();
  }

  // Filtra processos por cliente e status.
  aplicarFiltros(): void {
    // Filtra os processos conforme os campos preenchidos.
    this.processosFiltrados = this.processos.filter(processo => {
      // Verifica se o cliente bate com o filtro.
      const clienteOk =
        !this.filtroCliente ||
        processo.cliente.toLowerCase().includes(this.filtroCliente.toLowerCase());

      // Verifica se o status bate com o filtro.
      const statusOk =
        !this.filtroStatus ||
        processo.status === this.filtroStatus;

      // Retorna apenas processos que passaram nos filtros.
      return clienteOk && statusOk;
    });
  }

  // Limpa os filtros.
  limparFiltros(): void {
    // Limpa o filtro de cliente.
    this.filtroCliente = '';

    // Limpa o filtro de status.
    this.filtroStatus = '';

    // Atualiza a lista.
    this.aplicarFiltros();
  }

  // Define a cor visual da tag conforme o status.
  getStatusSeverity(status: StatusProcesso): 'success' | 'danger' | 'warn' {
    // Verifica o status recebido.
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