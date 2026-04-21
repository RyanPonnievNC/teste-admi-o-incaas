// Importa tipos e funções principais do Angular Core
import {
  // Tipo usado para definir a configuração global da aplicação
  ApplicationConfig,

  // Ativa captura global de erros do navegador
  // Ajuda a exibir erros no console e tratar falhas gerais
  provideBrowserGlobalErrorListeners,

  // Configura como Angular detecta mudanças na interface
  provideZoneChangeDetection
} from '@angular/core';

// Importa função para registrar as rotas do sistema
import { provideRouter } from '@angular/router';

// Importa função para habilitar HttpClient
// Necessário para chamadas API futuramente
import { provideHttpClient } from '@angular/common/http';

// Importa lista de rotas criadas no app.routes.ts
import { routes } from './app.routes';

// Cria objeto de configuração global da aplicação
export const appConfig: ApplicationConfig = {

  // Providers = serviços/configurações globais disponíveis no projeto inteiro
  providers: [

    // Habilita escuta global de erros no navegador
    provideBrowserGlobalErrorListeners(),

    // Configura detecção de mudanças otimizada
    // eventCoalescing: agrupa múltiplos eventos para melhorar performance
    provideZoneChangeDetection({
      eventCoalescing: true
    }),

    // Registra sistema de rotas
    // Dashboard / Processos / Clientes
    provideRouter(routes),

    // Habilita HttpClient globalmente
    // Permitirá GET, POST, PUT, DELETE futuramente
    provideHttpClient()
  ]
};