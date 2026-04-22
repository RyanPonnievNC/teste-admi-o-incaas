// Importa Component do Angular
import { Component } from '@angular/core';

// Importa recursos de rota
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

// Importa recursos de animação do Angular
import {
  trigger,
  transition,
  style,
  animate,
  query,
  group
} from '@angular/animations';

@Component({
  // Nome da tag principal da aplicação
  selector: 'app-root',

  // Define como standalone
  standalone: true,

  // Importa módulos usados no HTML
  imports: [RouterOutlet, RouterLink, RouterLinkActive],

  // Arquivo HTML
  templateUrl: './app.html',

  // Arquivo SCSS
  styleUrl: './app.scss',

  // Lista de animações do componente
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        style({ position: 'relative' }),

        query(':enter, :leave', [
          style({
            position: 'absolute',
            width: '100%'
          })
        ], { optional: true }),

        group([
          query(':leave', [
            animate(
              '250ms ease',
              style({
                opacity: 0,
                transform: 'translateX(-20px)'
              })
            )
          ], { optional: true }),

          query(':enter', [
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
          ], { optional: true })
        ])
      ])
    ])
  ]
})
export class AppComponent {
  // Prepara a rota atual para usar nas animações
  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }
}