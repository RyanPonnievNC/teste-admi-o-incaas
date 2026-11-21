#pragma once
#include <iostream>
#include <vector>
#include <cstdlib>
#include <Eigen/Dense>

using Eigen::MatrixXd;
using Eigen::VectorXd;

// Sigmoid aplicada em todos os elementos da matriz
MatrixXd sigmoid(const MatrixXd& z) {
    return (1.0 / (1.0 + (-z.array()).exp())).matrix();
}

// Uma camada de neuronios. Cada COLUNA das matrizes e uma amostra.
class Camada {
public:
    MatrixXd W;        // pesos: (neuronios x entradas)
    VectorXd b;        // vieses: (neuronios)
    MatrixXd entrada;  // guardada para o backward
    MatrixXd saida;    // guardada para o backward

    Camada(int nEntradas, int nNeuronios) {
        W = MatrixXd::Random(nNeuronios, nEntradas); // valores entre -1 e 1
        b = VectorXd::Zero(nNeuronios);
    }

    // Ida: Z = W*X + b, depois sigmoid
    MatrixXd forward(const MatrixXd& X) {
        entrada = X;
        MatrixXd Z = W * X;
        Z.colwise() += b;
        saida = sigmoid(Z);
        return saida;
    }

    // Volta: recebe o erro da saida, corrige W e b, devolve o erro da entrada
    MatrixXd backward(const MatrixXd& dSaida, double taxa) {
        MatrixXd dZ = (dSaida.array() * saida.array() * (1.0 - saida.array())).matrix();
        double m = entrada.cols();                        // numero de amostras
        MatrixXd dW = dZ * entrada.transpose() / m;
        VectorXd db = dZ.rowwise().sum() / m;
        MatrixXd dEntrada = W.transpose() * dZ;           // erro passado para a camada anterior

        W -= taxa * dW;
        b -= taxa * db;
        return dEntrada;
    }
};

// Uma rede e uma lista de camadas
class Rede {
public:
    std::vector<Camada> camadas;

    // tamanhos = {2, 4, 1} -> 2 entradas, 4 escondidos, 1 saida
    Rede(const std::vector<int>& tamanhos) {
        for (size_t i = 0; i + 1 < tamanhos.size(); i++)
            camadas.emplace_back(tamanhos[i], tamanhos[i + 1]);
    }

    MatrixXd prever(const MatrixXd& X) {
        MatrixXd a = X;
        for (auto& c : camadas) a = c.forward(a);
        return a;
    }

    double treinarPasso(const MatrixXd& X, const MatrixXd& Y, double taxa) {
        MatrixXd saida = prever(X);
        MatrixXd erro = saida - Y;
        double perda = erro.array().square().mean();

        MatrixXd d = erro;
        for (int i = (int)camadas.size() - 1; i >= 0; i--)
            d = camadas[i].backward(d, taxa);
        return perda;
    }
};
