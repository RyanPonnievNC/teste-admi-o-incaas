// Importa Component e OnInit para criar o componente e executar ações quando ele iniciar.
import { Component, OnInit } from '@angular/core';

// Importa FormsModule para usar [(ngModel)] nos campos do formulário.
import { FormsModule } from '@angular/forms';

// Importa NgIf para usar *ngIf no HTML.
import { NgIf } from '@angular/common';

// Importa Router para navegar entre páginas.
import { Router } from '@angular/router';

// Importa o serviço de autenticação do projeto.
import { AuthService } from '../../core/services/auth.service';

// Define as configurações principais do componente de login.
@Component({
  // Nome da tag HTML que representa este componente.
  selector: 'app-login',

  // Define que este componente é standalone.
  standalone: true,

  // Importa os recursos usados no HTML deste componente.
  imports: [FormsModule, NgIf],

  // Define o arquivo HTML usado por este componente.
  templateUrl: './login.component.html',

  // Define o arquivo SCSS usado por este componente.
  styleUrl: './login.component.scss'
})

// Classe principal da tela de login.
export class LoginComponent implements OnInit {
  // Controla se a tela está no modo de cadastro de administrador.
  modoCadastroAdmin = false;

  // Guarda o usuário digitado no login.
  usuario = '';

  // Guarda a senha digitada no login.
  senha = '';

  // Guarda a mensagem de erro exibida na tela.
  mensagemErro = '';

  // Guarda a mensagem de sucesso exibida na tela.
  mensagemSucesso = '';

  // Guarda o nome digitado no cadastro de administrador.
  cadastroNome = '';

  // Guarda o sobrenome digitado no cadastro de administrador.
  cadastroSobrenome = '';

  // Guarda a idade digitada no cadastro de administrador.
  cadastroIdade: number | null = null;

  // Guarda o CPF digitado no cadastro de administrador.
  cadastroCpf = '';

  // Guarda o usuário digitado no cadastro de administrador.
  cadastroUsuario = '';

  // Guarda a senha digitada no cadastro de administrador.
  cadastroSenha = '';

  // Guarda o código de verificação digitado no cadastro de administrador.
  cadastroCodigoVerificacao = '';

  // Controla se a senha do login está visível ou escondida.
  senhaLoginVisivel = false;

  // Controla se a senha do cadastro está visível ou escondida.
  senhaCadastroVisivel = false;

  // Controla se o código de verificação está visível ou escondido.
  codigoVerificacaoVisivel = false;

  // Caminho da imagem de olho aberto dentro da pasta public.
  caminhoOlhoAberto = '/eye-open.png';

  // Caminho da imagem de olho fechado dentro da pasta public.
  caminhoOlhoFechado = '/eye-closed.png';

  // Injeta o Router para navegação e o AuthService para autenticação.
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  // Executa automaticamente quando a tela de login é aberta.
  ngOnInit(): void {
    // Limpa os campos da tela ao iniciar.
    this.limparTelaLogin();
  }

  // Alterna entre mostrar e esconder a senha do login.
  alternarVisibilidadeSenhaLogin(): void {
    // Inverte o valor atual da variável.
    this.senhaLoginVisivel = !this.senhaLoginVisivel;
  }

  // Alterna entre mostrar e esconder a senha do cadastro.
  alternarVisibilidadeSenhaCadastro(): void {
    // Inverte o valor atual da variável.
    this.senhaCadastroVisivel = !this.senhaCadastroVisivel;
  }

  // Alterna entre mostrar e esconder o código de verificação.
  alternarVisibilidadeCodigoVerificacao(): void {
    // Inverte o valor atual da variável.
    this.codigoVerificacaoVisivel = !this.codigoVerificacaoVisivel;
  }

  // Limpa toda a tela de login e cadastro.
  limparTelaLogin(): void {
    // Volta para a tela de login normal.
    this.modoCadastroAdmin = false;

    // Limpa o usuário do login.
    this.usuario = '';

    // Limpa a senha do login.
    this.senha = '';

    // Esconde novamente a senha do login.
    this.senhaLoginVisivel = false;

    // Esconde novamente a senha do cadastro.
    this.senhaCadastroVisivel = false;

    // Esconde novamente o código de verificação.
    this.codigoVerificacaoVisivel = false;

    // Limpa a mensagem de erro.
    this.mensagemErro = '';

    // Limpa a mensagem de sucesso.
    this.mensagemSucesso = '';

    // Limpa os campos do cadastro.
    this.limparCadastroAdmin();
  }

