// Importa Component para criar o componente Perfil
import { Component, OnInit } from '@angular/core';

// Importa CommonModule para usar recursos básicos do Angular
import { CommonModule } from '@angular/common';

// Importa FormsModule para usar ngModel no formulário de edição
import { FormsModule } from '@angular/forms';

// Importa Router para permitir navegação entre páginas
import { Router } from '@angular/router';

// Importa o serviço de autenticação
import { AuthService } from '../../core/services/auth.service';

// Define o componente Perfil
@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent implements OnInit {

  // Controla se está editando
  modoEdicao = false;

  // Mensagem de erro
  mensagemErro = '';

  // Mensagem de sucesso
  mensagemSucesso = '';

  // Nome em edição
  editarNome = '';

  // Sobrenome em edição
  editarSobrenome = '';

  // Idade em edição
  editarIdade: number | null = null;

  // CPF em edição
  editarCpf = '';

  // Usuário em edição
  editarUsuario = '';

  // Senha em edição
  editarSenha = '';

  // Foto em edição
  editarFotoUrl = '';

  // Controla se a senha da edição aparece ou fica escondida
  mostrarSenhaEdicao = false;

  // Injeta Router e AuthService
  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  // Executa quando abre a página
  ngOnInit() {
    this.preencherFormularioEdicao();
  }

  // Preenche formulário com dados atuais
  preencherFormularioEdicao() {
    const usuario = this.authService.usuarioAtual();

    if (!usuario) {
      return;
    }

    this.editarNome = usuario.nome;
    this.editarSobrenome = usuario.sobrenome;
    this.editarIdade = usuario.idade;
    this.editarCpf = usuario.cpf;
    this.editarUsuario = usuario.usuario;
    this.editarSenha = this.authService.senhaContaAdminAtual();
    this.editarFotoUrl = usuario.fotoUrl || '';
  }

  // Abre edição
  abrirEdicao() {
    this.mensagemErro = '';
    this.mensagemSucesso = '';
    this.mostrarSenhaEdicao = false;
    this.preencherFormularioEdicao();
    this.modoEdicao = true;
  }

  // Cancela edição
  cancelarEdicao() {
    this.modoEdicao = false;
    this.mensagemErro = '';
    this.mensagemSucesso = '';
    this.mostrarSenhaEdicao = false;
    this.preencherFormularioEdicao();
  }

  // Alterna senha da edição
  alternarSenhaEdicao() {
    this.mostrarSenhaEdicao = !this.mostrarSenhaEdicao;
  }

  // Seleciona foto na edição
  selecionarFotoEdicao(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const arquivo = input.files[0];

    if (!arquivo.type.startsWith('image/')) {
      this.mensagemErro = 'Selecione apenas arquivos de imagem.';
      return;
    }

    const leitor = new FileReader();

    leitor.onload = () => {
      this.editarFotoUrl = String(leitor.result);
    };

    leitor.readAsDataURL(arquivo);
  }

  // Remove foto da edição
  removerFotoEdicao() {
    this.editarFotoUrl = '';
  }

  // Salva edição
  salvarEdicao() {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    const resultado = this.authService.atualizarContaAdminAtual({
      nome: this.editarNome,
      sobrenome: this.editarSobrenome,
      idade: Number(this.editarIdade),
      cpf: this.editarCpf,
      usuario: this.editarUsuario,
      senha: this.editarSenha,
      fotoUrl: this.editarFotoUrl
    });

    if (!resultado.sucesso) {
      this.mensagemErro = resultado.mensagem;
      return;
    }

    this.mensagemSucesso = resultado.mensagem;
    this.modoEdicao = false;
    this.mostrarSenhaEdicao = false;
    this.preencherFormularioEdicao();
  }

  // Sai da conta
  sair() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}