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
  fotoUrl: string;
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
  fotoUrl: string;
}

// Define a estrutura dos dados usados para atualizar uma conta admin
export interface AtualizarContaAdmin {
  nome: string;
  sobrenome: string;
  idade: number;
  cpf: string;
  usuario: string;
  senha: string;
  fotoUrl: string;
}

// Define que este serviço estará disponível para toda a aplicação
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Código obrigatório para criar uma nova conta admin
  private readonly codigoVerificacaoAdmin = 'tpmc1208';

  // Usuário da conta admin padrão do sistema
  private readonly usuarioAdminPadrao = 'admin';

  // Conta administradora padrão do sistema
  private readonly adminPadrao: ContaAdmin = {
    nome: 'Administrador',
    sobrenome: 'Principal',
    idade: 18,
    cpf: '000.000.000-00',
    usuario: 'admin',
    senha: 'admin123',
    perfil: 'admin',
    fotoUrl: ''
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
      perfil: usuarioEncontrado.perfil,
      fotoUrl: usuarioEncontrado.fotoUrl || ''
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
      perfil: 'visitante',
      fotoUrl: ''
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
    codigoVerificacao: string,
    fotoUrl: string
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

    // Verifica se a senha tem pelo menos 6 caracteres
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
      perfil: 'admin',
      fotoUrl
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

  // Atualiza a conta admin atualmente logada
  atualizarContaAdminAtual(
    dadosAtualizados: AtualizarContaAdmin
  ): { sucesso: boolean; mensagem: string } {

    // Busca o usuário atual
    const usuarioAtual = this.usuarioAtual();

    // Se não existir usuário logado, bloqueia
    if (!usuarioAtual) {
      return {
        sucesso: false,
        mensagem: 'Nenhum usuário está logado.'
      };
    }

    // Se não for admin, bloqueia
    if (usuarioAtual.perfil !== 'admin') {
      return {
        sucesso: false,
        mensagem: 'Apenas contas administradoras podem editar informações.'
      };
    }

    // Bloqueia edição da conta admin padrão
    if (usuarioAtual.usuario === this.usuarioAdminPadrao) {
      return {
        sucesso: false,
        mensagem: 'A conta admin padrão não pode ser editada.'
      };
    }

    // Valida nome
    if (!dadosAtualizados.nome.trim()) {
      return {
        sucesso: false,
        mensagem: 'Digite o nome.'
      };
    }

    // Valida sobrenome
    if (!dadosAtualizados.sobrenome.trim()) {
      return {
        sucesso: false,
        mensagem: 'Digite o sobrenome.'
      };
    }

    // Valida idade
    if (!dadosAtualizados.idade || dadosAtualizados.idade < 18) {
      return {
        sucesso: false,
        mensagem: 'A idade precisa ser maior ou igual a 18 anos.'
      };
    }

    // Valida CPF
    if (!dadosAtualizados.cpf.trim()) {
      return {
        sucesso: false,
        mensagem: 'Digite o CPF.'
      };
    }

    // Valida usuário
    if (!dadosAtualizados.usuario.trim()) {
      return {
        sucesso: false,
        mensagem: 'Digite um usuário.'
      };
    }

    // Valida senha
    if (!dadosAtualizados.senha || dadosAtualizados.senha.length < 6) {
      return {
        sucesso: false,
        mensagem: 'A senha precisa ter pelo menos 6 caracteres.'
      };
    }

    // Busca todas as contas admin
    const administradores = this.listarAdministradores();

    // Procura a conta atual na lista
    const indiceContaAtual = administradores.findIndex(
      conta => conta.usuario === usuarioAtual.usuario
    );

    // Se não encontrar a conta atual, bloqueia
    if (indiceContaAtual === -1) {
      return {
        sucesso: false,
        mensagem: 'Conta administradora não encontrada.'
      };
    }

    // Verifica se o novo usuário já está sendo usado por outra conta
    const usuarioJaExiste = administradores.some(
      conta =>
        conta.usuario.toLowerCase() === dadosAtualizados.usuario.toLowerCase() &&
        conta.usuario !== usuarioAtual.usuario
    );

    // Se usuário já existir, bloqueia
    if (usuarioJaExiste) {
      return {
        sucesso: false,
        mensagem: 'Já existe outra conta admin com esse usuário.'
      };
    }

    // Verifica se o novo CPF já está sendo usado por outra conta
    const cpfJaExiste = administradores.some(
      conta =>
        conta.cpf === dadosAtualizados.cpf &&
        conta.usuario !== usuarioAtual.usuario
    );

    // Se CPF já existir, bloqueia
    if (cpfJaExiste) {
      return {
        sucesso: false,
        mensagem: 'Já existe outra conta admin com esse CPF.'
      };
    }

    // Monta a conta atualizada
    const contaAtualizada: ContaAdmin = {
      nome: dadosAtualizados.nome.trim(),
      sobrenome: dadosAtualizados.sobrenome.trim(),
      idade: dadosAtualizados.idade,
      cpf: dadosAtualizados.cpf.trim(),
      usuario: dadosAtualizados.usuario.trim(),
      senha: dadosAtualizados.senha,
      perfil: 'admin',
      fotoUrl: dadosAtualizados.fotoUrl
    };

    // Atualiza a conta dentro da lista
    administradores[indiceContaAtual] = contaAtualizada;

    // Salva a lista atualizada
    localStorage.setItem('contasAdmin', JSON.stringify(administradores));

    // Atualiza também os dados do usuário logado
    const novoUsuarioAtual: UsuarioLogado = {
      nome: contaAtualizada.nome,
      sobrenome: contaAtualizada.sobrenome,
      idade: contaAtualizada.idade,
      cpf: contaAtualizada.cpf,
      usuario: contaAtualizada.usuario,
      perfil: contaAtualizada.perfil,
      fotoUrl: contaAtualizada.fotoUrl
    };

    // Salva os dados atualizados do usuário atual
    localStorage.setItem('usuarioAtual', JSON.stringify(novoUsuarioAtual));

    // Retorna sucesso
    return {
      sucesso: true,
      mensagem: 'Informações atualizadas com sucesso.'
    };
  }

  // Retorna a senha da conta admin atual
  senhaContaAdminAtual(): string {

    // Busca o usuário atual
    const usuarioAtual = this.usuarioAtual();

    // Se não houver usuário, retorna vazio
    if (!usuarioAtual) {
      return '';
    }

    // Busca os administradores
    const administradores = this.listarAdministradores();

    // Procura a conta atual
    const contaAtual = administradores.find(
      conta => conta.usuario === usuarioAtual.usuario
    );

    // Retorna a senha ou vazio
    return contaAtual?.senha ?? '';
  }

  // Verifica se a conta atual pode ser editada
  podeEditarContaAtual(): boolean {

    // Busca o usuário atual
    const usuarioAtual = this.usuarioAtual();

    // Se não existir usuário, não pode editar
    if (!usuarioAtual) {
      return false;
    }

    // Visitante não pode editar
    if (usuarioAtual.perfil !== 'admin') {
      return false;
    }

    // Admin padrão não pode editar
    if (usuarioAtual.usuario === this.usuarioAdminPadrao) {
      return false;
    }

    // Outros admins podem editar
    return true;
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

    // Garante que contas antigas sem foto continuem funcionando
    const contasNormalizadas = contas.map(conta => ({
      ...conta,
      fotoUrl: conta.fotoUrl || ''
    }));

    // Verifica se o admin padrão já existe
    const adminPadraoExiste = contasNormalizadas.some(
      conta => conta.usuario === this.adminPadrao.usuario
    );

    // Se o admin padrão não existir, adiciona ele novamente
    if (!adminPadraoExiste) {
      contasNormalizadas.unshift(this.adminPadrao);

      localStorage.setItem('contasAdmin', JSON.stringify(contasNormalizadas));
    }

    // Retorna a lista de contas
    return contasNormalizadas;
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
    const usuario = JSON.parse(usuarioSalvo) as UsuarioLogado;

    // Garante compatibilidade com usuários antigos sem foto
    return {
      ...usuario,
      fotoUrl: usuario.fotoUrl || ''
    };
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

  // Retorna a foto do usuário atual
  fotoUsuario(): string {
    return this.usuarioAtual()?.fotoUrl ?? '';
  }

  // Retorna o nome completo do usuário atual
  nomeCompletoUsuario(): string {

    // Busca o usuário atual
    const usuario = this.usuarioAtual();

    // Se não existir usuário, retorna visitante
    if (!usuario) {
      return 'Visitante';
    }

    // Se não tiver sobrenome, retorna apenas o nome
    if (!usuario.sobrenome) {
      return usuario.nome;
    }

    // Retorna nome + sobrenome
    return `${usuario.nome} ${usuario.sobrenome}`;
  }

  // Retorna a idade formatada
  idadeUsuario(): string {

    // Busca o usuário atual
    const usuario = this.usuarioAtual();

    // Se não existir idade, retorna traço
    if (!usuario || !usuario.idade) {
      return '—';
    }

    // Retorna idade com texto
    return `${usuario.idade} anos`;
  }

  // Retorna o CPF mascarado para não mostrar tudo na tela
  cpfMascarado(): string {

    // Busca o usuário atual
    const usuario = this.usuarioAtual();

    // Se não existir CPF, retorna traço
    if (!usuario || !usuario.cpf) {
      return '—';
    }

    // Remove tudo que não for número
    const cpfNumerico = usuario.cpf.replace(/\D/g, '');

    // Se o CPF não tiver 11 números, retorna o valor original parcialmente protegido
    if (cpfNumerico.length !== 11) {
      return 'CPF cadastrado';
    }

    // Retorna o CPF mascarado
    return `${cpfNumerico.slice(0, 3)}.***.***-${cpfNumerico.slice(9, 11)}`;
  }

  // Retorna o perfil do usuário de forma bonita
  perfilUsuario(): string {

    // Se for admin, retorna Administrador
    if (this.ehAdmin()) {
      return 'Administrador';
    }

    // Se for visitante, retorna Visitante
    if (this.ehVisitante()) {
      return 'Visitante';
    }

    // Caso não tenha perfil
    return 'Sem perfil';
  }

}