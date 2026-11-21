# Jurídico Pro App

Sistema de gestão de processos jurídicos feito em Angular, com uma IA em C++ que sugere a área do processo (trabalhista, cível, família, criminal ou tributário) enquanto você digita a descrição.

## Como usar (Windows)

1. Instale o Node.js (versão LTS) em https://nodejs.org
2. Baixe o projeto: neste repositório, clique no botão verde **Code** e depois em **Download ZIP**. Extraia a pasta.
3. Abra a pasta extraída e dê dois cliques em **iniciar.cmd**.
4. Espere. Na primeira vez leva alguns minutos, porque ele instala as dependências.
5. Abra http://localhost:4200 no navegador.

Para parar, feche a janela ou aperte Ctrl + C.

## Abrindo pelo terminal

Entre primeiro na pasta do projeto. O `iniciar.cmd` só é encontrado de dentro dela.

| Terminal | Comando |
|---|---|
| PowerShell | `.\iniciar.cmd` |
| CMD (Prompt de Comando) | `iniciar` |
| Qualquer terminal, inclusive o do VS Code | `npm start` |

Exemplo no PowerShell:

```powershell
cd C:\caminho\da\pasta\teste-admi-o-incaas
.\iniciar.cmd
```

**Atenção no PowerShell:** digitar só `iniciar.cmd` dá o erro `O termo "iniciar.cmd" não é reconhecido`. O PowerShell não executa arquivos da pasta atual sem o `.\` na frente. Se o erro aparecer, confira duas coisas:

1. Você está dentro da pasta do projeto? (O caminho no início da linha deve terminar em `teste-admi-o-incaas`.)
2. Você digitou o `.\` antes do nome?

Se o nome da pasta extraída for outro (por exemplo `teste-admi-o-incaas-main`), use o nome que estiver no seu computador.

## Se o Windows bloquear

Ao abrir o `iniciar.cmd` ou o `servidor.exe`, pode aparecer "O Windows protegeu seu computador". Clique em **Mais informações** e depois em **Executar assim mesmo**. Isso acontece porque os programas não são assinados.

## Sobre a IA

- Ela roda no seu computador, sem internet, por um servidor local em C++ na porta 8080.
- Se o servidor da IA não abrir, o site funciona normalmente, só sem a sugestão de área.
- A IA só funciona no Windows. No Mac ou Linux, use `npm install` e `npx ng serve` para ver o site sem ela.
- Para retreinar ou recompilar a IA, veja o arquivo `minha-ia/README.md`.

## Problemas comuns

- **Node.js não encontrado:** instale o Node.js e abra um terminal novo (ou clique de novo no `iniciar.cmd`).
- **Porta 4200 ou 8080 em uso:** feche outras janelas do projeto que estejam abertas e tente de novo.
- **A primeira abertura demora:** é a instalação das dependências, e só acontece uma vez.
