# minha-ia

Classificador de área jurídica escrito em C++. Recebe a descrição de um processo (por exemplo, "empregado pede horas extras") e devolve a área mais provável: trabalhista, cível, família, criminal ou tributário, junto com a confiança da resposta.

Foi feito para aprender como uma rede neural funciona por dentro. É usado pelo site Angular que está na pasta acima deste projeto, para sugerir a área no cadastro de processos.

## Como funciona

1. O servidor normaliza o texto (minúsculas, sem acentos, sem pontuação) e o transforma em um vetor de 0 e 1 (saco de palavras).
2. Uma rede neural com uma camada oculta de 16 neurônios, escrita com a biblioteca Eigen, calcula uma pontuação de 0 a 1 para cada área.
3. Se a maior pontuação ficar abaixo de 35%, a resposta é `indefinido`, em vez de chutar uma área.

## Arquivos

- `rede.h`: a rede neural (camadas, treino e previsão)
- `modelo.h`: vocabulário e funções para salvar e carregar o modelo
- `treinar.cpp`: treina a rede e grava `dados/modelo.txt`
- `usar.cpp`: testa o modelo digitando frases no terminal
- `servidor.cpp`: servidor HTTP em `localhost:8080`
- `dados/processos.txt`: exemplos de treino, no formato `area;descricao`

## Requisitos

Windows com g++ (MinGW-w64) compatível com C++17, mais duas bibliotecas na pasta `libs`:

```powershell
New-Item libs -ItemType Directory -Force
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/yhirose/cpp-httplib/master/httplib.h" -OutFile libs\httplib.h
```

Eigen 3.4: baixe https://gitlab.com/libeigen/eigen/-/archive/3.4.0/eigen-3.4.0.zip, extraia e copie a pasta `Eigen` para `libs\Eigen`.

## Treinar

```powershell
g++ -std=c++17 -O2 -I libs treinar.cpp -o treinar
.\treinar
```

O programa treina duas vezes: primeiro com 3/4 dos exemplos, só para medir a precisão em frases que a rede não viu, e depois com todos, gravando o modelo final em `dados/modelo.txt`.

## Usar no terminal

```powershell
g++ -std=c++17 -O2 -I libs usar.cpp -o usar
.\usar
```

## Servidor

```powershell
g++ -std=c++17 -O2 -I libs servidor.cpp -o servidor -lws2_32
.\servidor
```

- `GET /saude` responde `{"status":"ok"}`
- `GET /classificar?texto=...` responde a área sugerida

Exemplo de resposta:

```json
{"area":"trabalhista","confianca":0.8400,"probabilidades":{"trabalhista":0.8400,"civel":0.0300,"familia":0.0200,"criminal":0.0100,"tributario":0.0400}}
```

## Melhorar a IA

Acrescente frases em `dados/processos.txt` (uma por linha, no formato `area;descricao`, em minúsculas e sem acentos), rode `.\treinar` de novo e reinicie o servidor.

## Limitações

- A rede só conhece as palavras que viu no treino.
- Frases muito curtas ou vagas podem resultar em `indefinido`.
- A precisão em frases novas aparece ao rodar `.\treinar`.