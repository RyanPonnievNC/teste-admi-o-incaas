import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProcessosComponent } from './features/processos/processos.component';
import { ClientesComponent } from './features/clientes/clientes.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'processos', component: ProcessosComponent },
  { path: 'clientes', component: ClientesComponent }
];