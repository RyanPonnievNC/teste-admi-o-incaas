#pragma once
#include <fstream>
#include <iomanip>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>
#include <map>
#include "rede.h"

// Quebra um texto em palavras (ignora palavras com menos de 3 letras)
inline std::vector<std::string> palavras(const std::string& texto) {
    std::vector<std::string> resultado;
    std::istringstream ss(texto);
    std::string p;
    while (ss >> p) {
        if (p.size() >= 3) resultado.push_back(p);
    }
    return resultado;
}

// Transforma um texto em vetor de 0 e 1 (saco de palavras)
inline VectorXd textoParaVetor(const std::string& texto, const std::map<std::string, int>& vocab) {
    VectorXd v = VectorXd::Zero(vocab.size());
    for (const auto& p : palavras(texto)) {
        auto it = vocab.find(p);
        if (it != vocab.end()) v(it->second) = 1.0;
    }
    return v;
}

inline int maiorIndice(const VectorXd& v) {
    int melhor = 0;
    for (int i = 1; i < v.size(); i++)
        if (v(i) > v(melhor)) melhor = i;
    return melhor;
}

// Grava areas, vocabulario e pesos da rede num arquivo de texto
inline bool salvarModelo(const std::string& caminho, const Rede& rede,
                         const std::vector<std::string>& areas,
                         const std::map<std::string, int>& vocab) {
    std::ofstream f(caminho);
    if (!f) return false;
    f << std::setprecision(17);

    f << areas.size() << "\n";
    for (const auto& a : areas) f << a << "\n";

    std::vector<std::string> lista(vocab.size());
    for (const auto& par : vocab) lista[par.second] = par.first;
    f << lista.size() << "\n";
    for (const auto& p : lista) f << p << "\n";

    f << rede.camadas.size() << "\n";
    for (const auto& c : rede.camadas) {
        f << c.W.rows() << " " << c.W.cols() << "\n";
        for (int i = 0; i < c.W.rows(); i++)
            for (int j = 0; j < c.W.cols(); j++) f << c.W(i, j) << " ";
        f << "\n";
        for (int i = 0; i < c.b.size(); i++) f << c.b(i) << " ";
        f << "\n";
    }
    return true;
}

// Le o arquivo e devolve a rede pronta; preenche areas e vocab
inline Rede carregarModelo(const std::string& caminho,
                           std::vector<std::string>& areas,
                           std::map<std::string, int>& vocab) {
    std::ifstream f(caminho);
    if (!f) throw std::runtime_error("Nao achei " + caminho + ". Rode o treinar primeiro.");

    auto lerLinha = [&]() {
        std::string s;
        std::getline(f, s);
        if (!s.empty() && s.back() == '\r') s.pop_back();
        return s;
    };

    areas.clear();
    vocab.clear();
    int nAreas = std::stoi(lerLinha());
    for (int i = 0; i < nAreas; i++) areas.push_back(lerLinha());

    int nPalavras = std::stoi(lerLinha());
    for (int i = 0; i < nPalavras; i++) vocab[lerLinha()] = i;

    int nCamadas = std::stoi(lerLinha());
    std::vector<MatrixXd> pesos;
    std::vector<VectorXd> vieses;
    std::vector<int> tamanhos;
    for (int k = 0; k < nCamadas; k++) {
        int linhas, colunas;
        f >> linhas >> colunas;
        MatrixXd W(linhas, colunas);
        for (int i = 0; i < linhas; i++)
            for (int j = 0; j < colunas; j++) f >> W(i, j);
        VectorXd b(linhas);
        for (int i = 0; i < linhas; i++) f >> b(i);
        if (!f) throw std::runtime_error("Arquivo do modelo incompleto ou corrompido.");
        if (k == 0) tamanhos.push_back(colunas);
        tamanhos.push_back(linhas);
        pesos.push_back(W);
        vieses.push_back(b);
    }

    Rede rede(tamanhos);
    for (int k = 0; k < nCamadas; k++) {
        rede.camadas[k].W = pesos[k];
        rede.camadas[k].b = vieses[k];
    }
    return rede;
}