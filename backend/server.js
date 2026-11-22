// Carrega as variaveis do arquivo .env (senha do banco, porta, etc.)
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const { iniciarBanco, banco } = require('./db');

// Valores aceitos pelos campos area e status
const AREAS = ['', 'trabalhista', 'civel', 'familia', 'criminal', 'tributario'];
const STATUS = ['ATIVO', 'FINALIZADO', 'SUSPENSO'];

// Colunas devolvidas ao site (data_criacao vira dataCriacao, como no model do Angular)
const COLUNAS = 'id, numero, cliente, descricao, area, status, data_criacao AS dataCriacao';

const app = express();

// Quais enderecos do site podem chamar esta API
const origens = (process.env.CORS_ORIGIN || 'http://localhost:4200')
  .split(',')
  .map(origem => origem.trim());

app.use(cors({ origin: origens }));
app.use(express.json());

// Confere e limpa os dados recebidos. Devolve { dados } ou { erro }.
// O numero nao vem do site: o servidor gera ao criar e nunca muda depois.
function validar(corpo) {
  const dados = {
    cliente: String(corpo?.cliente ?? '').trim(),
    descricao: String(corpo?.descricao ?? '').trim(),
    area: String(corpo?.area ?? '').trim(),
    status: String(corpo?.status ?? '').trim()
  };

  if (!dados.cliente || dados.cliente.length > 150) {
    return { erro: 'O nome do cliente é obrigatório (até 150 caracteres).' };
  }
  if (dados.descricao.length > 5000) {
    return { erro: 'A descrição é grande demais (máximo de 5000 caracteres).' };
  }
  if (!AREAS.includes(dados.area)) {
    return { erro: 'Área inválida.' };
  }
  if (!STATUS.includes(dados.status)) {
    return { erro: 'Status inválido.' };
  }

  return { dados };
}

// Le o id da URL (por exemplo /api/processos/5). Devolve null se for invalido.
function lerId(req) {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Evita repetir try/catch em toda rota: qualquer erro vira resposta 500
function rota(funcao) {
  return async (req, res) => {
    try {
      await funcao(req, res);
    } catch (erro) {
      console.error('Erro na rota', req.method, req.originalUrl, '-', erro.message);
      res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
  };
}

// Calcula o proximo numero: maior sequencia do ano atual + 1 (ex.: 0004-2026)
async function proximoNumero(conexao) {
  const ano = new Date().getFullYear();

  const [linhas] = await conexao.query(
    `SELECT MAX(CAST(SUBSTRING_INDEX(numero, '-', 1) AS UNSIGNED)) AS ultimo
       FROM processos
      WHERE numero REGEXP ?`,
    [`^[0-9]+-${ano}$`]
  );

  const proximo = Number(linhas[0].ultimo ?? 0) + 1;
  return `${String(proximo).padStart(4, '0')}-${ano}`;
}

// Teste rapido: http://127.0.0.1:3000/api/saude
app.get('/api/saude', (req, res) => {
  res.json({ status: 'ok' });
});

// Lista todos os processos, os mais novos primeiro
app.get('/api/processos', rota(async (req, res) => {
  const [linhas] = await banco().query(`SELECT ${COLUNAS} FROM processos ORDER BY id DESC`);
  res.json(linhas);
}));

// Busca um processo pelo id
app.get('/api/processos/:id', rota(async (req, res) => {
  const id = lerId(req);
  if (id === null) return res.status(400).json({ erro: 'Id inválido.' });

  const [linhas] = await banco().query(`SELECT ${COLUNAS} FROM processos WHERE id = ?`, [id]);
  if (linhas.length === 0) return res.status(404).json({ erro: 'Processo não encontrado.' });

  res.json(linhas[0]);
}));

// Cria um processo, com numero gerado automaticamente
app.post('/api/processos', rota(async (req, res) => {
  const { dados, erro } = validar(req.body);
  if (erro) return res.status(400).json({ erro });

  // Usa uma conexao so para esta operacao, para poder travar a geracao do numero
  const conexao = await banco().getConnection();

  try {
    // Trava: duas pessoas salvando ao mesmo tempo nao recebem o mesmo numero
    const [[trava]] = await conexao.query("SELECT GET_LOCK('numero_processo', 10) AS ok");
    if (Number(trava.ok) !== 1) {
      return res.status(503).json({ erro: 'Servidor ocupado. Tente salvar de novo.' });
    }

    try {
      const numero = await proximoNumero(conexao);

      const [resultado] = await conexao.query(
        'INSERT INTO processos (numero, cliente, descricao, area, status) VALUES (?, ?, ?, ?, ?)',
        [numero, dados.cliente, dados.descricao, dados.area, dados.status]
      );

      const [linhas] = await conexao.query(
        `SELECT ${COLUNAS} FROM processos WHERE id = ?`,
        [resultado.insertId]
      );
      res.status(201).json(linhas[0]);
    } finally {
      // Libera a trava, aconteca o que acontecer
      await conexao.query("SELECT RELEASE_LOCK('numero_processo')");
    }
  } finally {
    conexao.release();
  }
}));

// Atualiza um processo (o numero continua o mesmo)
app.put('/api/processos/:id', rota(async (req, res) => {
  const id = lerId(req);
  if (id === null) return res.status(400).json({ erro: 'Id inválido.' });

  const { dados, erro } = validar(req.body);
  if (erro) return res.status(400).json({ erro });

  await banco().query(
    'UPDATE processos SET cliente = ?, descricao = ?, area = ?, status = ? WHERE id = ?',
    [dados.cliente, dados.descricao, dados.area, dados.status, id]
  );

  const [linhas] = await banco().query(`SELECT ${COLUNAS} FROM processos WHERE id = ?`, [id]);
  if (linhas.length === 0) return res.status(404).json({ erro: 'Processo não encontrado.' });

  res.json(linhas[0]);
}));

// Exclui um processo
app.delete('/api/processos/:id', rota(async (req, res) => {
  const id = lerId(req);
  if (id === null) return res.status(400).json({ erro: 'Id inválido.' });

  const [resultado] = await banco().query('DELETE FROM processos WHERE id = ?', [id]);
  if (resultado.affectedRows === 0) return res.status(404).json({ erro: 'Processo não encontrado.' });

  res.status(204).end();
}));

// Liga o banco e depois o servidor.
// Escuta so em 127.0.0.1 (este computador), porque a API ainda nao tem login.
const porta = Number(process.env.PORT || 3000);
const endereco = process.env.HOST || '127.0.0.1';

iniciarBanco()
  .then(() => {
    app.listen(porta, endereco, () => {
      console.log(`API rodando em http://${endereco}:${porta}  (Ctrl + C para parar)`);
    });
  })
  .catch(erro => {
    console.error('Não consegui iniciar o banco de dados:', erro.message);
    console.error('Confira se o MySQL está ligado e se o usuário e a senha do arquivo .env estão certos.');
    process.exit(1);
  });