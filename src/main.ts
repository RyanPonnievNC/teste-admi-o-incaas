// Importa o Zone.js
// Responsável por detectar mudanças automáticas na tela no Angular
// Exemplo:
// quando variável muda -> HTML atualiza sozinho
import 'zone.js';

// Importa a função bootstrapApplication()
// Ela inicia aplicações Angular standalone
import { bootstrapApplication } from '@angular/platform-browser';

// Importa as configurações globais do projeto
// Exemplo:
// rotas
// providers
// HttpClient
// interceptors
import { appConfig } from './app/app.config';

// Importa o componente principal da aplicação
// Esse será o componente raiz carregado no index.html
import { AppComponent } from './app/app';

// Inicializa a aplicação Angular
// 1. Carrega AppComponent
// 2. Usa configurações do appConfig
bootstrapApplication(AppComponent, appConfig)

  // Se der erro na inicialização,
  // mostra no console do navegador
  .catch((err) => console.error(err));