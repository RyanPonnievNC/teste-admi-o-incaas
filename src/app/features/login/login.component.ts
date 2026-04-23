// Importa Component para criar o componente Login
import { Component } from '@angular/core';

// Importa Router para permitir navegação entre páginas
import { Router } from '@angular/router';

// Define o componente Login
@Component({
  // Nome da tag do componente
  selector: 'app-login',

  // Define que este componente é standalone
  standalone: true,

  // Arquivo HTML usado por este componente
  templateUrl: './login.component.html',

  // Arquivo SCSS usado por este componente
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  // Injeta o Router para permitir redirecionar para outras páginas
  constructor(private router: Router) {}

  // Função executada ao clicar no botão Entrar
  entrar() {

    // Salva no navegador que o usuário fez login
    localStorage.setItem('logado', 'true');

    // Salva uma mensagem temporária para aparecer depois da navegação
    localStorage.setItem(
      'appToast',
      JSON.stringify({
        titulo: 'Login realizado com sucesso',
        mensagem: 'Bem-vindo ao Jurídico Pro.',
        tipo: 'success'
      })
    );

    // Redireciona para o Dashboard
    this.router.navigate(['/dashboard']);

  }

}