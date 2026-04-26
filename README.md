# Jurídico Pro App

Aplicação SPA desenvolvida com Angular para gestão de processos jurídicos.

O projeto possui autenticação local para administrador, acesso como visitante, dashboard com estatísticas, gráficos por status dos processos, listagem, cadastro, edição, exclusão, filtros, paginação e ordenação.

---

## Objetivo do projeto

O objetivo do **Jurídico Pro App** é simular um sistema administrativo para controle de processos jurídicos, permitindo que usuários visualizem informações importantes em um painel organizado e gerenciem processos de forma simples, responsiva e intuitiva.

---

## Funcionalidades

- Login como administrador
- Cadastro de conta administrativa
- Acesso como visitante
- Visualização e ocultação de senha com imagem de olho
- Visualização e ocultação do código de verificação
- Dashboard com estatísticas gerais
- Gráfico por status dos processos
- Listagem de processos
- Cadastro de processos
- Edição de processos
- Exclusão de processos
- Filtro por cliente
- Filtro por status
- Paginação
- Ordenação
- Validações com Reactive Forms
- Mensagens de erro e sucesso
- Layout responsivo

---

## Tipos de acesso

### Administrador

O administrador possui acesso completo ao sistema, podendo:

- Entrar com usuário e senha
- Criar conta administrativa
- Visualizar o dashboard
- Cadastrar processos
- Editar processos
- Excluir processos
- Filtrar e ordenar informações

### Visitante

O visitante pode acessar o sistema sem conta administrativa.

Esse tipo de acesso é útil para visualização, testes e demonstração da interface.

---

## Tecnologias utilizadas

- Angular
- TypeScript
- SCSS
- TailwindCSS
- PrimeNG
- Chart.js
- HTML
- LocalStorage

---

## Estrutura do projeto

```txt
src/

 app/

   core/

    guards/

      services/

   features/

    dashboard/

    login/

    processos/

  models/
  
    app.component.ts
    app.config.ts
    app.routes.ts