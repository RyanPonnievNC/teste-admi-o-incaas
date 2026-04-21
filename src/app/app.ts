// Importa o decorator Component do Angular
// Ele é usado para transformar a classe em um componente Angular
import { Component } from '@angular/core';

// Importa recursos de rotas do Angular
// - RouterLink: cria links de navegação
// - RouterLinkActive: aplica classe quando rota estiver ativa
// - RouterOutlet: local onde as páginas serão carregadas
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

// Decorador com as configurações do componente principal
@Component({

  // Nome da tag HTML deste componente
  // Geralmente usada no index.html como <app-root>
  selector: 'app-root',

  // Define que o componente é standalone
  // Ou seja, não precisa estar dentro de AppModule
  standalone: true,

  // Lista os recursos usados no HTML deste componente
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],

  // Arquivo HTML principal da aplicação
  templateUrl: './app.html',

  // Arquivo de estilos SCSS do componente
  styleUrl: './app.scss'
})

// Classe principal da aplicação
// Este é o primeiro componente carregado ao abrir o sistema
export class AppComponent {}