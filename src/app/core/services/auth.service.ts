// Importa Injectable para transformar esta classe em um serviço do Angular
import { Injectable } from '@angular/core';

// Define os tipos de perfil que o sistema aceita
export type PerfilUsuario = 'admin' | 'visitante';

// Define a estrutura dos dados do usuário logado
export interface UsuarioLogado {
  nome: string;
  sobrenome: string;
  idade: number;
  cpf: string;
  usuario: string;
  perfil: PerfilUsuario;
}

// Define a estrutura de uma conta administradora cadastrada
export interface ContaAdmin {
  nome: string;
  sobrenome: string;
  idade: number;
  cpf: string;
  usuario: string;
  senha: string;
  perfil: PerfilUsuario;
}

// Define que este serviço estará disponível para toda a aplicação
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Código obrigatório para permitir criar uma nova conta admin
  private readonly codigoVerificacaoAdmin = 'tpmc1208';

  // Conta administradora padrão do sistema
  private readonly adminPadrao: ContaAdmin = {
    nome: 'Administrador',
    sobrenome: 'Principal',
    idade: 18,
    cpf: '000.000.000-00',
    usuario: 'admin',
    senha: 'admin123',
    perfil: 'admin'
  };

  // Faz login de administrador verificando usuário e senha
  login(usuario: string, senha: string): boolean {

    // Busca todas as contas administradoras disponíveis
    const administradores = this.listarAdministradores();

    // Procura uma conta com usuário e senha iguais aos digitados
    const usuarioEncontrado = administradores.find(
      item => item.usuario === usuario && item.senha === senha
    );

    // Se não encontrar administrador, retorna falso
    if (!usuarioEncontrado) {
      return false;
    }

    // Cria os dados do usuário logado
    const dadosUsuario: UsuarioLogado = {
      nome: usuarioEncontrado.nome,
      sobrenome: usuarioEncontrado.sobrenome,
      idade: usuarioEncontrado.idade,
      cpf: usuarioEncontrado.cpf,
      usuario: usuarioEncontrado.usuario,
      perfil: usuarioEncontrado.perfil
    };

    // Salva que existe alguém logado
    localStorage.setItem('logado', 'true');

    // Salva os dados do usuário atual
    localStorage.setItem('usuarioAtual', JSON.stringify(dadosUsuario));

    // Retorna verdadeiro para indicar login correto
    return true;
  }

  // Entra no sistema como visitante
  entrarComoVisitante() {

    // Cria os dados do visitante
    const dadosUsuario: UsuarioLogado = {
      nome: 'Visitante',
      sobrenome: '',
      idade: 0,
      cpf: '',
      usuario: 'visitante',
      perfil: 'visitante'
    };

    // Salva que existe alguém logado
    localStorage.setItem('logado', 'true');

    // Salva os dados do visitante
    localStorage.setItem('usuarioAtual', JSON.stringify(dadosUsuario));
  }

  // Cria uma nova conta administradora
  criarContaAdmin(
    nome: string,
    sobrenome: string,
    idade: number,
    cpf: string,
    usuario: string,
    senha: string,
    codigoVerificacao: string
  ): { sucesso: boolean; mensagem: string } {

    // Verifica se o código de verificação está correto
    if (codigoVerificacao !== this.codigoVerificacaoAdmin) {
      return {
        sucesso: false,
        mensagem: 'Código de verificação inválido.'
      };
    }

    // Verifica se o nome foi preenchido
    if (!nome.trim()) {
      return {
        sucesso: false,
        mensagem: 'Digite o nome do administrador.'
      };
    }

    // Verifica se o sobrenome foi preenchido
    if (!sobrenome.trim()) {
      return {
        sucesso: false,
        mensagem: 'Digite o sobrenome do administrador.'
      };
    }

    // Verifica se a idade é válida
    if (!idade || idade < 18) {
      return {
        sucesso: false,
        mensagem: 'O administrador precisa ter pelo menos 18 anos.'
      };
    }

    // Verifica se o CPF foi preenchido
    if (!cpf.trim()) {
      return {
        sucesso: false,
        mensagem: 'Digite o CPF do administrador.'
      };
    }

    // Verifica se o usuário foi preenchido
    if (!usuario.trim()) {
      return {
        sucesso: false,
        mensagem: 'Digite um usuário para a conta admin.'
      };
    }

    // Verifica se a senha tem tamanho mínimo
    if (!senha || senha.length < 6) {
      return {
        sucesso: false,
        mensagem: 'A senha precisa ter pelo menos 6 caracteres.'
      };
    }

    // Busca todos os administradores já cadastrados
    const administradores = this.listarAdministradores();

    // Verifica se já existe usuário com o mesmo login
    const usuarioJaExiste = administradores.some(
      item => item.usuario.toLowerCase() === usuario.toLowerCase()
    );

    // Se o usuário já existir, bloqueia cadastro
    if (usuarioJaExiste) {
      return {
        sucesso: false,
        mensagem: 'Já existe uma conta admin com esse usuário.'
      };
    }

    // Verifica se já existe CPF cadastrado
    const cpfJaExiste = administradores.some(
      item => item.cpf === cpf
    );

    // Se o CPF já existir, bloqueia cadastro
    if (cpfJaExiste) {
      return {
        sucesso: false,
        mensagem: 'Já existe uma conta admin com esse CPF.'
      };
    }

    // Cria a nova conta administradora
    const novaConta: ContaAdmin = {
      nome: nome.trim(),
      sobrenome: sobrenome.trim(),
      idade,
      cpf: cpf.trim(),
      usuario: usuario.trim(),
      senha,
      perfil: 'admin'
    };

    // Adiciona a nova conta à lista de administradores
    administradores.push(novaConta);

    // Salva a lista atualizada no navegador
    localStorage.setItem('contasAdmin', JSON.stringify(administradores));

    // Retorna sucesso
    return {
      sucesso: true,
      mensagem: 'Conta administradora criada com sucesso.'
    };
  }

  // Lista todos os administradores disponíveis
  listarAdministradores(): ContaAdmin[] {

    // Busca contas salvas no navegador
    const contasSalvas = localStorage.getItem('contasAdmin');

    // Se não existir nenhuma conta salva, cria lista com o admin padrão
    if (!contasSalvas) {
      const listaInicial = [this.adminPadrao];

      localStorage.setItem('contasAdmin', JSON.stringify(listaInicial));

      return listaInicial;
    }

    // Converte o texto salvo em lista de contas
    const contas = JSON.parse(contasSalvas) as ContaAdmin[];

    // Verifica se o admin padrão já existe
    const adminPadraoExiste = contas.some(
      conta => conta.usuario === this.adminPadrao.usuario
    );

    // Se o admin padrão não existir, adiciona ele novamente
    if (!adminPadraoExiste) {
      contas.unshift(this.adminPadrao);

      localStorage.setItem('contasAdmin', JSON.stringify(contas));
    }

    // Retorna a lista de contas
    return contas;
  }

  // Faz logout do usuário
  logout() {

    // Remove a informação de login
    localStorage.removeItem('logado');

    // Remove os dados do usuário atual
    localStorage.removeItem('usuarioAtual');
  }

  // Verifica se existe usuário logado
  estaLogado(): boolean {
    return localStorage.getItem('logado') === 'true';
  }

  // Retorna os dados do usuário logado
  usuarioAtual(): UsuarioLogado | null {

    // Busca o usuário salvo no navegador
    const usuarioSalvo = localStorage.getItem('usuarioAtual');

    // Se não existir usuário salvo, retorna nulo
    if (!usuarioSalvo) {
      return null;
    }

    // Converte o texto salvo em objeto JavaScript
    return JSON.parse(usuarioSalvo) as UsuarioLogado;
  }

  // Verifica se o usuário atual é administrador
  ehAdmin(): boolean {
    return this.usuarioAtual()?.perfil === 'admin';
  }

  // Verifica se o usuário atual é visitante
  ehVisitante(): boolean {
    return this.usuarioAtual()?.perfil === 'visitante';
  }

  // Verifica se o usuário pode alterar dados
  podeAlterar(): boolean {
    return this.ehAdmin();
  }

  // Retorna o nome do usuário atual
  nomeUsuario(): string {
    return this.usuarioAtual()?.nome ?? 'Visitante';
  }

}