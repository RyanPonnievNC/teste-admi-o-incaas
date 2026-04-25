// Importa o tipo Routes do Angular
import { Routes } from '@angular/router';

// Importa o componente da página de clientes
import { ClientesComponent } from './features/clientes/clientes.component';

// Importa o componente da página dashboard
import { DashboardComponent } from './features/dashboard/dashboard.component';

// Importa o componente da página de login
import { LoginComponent } from './features/login/login.component';

// Importa o componente da página de processos
import { ProcessosComponent } from './features/processos/processos.component';

// Importa o componente da página de perfil
import { PerfilComponent } from './features/perfil/perfil.component';

// Importa o guard que permite admin e visitante
import { authGuard } from './core/guards/auth.guard';

// Importa o guard que permite apenas admin
import { adminGuard } from './core/guards/admin.guard';

// Cria e exporta a lista de rotas
export const routes: Routes = [

  // Rota inicial do sistema
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // Rota da tela de login
  {
    path: 'login',
    component: LoginComponent
  },

  // Rota do Dashboard
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },

  // Rota de Clientes
  {
    path: 'clientes',
    component: ClientesComponent,
    canActivate: [authGuard]
  },

  // Rota de Perfil
  {
    path: 'perfil',
    component: PerfilComponent,
    canActivate: [authGuard]
  },

  // Rota de Processos
  {
    path: 'processos',
    component: ProcessosComponent,
    canActivate: [adminGuard]
  },

  // Qualquer rota inválida volta para login
  {
    path: '**',
    redirectTo: 'login'
  }

];