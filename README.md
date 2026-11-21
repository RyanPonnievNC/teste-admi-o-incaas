# Jurídico Pro App

Sistema de gestão de processos jurídicos feito em Angular, com uma IA em C++ que sugere a área do processo (trabalhista, cível, família, criminal ou tributário) enquanto você digita a descrição.

## Como usar (Windows)

1. Instale o Node.js (versão LTS) em https://nodejs.org
2. Baixe o projeto: neste repositório, clique no botão verde **Code** e depois em **Download ZIP**. Extraia a pasta.
3. Dentro da pasta, dê dois cliques em **iniciar.cmd**.
4. Espere. Na primeira vez leva alguns minutos, porque ele instala as dependências.
5. Abra http://localhost:4200 no navegador.

Para parar, feche a janela ou aperte Ctrl + C.

## Se o Windows bloquear

Ao abrir o `iniciar.cmd` ou o `servidor.exe`, pode aparecer "O Windows protegeu seu computador". Clique em **Mais informações** e depois em **Executar assim mesmo**. Isso acontece porque os programas não são assinados.

## Pelo terminal

Com Git e Node.js instalados, use `git clone`, entre na pasta e rode `npm start`.

## Sobre a IA

- Ela roda no seu computador, sem internet, por um servidor local em C++ na porta 8080.
- Se o servidor da IA não abrir, o site funciona normalmente, só sem a sugestão de área.
- A IA só funciona no Windows. No Mac ou Linux, use `npm install` e `npx ng serve` para ver o site sem ela.
- Para retreinar ou recompilar a IA, veja o arquivo `minha-ia/README.md`.
