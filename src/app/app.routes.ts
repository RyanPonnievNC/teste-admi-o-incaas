import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { RecuperarSenhaComponent } from './features/recuperar-senha/recuperar-senha.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

// Login e recuperar senha carregam junto com o site.
// As outras telas só são baixadas quando a pessoa abre cada uma.
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'recuperar-senha',
    component: RecuperarSenhaComponent
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'clientes',
    loadComponent: () =>
      import('./features/clientes/clientes.component').then(m => m.ClientesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./features/perfil/perfil.component').then(m => m.PerfilComponent),
    canActivate: [authGuard]
  },
  {
    path: 'processos',
    loadComponent: () =>
      import('./features/processos/processos.component').then(m => m.ProcessosComponent),
    canActivate: [adminGuard]
  },

  // Qualquer rota inválida volta para login
  {
    path: '**',
    redirectTo: 'login'
  }
];
