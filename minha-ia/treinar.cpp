#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <map>
#include <set>
#include <cstdlib>
#include "modelo.h"

struct Exemplo {
    std::string area;
    std::string texto;
};

// Quantos neuronios a camada escondida tem
const int NEURONIOS = 32;

// Le um arquivo no formato "area;descricao" e acrescenta os exemplos em 'lista'.
// O texto passa pela mesma normalizacao do servidor (minusculas, sem acentos).
// Devolve quantos exemplos novos entraram (repetidos e linhas vazias sao ignorados).
int lerExemplos(const std::string& caminho, std::vector<Exemplo>& lista, std::set<std::string>& vistos) {
    std::ifstream arquivo(caminho);
    if (!arquivo) return -1;

    int novos = 0;
    std::string linha;
    while (std::getline(arquivo, linha)) {
        if (!linha.empty() && linha.back() == '\r') linha.pop_back();
        size_t pos = linha.find(';');
        if (pos == std::string::npos) continue;

        std::string area = textoLimpo(linha.substr(0, pos));
        std::string texto = textoLimpo(linha.substr(pos + 1));

        if (area.empty() || texto.empty()) continue;
        if (!vistos.insert(area + ";" + texto).second) continue;  // ja existe
        lista.push_back({area, texto});
        novos++;
    }
    return novos;
}

std::map<std::string, int> montarVocab(const std::vector<Exemplo>& dados) {
    std::map<std::string, int> vocab;
    for (const auto& e : dados)
        for (const auto& p : palavras(e.texto))
            if (!vocab.count(p)) {
                int novo = vocab.size();
                vocab[p] = novo;
            }
    return vocab;
}

Rede treinar(const std::vector<Exemplo>& dados, const std::map<std::string, int>& vocab,
             std::map<std::string, int>& indiceArea, int nAreas) {
    int V = vocab.size();
    MatrixXd X(V, dados.size()), Y = MatrixXd::Zero(nAreas, dados.size());
    for (size_t j = 0; j < dados.size(); j++) {
        X.col(j) = textoParaVetor(dados[j].texto, vocab);
        Y(indiceArea[dados[j].area], j) = 1.0;
    }
    Rede rede({V, NEURONIOS, nAreas}, true);
    double taxa = 1.0;
    double perda = 0;
    for (int epoca = 0; epoca <= 3000; epoca++)
        perda = rede.treinarPasso(X, Y, taxa);
    std::cout << "  treino concluido, erro final = " << perda << "\n";
    return rede;
}

int acertos(Rede& rede, const std::vector<Exemplo>& lista, const std::map<std::string, int>& vocab,
            const std::vector<std::string>& areas) {
    int ok = 0;
    for (const auto& e : lista) {
        MatrixXd s = rede.prever(textoParaVetor(e.texto, vocab));
        if (areas[maiorIndice(s.col(0))] == e.area) ok++;
    }
    return ok;
}

// Mostra o que aconteceria em cada "limite de confianca" do servidor:
// quantas frases ele responderia (o resto viraria "indefinido") e quantas dessas estariam certas
void mostrarLimites(Rede& rede, const std::vector<Exemplo>& lista, const std::map<std::string, int>& vocab,
                    const std::vector<std::string>& areas) {
    for (double limite : {0.35, 0.50, 0.65}) {
        int respondidas = 0, certas = 0;
        for (const auto& e : lista) {
            MatrixXd s = rede.prever(textoParaVetor(e.texto, vocab));
            int melhor = maiorIndice(s.col(0));
            if (s(melhor, 0) < limite) continue;
            respondidas++;
            if (areas[melhor] == e.area) certas++;
        }
        std::cout << "    limite " << (int)(limite * 100) << "%: responde " << respondidas << " de "
                  << lista.size() << ", acerta " << certas << "\n";
    }
}

int main() {
    srand(42);

    // 1. Ler os exemplos: os fixos e as correcoes feitas no site
    std::vector<Exemplo> todos;
    std::set<std::string> vistos;

    int base = lerExemplos("dados/processos.txt", todos, vistos);
    if (base < 0) {
        std::cout << "Nao achei dados/processos.txt. Rode o programa na pasta minha-ia.\n";
        return 1;
    }
    int correcoes = lerExemplos("dados/correcoes.txt", todos, vistos);
    if (correcoes < 0) correcoes = 0;  // o arquivo so existe depois da primeira correcao

    std::vector<std::string> areas;
    std::map<std::string, int> indiceArea;
    for (const auto& e : todos)
        if (!indiceArea.count(e.area)) {
            indiceArea[e.area] = areas.size();
            areas.push_back(e.area);
        }
    int A = areas.size();

    // 2. Treino com parte dos dados, so para MEDIR a precisao
    std::vector<Exemplo> treino, teste;
    for (size_t i = 0; i < todos.size(); i++)
        (i % 4 == 3 ? teste : treino).push_back(todos[i]);

    std::cout << "Exemplos: " << todos.size() << " (" << base << " de processos.txt + " << correcoes
              << " de correcoes.txt)\n";
    std::cout << "Medindo a precisao (treino " << treino.size() << ", teste " << teste.size() << ")...\n";
    auto vocabTreino = montarVocab(treino);
    Rede redeTeste = treinar(treino, vocabTreino, indiceArea, A);
    int certosTeste = acertos(redeTeste, teste, vocabTreino, areas);
    std::cout << "  acertos no treino: " << acertos(redeTeste, treino, vocabTreino, areas) << " de " << treino.size() << "\n";
    std::cout << "  acertos no teste:  " << certosTeste << " de " << teste.size() << " ("
              << (int)(100.0 * certosTeste / teste.size()) << "%, exemplos que a rede NAO viu)\n";
    mostrarLimites(redeTeste, teste, vocabTreino, areas);
    std::cout << "\n";

    // 3. Treino final com TODOS os dados, e esse e o modelo que vai ser salvo
    std::cout << "Treinando o modelo final com todos os exemplos...\n";
    auto vocab = montarVocab(todos);
    Rede redeFinal = treinar(todos, vocab, indiceArea, A);

    if (!salvarModelo("dados/modelo.txt", redeFinal, areas, vocab)) {
        std::cout << "Nao consegui gravar dados/modelo.txt\n";
        return 1;
    }
    std::cout << "\nModelo salvo em dados/modelo.txt (" << vocab.size() << " palavras, "
              << A << " areas)\n";
}