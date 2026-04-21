// Importa recursos principais do Angular
// - Component: cria o componente
// - OnInit: executa lógica quando o componente é iniciado
// - inject: injeta dependências sem usar constructor
import { Component, OnInit, inject } from '@angular/core';

// Importa funcionalidades comuns do Angular
// Exemplo: diretivas como *ngIf e *ngFor
import { CommonModule } from '@angular/common';

// Importa recursos de formulários
// - FormsModule: usado com ngModel
// - NonNullableFormBuilder: cria formulário reativo sem valores nulos
// - ReactiveFormsModule: permite usar formGroup e formControlName
// - Validators: fornece validações prontas, como required
import {
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

// Importa a tabela do PrimeNG
import { TableModule } from 'primeng/table';

// Importa o botão do PrimeNG
import { ButtonModule } from 'primeng/button';

// Importa a tag do PrimeNG para exibir status com destaque visual
import { TagModule } from 'primeng/tag';

// Importa o serviço responsável por gerenciar os processos
import { ProcessoService } from '../../core/services/processo.service';

// Importa a tipagem do processo
import { Processo } from '../../models/processo.model';

// Tipo com os status válidos de um processo
type StatusProcesso = 'ATIVO' | 'FINALIZADO' | 'SUSPENSO';

// Tipo usado no formulário
// Inclui "NENHUM" para representar a opção padrão do select
type StatusFormulario = 'NENHUM' | StatusProcesso;

// Decorador com as configurações do componente
@Component({
  // Nome da tag usada no HTML
  selector: 'app-processos',

  // Define que o componente é standalone
  standalone: true,

  // Módulos necessários para o template funcionar
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    TagModule
  ],

  // Arquivo HTML ligado a este componente
  templateUrl: './processos.component.html'
})

// Classe principal do componente
export class ProcessosComponent implements OnInit {

  // Injeta o construtor de formulários reativos
  private fb = inject(NonNullableFormBuilder);

  // Injeta o serviço de processos
  private service = inject(ProcessoService);

  // Lista completa de processos
  processos: Processo[] = [];

  // Lista de processos após aplicação dos filtros
  processosFiltrados: Processo[] = [];

  // Guarda o id do processo que está sendo editado
  // Se for null, significa que estamos em modo de cadastro
  editandoId: number | null = null;

  // Texto do filtro por cliente
  filtroCliente = '';

  // Filtro por status
  // Pode ser vazio quando nenhum status foi escolhido
  filtroStatus: '' | StatusProcesso = '';

  // Formulário reativo principal
  // Cada campo representa uma informação do processo
  form = this.fb.group({
    numero: ['', Validators.required],
    cliente: ['', Validators.required],
    descricao: [''],
    status: ['NENHUM' as StatusFormulario, Validators.required]
  });

  // Método executado automaticamente quando o componente inicia
  ngOnInit() {

    // Busca todos os processos no serviço
    this.service.getAll().subscribe(data => {

      // Armazena os dados recebidos
      this.processos = data;

      // Aplica os filtros para preencher a lista visível
      this.aplicarFiltros();
    });
  }

  // Método responsável por salvar um processo
  // Pode cadastrar um novo ou atualizar um existente
  salvar() {

    // Pega os valores atuais do formulário
    const valor = this.form.getRawValue();

    // Impede o salvamento se o formulário for inválido
    // ou se o status ainda estiver como "NENHUM"
    if (this.form.invalid || valor.status === 'NENHUM') {
      this.form.markAllAsTouched();
      return;
    }

    // Se existir um id em edição, atualiza o processo atual
    if (this.editandoId !== null) {

      // Busca o processo original pelo id
      const processoExistente = this.service.getById(this.editandoId);

      // Se não encontrar, interrompe a execução
      if (!processoExistente) return;

      // Atualiza o processo mantendo os dados antigos
      // e substituindo os campos editados
      this.service.update({
        ...processoExistente,
        numero: valor.numero,
        cliente: valor.cliente,
        descricao: valor.descricao,
        status: valor.status as StatusProcesso
      });

      // Sai do modo de edição
      this.cancelarEdicao();

      // Atualiza a lista filtrada
      this.aplicarFiltros();
      return;
    }

    // Se não estiver editando, adiciona um novo processo
    this.service.add({
      numero: valor.numero,
      cliente: valor.cliente,
      descricao: valor.descricao,
      status: valor.status as StatusProcesso
    });

    // Reseta o formulário para o estado inicial
    this.form.reset({
      numero: '',
      cliente: '',
      descricao: '',
      status: 'NENHUM'
    });

    // Atualiza a lista filtrada
    this.aplicarFiltros();
  }

  // Método chamado ao clicar em editar
  editar(processo: Processo) {

    // Guarda o id do processo em edição
    this.editandoId = processo.id;

    // Preenche o formulário com os dados do processo selecionado
    this.form.setValue({
      numero: processo.numero,
      cliente: processo.cliente,
      descricao: processo.descricao,
      status: processo.status
    });
  }

  // Cancela o modo de edição e limpa o formulário
  cancelarEdicao() {

    // Remove o id de edição
    this.editandoId = null;

    // Restaura os valores iniciais do formulário
    this.form.reset({
      numero: '',
      cliente: '',
      descricao: '',
      status: 'NENHUM'
    });
  }

  // Exclui um processo pelo id
  excluir(id: number) {

    // Mostra uma confirmação antes de excluir
    const confirmou = window.confirm('Tem certeza que deseja excluir este processo?');

    // Se o usuário cancelar, interrompe a exclusão
    if (!confirmou) return;

    // Se o processo excluído for o mesmo que está em edição,
    // sai do modo de edição
    if (this.editandoId === id) {
      this.cancelarEdicao();
    }

    // Remove o processo do serviço
    this.service.delete(id);

    // Atualiza a lista filtrada
    this.aplicarFiltros();
  }

  // Aplica os filtros de cliente e status
  aplicarFiltros() {

    // Filtra a lista completa de processos
    this.processosFiltrados = this.processos.filter(processo => {

      // Verifica se o cliente atende ao filtro digitado
      const clienteOk =
        !this.filtroCliente ||
        processo.cliente.toLowerCase().includes(this.filtroCliente.toLowerCase());

      // Verifica se o status atende ao filtro selecionado
      const statusOk =
        !this.filtroStatus || processo.status === this.filtroStatus;

      // Só mantém o processo se os dois critérios forem verdadeiros
      return clienteOk && statusOk;
    });
  }

  // Limpa todos os filtros e mostra novamente todos os processos
  limparFiltros() {
    this.filtroCliente = '';
    this.filtroStatus = '';
    this.aplicarFiltros();
  }

  // Retorna a cor visual da tag com base no status do processo
  getStatusSeverity(status: StatusProcesso): 'success' | 'danger' | 'warn' {
    switch (status) {

      // Status ativo recebe cor de sucesso
      case 'ATIVO':
        return 'success';

      // Status finalizado recebe cor de perigo
      case 'FINALIZADO':
        return 'danger';

      // Status suspenso recebe cor de aviso
      case 'SUSPENSO':
        return 'warn';
    }
  }
}