  // Função chamada ao clicar no botão "Entrar como administrador".
  entrarComoAdmin(): void {
    // Limpa mensagens antigas.
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    // Tenta fazer login com o usuário e a senha digitados.
    const loginValido = this.authService.login(this.usuario, this.senha);

    // Se o login não for válido, mostra erro e para a função.
    if (!loginValido) {
      this.mensagemErro = 'Usuário ou senha de administrador inválidos.';
      return;
    }

    // Limpa o usuário depois do login.
    this.usuario = '';

    // Limpa a senha depois do login.
    this.senha = '';

    // Esconde a senha novamente.
    this.senhaLoginVisivel = false;

    // Salva uma mensagem temporária para aparecer depois da navegação.
    localStorage.setItem(
      'appToast',
      JSON.stringify({
        titulo: 'Acesso administrativo liberado',
        mensagem: 'Você entrou como administrador do Jurídico Pro.',
        tipo: 'success'
      })
    );

    // Redireciona para o dashboard.
    this.router.navigate(['/dashboard']);
  }

  // Função chamada ao clicar no botão "Entrar como visitante".
  entrarComoVisitante(): void {
    // Limpa todos os campos da tela.
    this.limparTelaLogin();

    // Entra no sistema como visitante.
    this.authService.entrarComoVisitante();

    // Salva uma mensagem temporária para aparecer depois da navegação.
    localStorage.setItem(
      'appToast',
      JSON.stringify({
        titulo: 'Acesso como visitante',
        mensagem: 'Você pode visualizar o painel e os clientes.',
        tipo: 'info'
      })
    );

    // Redireciona para o dashboard.
    this.router.navigate(['/dashboard']);
  }

  // Abre o formulário de cadastro de administrador.
  abrirCadastroAdmin(): void {
    // Ativa o modo cadastro.
    this.modoCadastroAdmin = true;

    // Limpa o usuário do login.
    this.usuario = '';

    // Limpa a senha do login.
    this.senha = '';

    // Esconde a senha do login.
    this.senhaLoginVisivel = false;

    // Esconde a senha do cadastro.
    this.senhaCadastroVisivel = false;

    // Esconde o código de verificação.
    this.codigoVerificacaoVisivel = false;

    // Limpa mensagens antigas.
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    // Limpa os campos do cadastro.
    this.limparCadastroAdmin();
  }

  // Volta da tela de cadastro para a tela de login.
  voltarParaLogin(): void {
    // Desativa o modo cadastro.
    this.modoCadastroAdmin = false;

    // Limpa todos os campos.
    this.limparTelaLogin();
  }

  // Cria uma nova conta de administrador.
  criarContaAdmin(): void {
    // Limpa mensagens antigas de erro.
    this.mensagemErro = '';

    // Limpa mensagens antigas de sucesso.
    this.mensagemSucesso = '';

    // Chama o AuthService para tentar criar a conta administradora.
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

    // Se a conta não for criada, mostra a mensagem de erro.
    if (!resultado.sucesso) {
      this.mensagemErro = resultado.mensagem;
      return;
    }

    // Mostra a mensagem de sucesso.
    this.mensagemSucesso = resultado.mensagem;

    // Limpa os campos do cadastro.
    this.limparCadastroAdmin();

    // Esconde a senha do cadastro novamente.
    this.senhaCadastroVisivel = false;

    // Esconde o código de verificação novamente.
    this.codigoVerificacaoVisivel = false;

    // Depois de 1 segundo, volta para a tela de login.
    setTimeout(() => {
      // Volta para o modo login.
      this.modoCadastroAdmin = false;

      // Limpa o usuário do login.
      this.usuario = '';

      // Limpa a senha do login.
      this.senha = '';

      // Esconde a senha do login.
      this.senhaLoginVisivel = false;
    }, 1000);
  }

  // Limpa todos os campos do cadastro de administrador.
  limparCadastroAdmin(): void {
    // Limpa o nome.
    this.cadastroNome = '';

    // Limpa o sobrenome.
    this.cadastroSobrenome = '';

    // Limpa a idade.
    this.cadastroIdade = null;

    // Limpa o CPF.
    this.cadastroCpf = '';

    // Limpa o usuário.
    this.cadastroUsuario = '';

    // Limpa a senha.
    this.cadastroSenha = '';

    // Limpa o código de verificação.
    this.cadastroCodigoVerificacao = '';
  }
}