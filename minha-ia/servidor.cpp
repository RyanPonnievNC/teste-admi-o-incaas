#include <iostream>
#include <iomanip>
#include <mutex>
#include <sstream>
#include <string>
#include <vector>
#include <map>
#include "httplib.h"
#include "modelo.h"

// Deixa o texto em minusculas, sem acentos, so com letras e numeros
// (o modelo foi treinado assim). Entende UTF-8, que e o que o navegador envia.
// Aspas, apostrofos, til, circunflexo, crase e demais pontuacoes viram espaco.
std::string normalizar(const std::string& entrada) {
    std::string saida;
    for (size_t i = 0; i < entrada.size(); i++) {
        unsigned char c = entrada[i];
        if (c < 0x80) {
            if (c >= 'A' && c <= 'Z') saida += (char)(c - 'A' + 'a');
            else if ((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9')) saida += (char)c;
            else saida += ' ';
        } else if (c == 0xC3 && i + 1 < entrada.size()) {
            unsigned char d = entrada[++i];
            char letra = ' ';
            if ((d >= 0xA0 && d <= 0xA5) || (d >= 0x80 && d <= 0x85)) letra = 'a';
            else if (d == 0xA7 || d == 0x87) letra = 'c';
            else if ((d >= 0xA8 && d <= 0xAB) || (d >= 0x88 && d <= 0x8B)) letra = 'e';
            else if ((d >= 0xAC && d <= 0xAF) || (d >= 0x8C && d <= 0x8F)) letra = 'i';
            else if (d == 0xB1 || d == 0x91) letra = 'n';
            else if ((d >= 0xB2 && d <= 0xB6) || (d >= 0x92 && d <= 0x96)) letra = 'o';
            else if ((d >= 0xB9 && d <= 0xBC) || (d >= 0x99 && d <= 0x9C)) letra = 'u';
            saida += letra;
        } else if ((c == 0xCC || c == 0xCD) && i + 1 < entrada.size()) {
            // Acento "solto" (til, crase, circunflexo como caractere separado): ignora
            i++;
        } else {
            saida += ' ';
        }
    }
    return saida;
}

std::string numero(double x) {
    std::ostringstream ss;
    ss << std::fixed << std::setprecision(4) << x;
    return ss.str();
}

int main() {
    std::vector<std::string> areas;
    std::map<std::string, int> vocab;
    Rede* rede = nullptr;
    try {
        rede = new Rede(carregarModelo("dados/modelo.txt", areas, vocab));
    } catch (const std::exception& e) {
        std::cout << "Erro: " << e.what() << "\n";
        return 1;
    }

    std::mutex trava;            // a rede guarda dados internos, entao um pedido por vez
    const double LIMITE = 0.35;  // abaixo disso a resposta e "indefinido"

    httplib::Server svr;

    // Libera o Angular (outra porta) para chamar este servidor
    svr.set_default_headers({
        {"Access-Control-Allow-Origin", "*"},
        {"Access-Control-Allow-Methods", "GET, OPTIONS"},
        {"Access-Control-Allow-Headers", "Content-Type"}
    });
    svr.Options(R"(.*)", [](const httplib::Request&, httplib::Response& res) {
        res.status = 204;
    });

    // Teste rapido: http://127.0.0.1:8080/saude
    svr.Get("/saude", [](const httplib::Request&, httplib::Response& res) {
        res.set_content("{\"status\":\"ok\"}", "application/json; charset=utf-8");
    });

    // Uso: http://127.0.0.1:8080/classificar?texto=acao de horas extras
    svr.Get("/classificar", [&](const httplib::Request& req, httplib::Response& res) {
        if (!req.has_param("texto")) {
            res.status = 400;
            res.set_content("{\"erro\":\"faltou o parametro texto\"}", "application/json; charset=utf-8");
            return;
        }
        std::string texto = normalizar(req.get_param_value("texto"));

        int conhecidas = 0;
        for (const auto& p : palavras(texto))
            if (vocab.count(p)) conhecidas++;

        std::string area = "indefinido";
        double confianca = 0.0;
        std::vector<double> probs(areas.size(), 0.0);

        if (conhecidas > 0) {
            std::lock_guard<std::mutex> guarda(trava);
            MatrixXd s = rede->prever(textoParaVetor(texto, vocab));
            int melhor = maiorIndice(s.col(0));
            for (size_t i = 0; i < areas.size(); i++) probs[i] = s(i, 0);
            confianca = s(melhor, 0);
            if (confianca >= LIMITE) area = areas[melhor];
        }

        std::string json = "{\"area\":\"" + area + "\",\"confianca\":" + numero(confianca) + ",\"probabilidades\":{";
        for (size_t i = 0; i < areas.size(); i++) {
            if (i > 0) json += ",";
            json += "\"" + areas[i] + "\":" + numero(probs[i]);
        }
        json += "}}";
        res.set_content(json, "application/json; charset=utf-8");

        std::cout << "[" << texto << "] -> " << area << " (" << (int)(confianca * 100) << "%)\n";
    });

    std::cout << "Servidor rodando em http://127.0.0.1:8080  (Ctrl + C para parar)\n";
    std::cout << "Modelo: " << vocab.size() << " palavras, " << areas.size() << " areas\n";
    if (!svr.listen("127.0.0.1", 8080)) {
        std::cout << "Nao consegui abrir a porta 8080. Ela pode estar em uso.\n";
        return 1;
    }
}