import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-recuperar-senha',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './recuperar-senha.component.html',
  styleUrl: './recuperar-senha.component.scss'
})
export class RecuperarSenhaComponent {
  usuarioDigitado = '';
  novaSenha = '';
  confirmarSenha = '';
  etapa: 1 | 2 = 1;
  usuarioEncontrado = '';
  mensagemErro = '';
  mensagemSucesso = '';
  novaSenhaVisivel = false;
  confirmarSenhaVisivel = false;
  caminhoOlhoAberto = '/eye-open.png';
  caminhoOlhoFechado = '/eye-closed.png';

  constructor(private router: Router, private authService: AuthService) {}

  alternarNovaSenha(): void { this.novaSenhaVisivel = !this.novaSenhaVisivel; }
  alternarConfirmarSenha(): void { this.confirmarSenhaVisivel = !this.confirmarSenhaVisivel; }

  verificarUsuario(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';
    if (!this.usuarioDigitado.trim()) { this.mensagemErro = 'Digite o nome de usuario.'; return; }
    const resultado = this.authService.verificarUsuarioParaRecuperacao(this.usuarioDigitado.trim());
    if (!resultado) { this.mensagemErro = 'Usuario nao encontrado.'; return; }
    this.usuarioEncontrado = this.usuarioDigitado.trim();
    this.etapa = 2;
  }

  redefinirSenha(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';
    if (!this.novaSenha || this.novaSenha.length < 6) { this.mensagemErro = 'A nova senha precisa ter pelo menos 6 caracteres.'; return; }
    if (this.novaSenha !== this.confirmarSenha) { this.mensagemErro = 'As senhas nao coincidem.'; return; }
    const resultado = this.authService.redefinirSenha(this.usuarioEncontrado, this.novaSenha);
    if (!resultado.sucesso) { this.mensagemErro = resultado.mensagem; return; }
    this.mensagemSucesso = resultado.mensagem;
    setTimeout(() => { this.router.navigate(['/login']); }, 1500);
  }

  voltarParaLogin(): void { this.router.navigate(['/login']); }
}