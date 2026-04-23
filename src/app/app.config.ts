// Importa o tipo principal de configuração do Angular
import {
  ApplicationConfig,

  // Ativa tratamento global de erros
  provideBrowserGlobalErrorListeners,

  // Melhora performance da detecção de mudanças
  provideZoneChangeDetection

} from '@angular/core';


// Importa sistema de rotas + transição entre páginas
import {

  // Ativa as rotas do projeto
  provideRouter,

  // Ativa animação ao trocar de página
  withViewTransitions

} from '@angular/router';


// Importa suporte para requisições HTTP (API)
import { provideHttpClient } from '@angular/common/http';


// Importa suas rotas cadastradas
import { routes } from './app.routes';


// Cria configuração principal do app
export const appConfig: ApplicationConfig = {

  // Recursos globais do sistema
  providers: [

    // Captura erros globais
    provideBrowserGlobalErrorListeners(),

    // Otimiza eventos do Angular
    provideZoneChangeDetection({
      eventCoalescing: true
    }),

    // Libera uso de APIs
    provideHttpClient(),

    // Ativa rotas + transição suave entre páginas
    provideRouter(
      routes,
      withViewTransitions()
    )

  ]
};