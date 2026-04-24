// Importa inject para usar serviços dentro do guard
import { inject } from '@angular/core';

// Importa CanActivateFn e Router para proteger rotas
import { CanActivateFn, Router } from '@angular/router';

// Importa o serviço de autenticação
import { AuthService } from '../services/auth.service';

// Guard que permite acesso apenas para administradores
export const adminGuard: CanActivateFn = () => {

  // Injeta o serviço de autenticação
  const authService = inject(AuthService);

  // Injeta o Router para redirecionar o usuário
  const router = inject(Router);

  // Se for administrador, libera a rota
  if (authService.ehAdmin()) {
    return true;
  }

  // Se não for administrador, manda para o Dashboard
  router.navigate(['/dashboard']);

  // Bloqueia a rota
  return false;
};