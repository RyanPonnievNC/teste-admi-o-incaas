const mysql = require('mysql2/promise');

// Dados de conexao (vem do arquivo .env)
const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  charset: 'utf8mb4'
};

const nomeBanco = process.env.DB_NAME || 'juridico';

let pool;

// Cria o banco e a tabela se ainda nao existirem, e deixa a conexao pronta
async function iniciarBanco() {
  // 1. Conecta sem escolher banco e cria o banco, se precisar
  const conexao = await mysql.createConnection(config);
  await conexao.query(
    `CREATE DATABASE IF NOT EXISTS \`${nomeBanco}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await conexao.end();

  // 2. Cria um grupo de conexoes ja apontando para o banco
  pool = mysql.createPool({
    ...config,
    database: nomeBanco,
    waitForConnections: true,
    connectionLimit: 10
  });

  // 3. Cria a tabela de processos, se nao existir
  await pool.query(`
    CREATE TABLE IF NOT EXISTS processos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      numero VARCHAR(30) NOT NULL,
      cliente VARCHAR(150) NOT NULL,
      descricao TEXT NOT NULL,
      area VARCHAR(20) NOT NULL DEFAULT '',
      status ENUM('ATIVO', 'FINALIZADO', 'SUSPENSO') NOT NULL,
      data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
}

// Devolve o grupo de conexoes para as rotas usarem
function banco() {
  return pool;
}

module.exports = { iniciarBanco, banco };