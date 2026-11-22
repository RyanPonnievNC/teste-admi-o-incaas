// Importa recursos principais do Angular.
import { Component, DestroyRef, OnInit, inject } from '@angular/core';

// Permite cancelar a escuta de um Observable quando o componente fecha.
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Importa recursos básicos como *ngIf, *ngFor, date pipe e outros.
import { CommonModule } from '@angular/common';

// Importa o tipo de erro das chamadas HTTP.
import { HttpErrorResponse } from '@angular/common/http';

// Importa recursos de formulário do Angular.
import {
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

// Importa operadores do RxJS usados na sugestão da IA.
import { catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';

// Importa módulos do PrimeNG usados na tela.
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

// Importa o serviço de processos.
import { ProcessoService } from '../../core/services/processo.service';

// Importa o serviço de autenticação.
import { AuthService } from '../../core/services/auth.service';

// Importa o serviço da IA.
import { IaService, SugestaoIa } from '../../core/services/ia.service';

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

  // Serviço que conversa com a IA em C++.
  private iaService = inject(IaService);

  // Usado para encerrar a escuta do formulário quando a tela fechar.
  private destroyRef = inject(DestroyRef);

  // Guarda o temporizador do aviso, para um aviso novo não ser apagado pelo antigo.
  private temporizadorAviso: ReturnType<typeof setTimeout> | undefined;

  // Última sugestão da IA (null = nada para mostrar).
  sugestaoIa: SugestaoIa | null = null;

  // Áreas disponíveis (valor = o que a IA devolve, nome = o que aparece na tela).
  readonly areas = [
    { valor: 'trabalhista', nome: 'Trabalhista' },
    { valor: 'civel', nome: 'Cível' },
    { valor: 'familia', nome: 'Família' },
    { valor: 'criminal', nome: 'Criminal' },
    { valor: 'tributario', nome: 'Tributário' }
  ];

  // Lista completa de processos.
  processos: Processo[] = [];

  // Lista de processos depois dos filtros.
  processosFiltrados: Processo[] = [];

  // Guarda o ID do processo que está sendo editado.
  editandoId: number | null = null;

  // Indica que um salvamento está em andamento (evita clique duplo).
  salvando = false;

  // Guarda o texto digitado no filtro por cliente.
  filtroCliente = '';

  // Guarda o status selecionado no filtro.
  filtroStatus: '' | StatusProcesso = '';

  // Guarda a área selecionada no filtro.
  filtroArea = '';

  // Mensagem exibida no painel de aviso (permissão ou erro da API).
  mensagemPermissao = '';

  // Guarda o processo selecionado para exclusão.
  processoSelecionadoParaExcluir: Processo | null = null;

  // Controla se o modal de exclusão está aberto.
  modalExclusaoAberto = false;

  // Formulário reativo usado para cadastrar e editar processos.
  form = this.fb.group({
    // Campo número do processo: gerado pelo sistema, por isso fica desabilitado.
    numero: [{ value: '', disabled: true }],

    // Campo nome do cliente.
    cliente: ['', Validators.required],

    // Campo descrição do processo.
    descricao: [''],

    // Campo área do processo (opcional).
    area: [''],

    // Campo status do processo.
    status: ['NENHUM' as StatusFormulario, Validators.required]
  });

  // Executa quando a tela é aberta.
  ngOnInit(): void {
    // Escuta a lista de processos vinda do service.
    this.service.getAll().subscribe(data => {
      // Guarda todos os processos.
      this.processos = data;

      // Aplica os filtros.
      this.aplicarFiltros();

      // Mostra no formulário o próximo número disponível.
      this.atualizarNumero();
    });

    // Pede a lista à API.
    this.service.carregar().subscribe({
      error: erro =>
        this.mostrarAviso(
          this.mensagemDoErro(erro, 'Não foi possível carregar os processos.')
        )
    });

    // Pede sugestão de área à IA enquanto a descrição é digitada.
    this.form.controls.descricao.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(texto =>
          texto.trim().length < 10
            ? of(null)
            : this.iaService.sugerirArea(texto).pipe(
                // Se o servidor estiver desligado, apenas não mostra sugestão.
                catchError(() => of(null))
              )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(sugestao => {
        this.sugestaoIa = sugestao;
      });
  }

  // Calcula o próximo número: maior sequência do ano atual + 1 (ex.: 0004-2026).
  // É só uma prévia: o número definitivo é gerado pelo servidor ao salvar.
  private proximoNumero(): string {
    const ano = new Date().getFullYear();
    const regra = new RegExp(`^(\\d+)-${ano}$`);

    // Procura a maior sequência já usada neste ano.
    const maior = this.processos.reduce((atual, processo) => {
      const achou = regra.exec(processo.numero);
      return achou ? Math.max(atual, Number(achou[1])) : atual;
    }, 0);

    return `${String(maior + 1).padStart(4, '0')}-${ano}`;
  }

  // Mostra o próximo número no formulário (só quando não está editando).
  private atualizarNumero(): void {
    if (this.editandoId === null) {
      this.form.controls.numero.setValue(this.proximoNumero());
    }
  }

  // Valores de um formulário em branco, já com o próximo número.
  private formularioVazio() {
    return {
      numero: this.proximoNumero(),
      cliente: '',
      descricao: '',
      area: '',
      status: 'NENHUM' as StatusFormulario
    };
  }

  // Converte o código da área para o nome exibido na tela.
  nomeArea(area?: string): string {
    if (!area) {
      return '-';
    }
    return this.areas.find(a => a.valor === area)?.nome ?? area;
  }

  // Aplica no formulário a área sugerida pela IA.
  aplicarSugestao(): void {
    if (this.sugestaoIa && this.sugestaoIa.area !== 'indefinido') {
      this.form.controls.area.setValue(this.sugestaoIa.area);
    }
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

  // Mostra uma mensagem no painel de aviso e a remove depois de alguns segundos.
  mostrarAviso(texto: string, milissegundos = 5000): void {
    // Cancela o temporizador anterior, se existir.
    clearTimeout(this.temporizadorAviso);

    // Define a mensagem.
    this.mensagemPermissao = texto;

    // Remove a mensagem depois do tempo combinado.
    this.temporizadorAviso = setTimeout(() => {
      this.mensagemPermissao = '';
    }, milissegundos);
  }

  // Mostra uma mensagem quando visitante tenta fazer algo bloqueado.
  mostrarAvisoPermissao(): void {
    this.mostrarAviso(
      'Visitantes podem visualizar os processos, mas não podem criar, editar ou excluir.',
      3500
    );
  }

  // Transforma o erro da API em uma mensagem para a tela.
  private mensagemDoErro(erro: unknown, padrao: string): string {
    if (erro instanceof HttpErrorResponse) {
      // Status 0 = não houve resposta (API desligada ou bloqueada).
      if (erro.status === 0) {
        return 'Não consegui falar com o servidor. A API está ligada?';
      }

      // A API devolve { erro: 'mensagem' } quando recusa os dados.
      const texto = erro.error?.erro;
      if (typeof texto === 'string') {
        return texto;
      }
    }

    return padrao;
  }

  // Salva um novo processo ou atualiza um processo existente.
  salvar(): void {
    // Se não tiver permissão, bloqueia a ação.
    if (!this.podeAlterarProcessos()) {
      this.mostrarAvisoPermissao();
      return;
    }

    // Se já estiver salvando, ignora o clique.
    if (this.salvando) {
      return;
    }

    // Pega os valores atuais do formulário.
    const valor = this.form.getRawValue();

    // Se o formulário estiver inválido ou o status for NENHUM, marca os campos e para.
    if (this.form.invalid || valor.status === 'NENHUM') {
      this.form.markAllAsTouched();
      return;
    }

    // Dados que vão para a API (o número é gerado pelo servidor).
    const dados = {
      cliente: valor.cliente,
      descricao: valor.descricao,
      area: valor.area,
      status: valor.status as StatusProcesso
    };

    // Se estiver editando um processo existente.
    if (this.editandoId !== null) {
      // Busca o processo antigo na lista carregada.
      const processoExistente = this.service.getById(this.editandoId);

      // Se não encontrar o processo, para a função.
      if (!processoExistente) {
        return;
      }

      this.salvando = true;

      // Atualiza os dados mantendo id, número e data de criação.
      this.service.update({ ...processoExistente, ...dados }).subscribe({
        next: () => {
          this.salvando = false;

          // Sai do modo edição.
          this.cancelarEdicao();
        },
        error: erro => {
          this.salvando = false;
          this.mostrarAviso(
            this.mensagemDoErro(erro, 'Não foi possível atualizar o processo.')
          );
        }
      });

      return;
    }

    this.salvando = true;

    // Se não estiver editando, cria um novo processo.
    this.service.add(dados).subscribe({
      next: () => {
        this.salvando = false;

        // Limpa o formulário depois de salvar (já com o próximo número).
        this.form.reset(this.formularioVazio());
      },
      error: erro => {
        this.salvando = false;
        this.mostrarAviso(
          this.mensagemDoErro(erro, 'Não foi possível salvar o processo.')
        );
      }
    });
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
      area: processo.area ?? '',
      status: processo.status
    });
  }

  // Cancela a edição e limpa o formulário.
  cancelarEdicao(): void {
    // Remove o ID de edição.
    this.editandoId = null;

    // Reseta os campos do formulário (já com o próximo número).
    this.form.reset(this.formularioVazio());
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

    // Exclui o processo na API.
    this.service.delete(id).subscribe({
      next: () => {
        // Se estiver editando esse mesmo processo, cancela a edição.
        if (this.editandoId === id) {
          this.cancelarEdicao();
        }

        // Fecha o modal.
        this.cancelarExclusao();
      },
      error: erro => {
        // Fecha o modal e avisa o que houve.
        this.cancelarExclusao();
        this.mostrarAviso(
          this.mensagemDoErro(erro, 'Não foi possível excluir o processo.')
        );
      }
    });
  }

  // Filtra processos por cliente, status e área.
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

      // Verifica se a área bate com o filtro.
      const areaOk =
        !this.filtroArea ||
        processo.area === this.filtroArea;

      // Retorna apenas processos que passaram nos filtros.
      return clienteOk && statusOk && areaOk;
    });
  }

  // Limpa os filtros.
  limparFiltros(): void {
    // Limpa o filtro de cliente.
    this.filtroCliente = '';

    // Limpa o filtro de status.
    this.filtroStatus = '';

    // Limpa o filtro de área.
    this.filtroArea = '';

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