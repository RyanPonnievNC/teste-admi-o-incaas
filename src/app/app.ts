// Importa Component para criar o componente principal
import { Component } from '@angular/core';

// Importa NgIf para usar *ngIf no HTML
import { NgIf } from '@angular/common';

// Importa recursos de rota do Angular
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

// Importa filter para filtrar eventos de navegação
import { filter } from 'rxjs';

// Importa recursos de animação do Angular
import {
  trigger,
  transition,
  style,
  animate,
  query,
  group
} from '@angular/animations';

// Importa o serviço de autenticação
import { AuthService } from './core/services/auth.service';

// Define o componente principal da aplicação
@Component({
  // Nome da tag usada no index.html
  selector: 'app-root',

  // Define que este componente é standalone
  standalone: true,

  // Importa recursos usados no app.html
  imports: [
    NgIf,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],

  // Arquivo HTML principal
  templateUrl: './app.html',

  // Arquivo SCSS principal
  styleUrl: './app.scss',

  // Animações da aplicação
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        style({
          position: 'relative'
        }),

        query(
          ':enter, :leave',
          [
            style({
              position: 'absolute',
              width: '100%'
            })
          ],
          {
            optional: true
          }
        ),

        group([
          query(
            ':leave',
            [
              animate(
                '250ms ease',
                style({
                  opacity: 0,
                  transform: 'translateX(-20px)'
                })
              )
            ],
            {
              optional: true
            }
          ),

          query(
            ':enter',
            [
              style({
                opacity: 0,
                transform: 'translateX(20px)'
              }),

              animate(
                '250ms ease',
                style({
                  opacity: 1,
                  transform: 'translateX(0)'
                })
              )
            ],
            {
              optional: true
            }
          )
        ])
      ])
    ])
  ]
})
export class AppComponent {

  // Controla se a mensagem aparece
  toastVisivel = false;

  // Guarda o título da mensagem
  toastTitulo = '';

  // Guarda o texto da mensagem
  toastMensagem = '';

  // Guarda o tipo da mensagem
  toastTipo: 'success' | 'info' = 'success';

  // Guarda o temporizador da mensagem
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  // Injeta Router e AuthService
  constructor(
    private router: Router,
    public authService: AuthService
  ) {

    // Observa mudanças de rota
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
      )
      .subscribe(() => {

        // Busca mensagem temporária salva
        const toastSalvo = localStorage.getItem('appToast');

        // Se existir mensagem salva, mostra na tela
        if (toastSalvo) {

          // Converte texto em objeto
          const toast = JSON.parse(toastSalvo) as {
            titulo: string;
            mensagem: string;
            tipo: 'success' | 'info';
          };

          // Mostra a mensagem
          this.mostrarToast(
            toast.titulo,
            toast.mensagem,
            toast.tipo
          );

          // Remove a mensagem para não repetir
          localStorage.removeItem('appToast');

        }

      });

  }

  // Prepara a rota atual para animação
  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }

  // Verifica se a rota atual é a tela de login
  isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  // Verifica se o usuário está logado
  estaLogado(): boolean {
    return this.authService.estaLogado();
  }

  // Verifica se o usuário é administrador
  ehAdmin(): boolean {
    return this.authService.ehAdmin();
  }

  // Verifica se o usuário é visitante
  ehVisitante(): boolean {
    return this.authService.ehVisitante();
  }

  // Vai para a tela de login
  irParaLogin() {
    this.router.navigate(['/login']);
  }

  // Sai da conta
  sair() {

    // Remove os dados de login
    this.authService.logout();

    // Mostra mensagem de saída
    this.mostrarToast(
      'Sessão encerrada',
      'Você saiu da sua conta com segurança.',
      'info'
    );

    // Volta para login
    this.router.navigate(['/login']);

  }

  // Mostra uma caixa de mensagem
  mostrarToast(
    titulo: string,
    mensagem: string,
    tipo: 'success' | 'info'
  ) {

    // Limpa temporizador antigo
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    // Define título
    this.toastTitulo = titulo;

    // Define mensagem
    this.toastMensagem = mensagem;

    // Define tipo
    this.toastTipo = tipo;

    // Mostra caixa
    this.toastVisivel = true;

    // Esconde automaticamente depois de 3 segundos
    this.toastTimer = setTimeout(() => {
      this.toastVisivel = false;
    }, 3000);

  }

  // Fecha a caixa manualmente
  fecharToast() {

    // Esconde caixa
    this.toastVisivel = false;

    // Limpa temporizador
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

  }

}