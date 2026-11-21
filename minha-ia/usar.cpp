#include <iostream>
#include <string>
#include <vector>
#include <map>
#include "modelo.h"

int main() {
    std::vector<std::string> areas;
    std::map<std::string, int> vocab;
    try {
        Rede rede = carregarModelo("dados/modelo.txt", areas, vocab);

        std::cout << "Modelo carregado (" << vocab.size() << " palavras, " << areas.size() << " areas).\n";
        std::cout << "Digite uma descricao (sem acentos) ou 'sair':\n";
        std::string entrada;
        while (std::cout << "> " && std::getline(std::cin, entrada)) {
            if (entrada == "sair") break;
            MatrixXd s = rede.prever(textoParaVetor(entrada, vocab));
            for (size_t i = 0; i < areas.size(); i++)
                std::cout << "  " << areas[i] << ": " << (int)(s(i, 0) * 100) << "%\n";
            std::cout << "  -> " << areas[maiorIndice(s.col(0))] << "\n";
        }
    } catch (const std::exception& e) {
        std::cout << "Erro: " << e.what() << "\n";
        return 1;
    }
}