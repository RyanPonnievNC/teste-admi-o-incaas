// Importa Component para criar o componente Login
import { Component, OnInit } from '@angular/core';

// Importa FormsModule para permitir usar [(ngModel)] no HTML
import { FormsModule } from '@angular/forms';

// Importa NgIf para permitir usar *ngIf no HTML
import { NgIf } from '@angular/common';

// Importa Router para navegar entre páginas
import { Router } from '@angular/router';

// Importa o serviço de autenticação
import { AuthService } from '../../core/services/auth.service';

// Define o componente Login
@Component({
  // Nome da tag do componente
  selector: 'app-login',

  // Define que o componente é standalone
  standalone: true,

  // Importa recursos usados no HTML
  imports: [
    FormsModule,
    NgIf
  ],

  // Arquivo HTML do login
  templateUrl: './login.component.html',

  // Arquivo SCSS do login
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  // Controla se está mostrando login ou cadastro de admin
  modoCadastroAdmin = false;

  // Guarda o usuário digitado no login
  usuario = '';

  // Guarda a senha digitada no login
  senha = '';

  // Guarda mensagem de erro do login
  mensagemErro = '';

  // Guarda mensagem de sucesso
  mensagemSucesso = '';

  // Guarda o nome digitado no cadastro
  cadastroNome = '';

  // Guarda o sobrenome digitado no cadastro
  cadastroSobrenome = '';

  // Guarda a idade digitada no cadastro
  cadastroIdade: number | null = null;

  // Guarda o CPF digitado no cadastro
  cadastroCpf = '';

  // Guarda o usuário digitado no cadastro
  cadastroUsuario = '';

  // Guarda a senha digitada no cadastro
  cadastroSenha = '';

  // Guarda o código de verificação digitado no cadastro
  cadastroCodigoVerificacao = '';

  // Injeta Router e AuthService
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  // Executa sempre que a tela de login for aberta
  ngOnInit() {

    // Limpa todos os campos quando entrar na página de login
    this.limparTelaLogin();

  }

  // Limpa toda a tela de login e cadastro
  limparTelaLogin() {

    // Volta para o modo login normal
    this.modoCadastroAdmin = false;

    // Limpa usuário do login
    this.usuario = '';

    // Limpa senha do login
    this.senha = '';

    // Limpa mensagem de erro
    this.mensagemErro = '';

    // Limpa mensagem de sucesso
    this.mensagemSucesso = '';

    // Limpa campos do cadastro admin
    this.limparCadastroAdmin();

  }

  // Função chamada ao clicar no botão Entrar como administrador
  entrarComoAdmin() {

    // Limpa mensagens anteriores
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    // Tenta fazer login com usuário e senha
    const loginValido = this.authService.login(this.usuario, this.senha);

    // Se o login estiver errado, mostra erro
    if (!loginValido) {
      this.mensagemErro = 'Usuário ou senha de administrador inválidos.';
      return;
    }

    // Limpa os campos depois do login dar certo
    this.usuario = '';
    this.senha = '';

    // Salva uma mensagem temporária para aparecer depois do login
    localStorage.setItem(
      'appToast',
      JSON.stringify({
        titulo: 'Acesso administrativo liberado',
        mensagem: 'Você entrou como administrador do Jurídico Pro.',
        tipo: 'success'
      })
    );

    // Redireciona para o Dashboard
    this.router.navigate(['/dashboard']);

  }

  // Função chamada ao clicar no botão Visitante
  entrarComoVisitante() {

    // Limpa os campos antes de entrar como visitante
    this.limparTelaLogin();

    // Entra no sistema como visitante
    this.authService.entrarComoVisitante();

    // Salva uma mensagem temporária para aparecer depois da navegação
    localStorage.setItem(
      'appToast',
      JSON.stringify({
        titulo: 'Acesso como visitante',
        mensagem: 'Você pode visualizar o painel e os clientes.',
        tipo: 'info'
      })
    );

    // Redireciona para o Dashboard
    this.router.navigate(['/dashboard']);

  }

  // Abre o formulário de cadastro de administrador
  abrirCadastroAdmin() {

    // Ativa modo cadastro
    this.modoCadastroAdmin = true;

    // Limpa campos de login
    this.usuario = '';
    this.senha = '';

    // Limpa mensagens
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    // Limpa campos do cadastro
    this.limparCadastroAdmin();

  }

  // Volta para a tela de login
  voltarParaLogin() {

    // Desativa modo cadastro
    this.modoCadastroAdmin = false;

    // Limpa todos os campos
    this.limparTelaLogin();

  }

  // Cria uma nova conta administradora
  criarContaAdmin() {

    // Limpa mensagens anteriores
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    // Chama o service para tentar criar a conta
    const resultado = this.authService.criarContaAdmin(
      this.cadastroNome,
      this.cadastroSobrenome,
      Number(this.cadastroIdade),
      this.cadastroCpf,
      this.cadastroUsuario,
      this.cadastroSenha,
      this.cadastroCodigoVerificacao
    );

    // Se não conseguir criar, mostra erro
    if (!resultado.sucesso) {
      this.mensagemErro = resultado.mensagem;
      return;
    }

    // Mostra mensagem de sucesso
    this.mensagemSucesso = resultado.mensagem;

    // Limpa os campos do cadastro
    this.limparCadastroAdmin();

    // Depois de 1 segundo, volta para o login
    setTimeout(() => {

      // Volta para o modo login
      this.modoCadastroAdmin = false;

      // Limpa os campos do login também
      this.usuario = '';
      this.senha = '';

    }, 1000);

  }

  // Limpa os campos do cadastro
  limparCadastroAdmin() {

    // Limpa nome
    this.cadastroNome = '';

    // Limpa sobrenome
    this.cadastroSobrenome = '';

    // Limpa idade
    this.cadastroIdade = null;

    // Limpa CPF
    this.cadastroCpf = '';

    // Limpa usuário
    this.cadastroUsuario = '';

    // Limpa senha
    this.cadastroSenha = '';

    // Limpa código de verificação
    this.cadastroCodigoVerificacao = '';

  }

}