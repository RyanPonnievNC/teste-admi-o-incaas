// Importa Component e OnInit para criar o componente e executar ações quando ele iniciar.
import { Component, OnInit } from '@angular/core';

// Importa FormsModule para usar [(ngModel)] nos campos do formulário.
import { FormsModule } from '@angular/forms';

// Importa NgIf para usar *ngIf no HTML.
import { NgIf } from '@angular/common';

// Importa Router e RouterLink para navegação entre páginas.
import { Router, RouterLink } from '@angular/router';

// Importa o serviço de autenticação do projeto.
import { AuthService } from '../../core/services/auth.service';

// Define as configurações principais do componente de login.
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

// Classe principal da tela de login.
export class LoginComponent implements OnInit {

  modoCadastroAdmin = false;
  usuario = '';
  senha = '';
  mensagemErro = '';
  mensagemSucesso = '';
  cadastroNome = '';
  cadastroSobrenome = '';
  cadastroIdade: number | null = null;
  cadastroCpf = '';
  cadastroUsuario = '';
  cadastroSenha = '';
  cadastroCodigoVerificacao = '';
  senhaLoginVisivel = false;
  senhaCadastroVisivel = false;
  codigoVerificacaoVisivel = false;
  caminhoOlhoAberto = '/eye-open.png';
  caminhoOlhoFechado = '/eye-closed.png';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.limparTelaLogin();
  }

  alternarVisibilidadeSenhaLogin(): void {
    this.senhaLoginVisivel = !this.senhaLoginVisivel;
  }

  alternarVisibilidadeSenhaCadastro(): void {
    this.senhaCadastroVisivel = !this.senhaCadastroVisivel;
  }

  alternarVisibilidadeCodigoVerificacao(): void {
    this.codigoVerificacaoVisivel = !this.codigoVerificacaoVisivel;
  }

  limparTelaLogin(): void {
    this.modoCadastroAdmin = false;
    this.usuario = '';
    this.senha = '';
    this.senhaLoginVisivel = false;
    this.senhaCadastroVisivel = false;
    this.codigoVerificacaoVisivel = false;
    this.mensagemErro = '';
    this.mensagemSucesso = '';
    this.limparCadastroAdmin();
  }

  entrarComoAdmin(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    const loginValido = this.authService.login(this.usuario, this.senha);

    if (!loginValido) {
      this.mensagemErro = 'Usuário ou senha de administrador inválidos.';
      return;
    }

    this.usuario = '';
    this.senha = '';
    this.senhaLoginVisivel = false;

    localStorage.setItem(
      'appToast',
      JSON.stringify({
        titulo: 'Acesso administrativo liberado',
        mensagem: 'Você entrou como administrador do Jurídico Pro.',
        tipo: 'success'
      })
    );

    this.router.navigate(['/dashboard']);
  }

  entrarComoVisitante(): void {
    this.limparTelaLogin();
    this.authService.entrarComoVisitante();

    localStorage.setItem(
      'appToast',
      JSON.stringify({
        titulo: 'Acesso como visitante',
        mensagem: 'Você pode visualizar o painel e os clientes.',
        tipo: 'info'
      })
    );

    this.router.navigate(['/dashboard']);
  }

  abrirCadastroAdmin(): void {
    this.modoCadastroAdmin = true;
    this.usuario = '';
    this.senha = '';
    this.senhaLoginVisivel = false;
    this.senhaCadastroVisivel = false;
    this.codigoVerificacaoVisivel = false;
    this.mensagemErro = '';
    this.mensagemSucesso = '';
    this.limparCadastroAdmin();
  }

  voltarParaLogin(): void {
    this.modoCadastroAdmin = false;
    this.limparTelaLogin();
  }

  criarContaAdmin(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    const resultado = this.authService.criarContaAdmin(
      this.cadastroNome,
      this.cadastroSobrenome,
      Number(this.cadastroIdade),
      this.cadastroCpf,
      this.cadastroUsuario,
      this.cadastroSenha,
      this.cadastroCodigoVerificacao,
      ''
    );

    if (!resultado.sucesso) {
      this.mensagemErro = resultado.mensagem;
      return;
    }

    this.mensagemSucesso = resultado.mensagem;
    this.limparCadastroAdmin();
    this.senhaCadastroVisivel = false;
    this.codigoVerificacaoVisivel = false;

    setTimeout(() => {
      this.modoCadastroAdmin = false;
      this.usuario = '';
      this.senha = '';
      this.senhaLoginVisivel = false;
    }, 1000);
  }

  limparCadastroAdmin(): void {
    this.cadastroNome = '';
    this.cadastroSobrenome = '';
    this.cadastroIdade = null;
    this.cadastroCpf = '';
    this.cadastroUsuario = '';
    this.cadastroSenha = '';
    this.cadastroCodigoVerificacao = '';
  }
}