// Importa o tipo CanActivateFn do Angular Router
// Esse tipo é usado para criar guards de rota
// Guard = proteção para impedir acesso a páginas
import { CanActivateFn } from '@angular/router';

// Importa inject()
// Permite injetar dependências sem constructor
import { inject } from '@angular/core';

// Importa o Keycloak JS
// Responsável pela autenticação/login/logout
import Keycloak from 'keycloak-js';

// Cria um guard chamado authGuard
// Ele será usado nas rotas protegidas
export const authGuard: CanActivateFn = async () => {

  // Injeta a instância do Keycloak configurada no projeto
  const keycloak = inject(Keycloak);

  // Verifica se o usuário já está autenticado
  // Se estiver logado:
  if (keycloak.authenticated) {

    // Libera acesso à rota
    return true;
  }

  // Se não estiver logado:
  // Redireciona usuário para a tela de login do Keycloak
  await keycloak.login();

  // Bloqueia acesso momentaneamente
  // Após login ele retorna ao sistema
  return false;
};