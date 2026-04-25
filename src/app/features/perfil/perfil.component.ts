// Importa Component para criar o componente Perfil
import { Component } from '@angular/core';

// Importa CommonModule para usar recursos básicos do Angular
import { CommonModule } from '@angular/common';

// Importa Router para permitir navegação entre páginas
import { Router } from '@angular/router';

// Importa o serviço de autenticação
import { AuthService } from '../../core/services/auth.service';

// Define o componente Perfil
@Component({
  // Nome da tag do componente
  selector: 'app-perfil',

  // Define que o componente é standalone
  standalone: true,

  // Importa recursos usados no HTML
  imports: [
    CommonModule
  ],

  // Arquivo HTML do componente
  templateUrl: './perfil.component.html',

  // Arquivo SCSS do componente
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent {

  // Injeta Router e AuthService
  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  // Função para sair da conta
  sair() {

    // Remove os dados do usuário logado
    this.authService.logout();

    // Volta para a tela de login
    this.router.navigate(['/login']);

  }

}