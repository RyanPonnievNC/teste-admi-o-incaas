import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProcessosComponent } from './features/processos/processos.component';
import { ClientesComponent } from './features/clientes/clientes.component';

// Cria e exporta a lista de rotas do sistema
// Essas rotas controlam qual página será aberta
export const routes: Routes = [

  // Quando acessar a raiz do site:
  // http://localhost:4200/
  // será redirecionado para:
  // http://localhost:4200/dashboard
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  // Rota da página Dashboard
  // URL:
  // /dashboard
  {
    path: 'dashboard',
    component: DashboardComponent
  },

  // Rota da página de Processos
  // URL:
  // /processos
  {
    path: 'processos',
    component: ProcessosComponent
  },

  // Rota da página de Clientes
  // URL:
  // /clientes
  {
    path: 'clientes',
    component: ClientesComponent
  }
];