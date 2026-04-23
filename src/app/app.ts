// Importa Component para criar o componente principal do Angular
import { Component } from '@angular/core';

// Importa NgIf para permitir usar *ngIf no app.html
import { NgIf } from '@angular/common';

// Importa recursos de navegação do Angular
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

// Importa o operador filter para filtrar eventos do Router
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

// Define o componente principal da aplicação
@Component({
  // Nome da tag principal usada no index.html
  selector: 'app-root',

  // Define que este componente é standalone
  standalone: true,

  // Importa recursos usados dentro do app.html
  imports: [
    NgIf,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],

  // Arquivo HTML principal do componente
  templateUrl: './app.html',

  // Arquivo SCSS principal do componente
  styleUrl: './app.scss',

  // Lista de animações usadas no componente
  animations: [

    // Cria uma animação chamada routeAnimations
    trigger('routeAnimations', [

      // Executa a animação em qualquer troca de rota
      transition('* <=> *', [

        // Define que o container da página terá posição relativa
        style({
          position: 'relative'
        }),

        // Seleciona a página que entra e a página que sai
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

        // Executa a animação da página antiga e da nova ao mesmo tempo
        group([

          // Anima a página antiga saindo
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

          // Anima a página nova entrando
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

  // Controla se a caixa de mensagem aparece ou não
  toastVisivel = false;

  // Guarda o título da caixa de mensagem
  toastTitulo = '';

  // Guarda a mensagem menor da caixa
  toastMensagem = '';

  // Controla o tipo visual da caixa
  toastTipo: 'success' | 'info' = 'success';

  // Guarda o temporizador usado para esconder a caixa automaticamente
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  // Injeta o Router para navegar entre páginas e observar mudanças de rota
  constructor(private router: Router) {

    // Observa as mudanças de rota da aplicação
    this.router.events
      .pipe(
        // Filtra apenas o evento de finalização da navegação
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
      )
      .subscribe(() => {

        // Busca uma mensagem salva temporariamente no navegador
        const toastSalvo = localStorage.getItem('appToast');

        // Se existir uma mensagem salva, ela será mostrada
        if (toastSalvo) {

          // Converte o texto salvo em objeto JavaScript
          const toast = JSON.parse(toastSalvo) as {
            titulo: string;
            mensagem: string;
            tipo: 'success' | 'info';
          };

          // Mostra a caixa de mensagem na tela
          this.mostrarToast(
            toast.titulo,
            toast.mensagem,
            toast.tipo
          );

          // Remove a mensagem salva para ela não repetir toda hora
          localStorage.removeItem('appToast');

        }

      });

  }

  // Prepara a rota atual para a animação funcionar
  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }

  // Verifica se o usuário está logado
  estaLogado(): boolean {
    return localStorage.getItem('logado') === 'true';
  }

  // Leva o usuário para a página de login
  irParaLogin() {
    this.router.navigate(['/login']);
  }

  // Função executada ao clicar no botão Sair
  sair() {

    // Remove o login salvo no navegador
    localStorage.removeItem('logado');

    // Mostra uma mensagem de saída
    this.mostrarToast(
      'Sessão encerrada com segurança',
      'Até logo! Você saiu da sua conta.',
      'info'
    );

    // Redireciona o usuário para o Dashboard
    this.router.navigate(['/dashboard']);

  }

  // Mostra a caixa de mensagem na tela
  mostrarToast(
    titulo: string,
    mensagem: string,
    tipo: 'success' | 'info'
  ) {

    // Se já existir um temporizador, ele será limpo
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    // Define o título da caixa
    this.toastTitulo = titulo;

    // Define a mensagem da caixa
    this.toastMensagem = mensagem;

    // Define o tipo da caixa
    this.toastTipo = tipo;

    // Faz a caixa aparecer
    this.toastVisivel = true;

    // Esconde a caixa automaticamente depois de 3 segundos
    this.toastTimer = setTimeout(() => {
      this.toastVisivel = false;
    }, 3000);

  }

  // Fecha a caixa manualmente
  fecharToast() {

    // Esconde a caixa
    this.toastVisivel = false;

    // Se existir temporizador, limpa ele
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

  }

}