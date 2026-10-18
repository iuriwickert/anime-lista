const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const porta = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());

const banco = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'lista_animes',
  waitForConnections: true,
  connectionLimit: 10,
});

app.get('/api/animes', async (_req, res) => {
  try {
    const [linhas] = await banco.execute(
      'SELECT id, titulo, genero, nota, capa_url FROM animes ORDER BY id DESC'
    );
    res.json(linhas);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao consultar os animes.' });
  }
});

app.get('/api/animes/:id', async (req, res) => {
  try {
    const [linhas] = await banco.execute(
      'SELECT id, titulo, genero, nota, capa_url FROM animes WHERE id = ?',
      [req.params.id]
    );
    if (linhas.length === 0) return res.status(404).json({ erro: 'Anime não encontrado.' });
    res.json(linhas[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao consultar o anime.' });
  }
});

app.post('/api/animes', async (req, res) => {
  const { titulo, genero = '', nota, capa_url = '' } = req.body;
  if (!titulo || !String(titulo).trim() || !Number.isFinite(Number(nota)) || Number(nota) < 0 || Number(nota) > 10) {
    return res.status(400).json({ erro: 'Informe título e uma nota entre 0 e 10.' });
  }
  try {
    const [resultado] = await banco.execute(
      'INSERT INTO animes (titulo, genero, nota, capa_url) VALUES (?, ?, ?, ?)',
      [String(titulo).trim(), genero, Number(nota), capa_url]
    );
    res.status(201).json({ id: resultado.insertId, titulo: String(titulo).trim(), genero, nota: Number(nota), capa_url });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao cadastrar o anime.' });
  }
});

app.put('/api/animes/:id', async (req, res) => {
  const { titulo, genero = '', nota, capa_url = '' } = req.body;
  if (!titulo || !String(titulo).trim() || !Number.isFinite(Number(nota)) || Number(nota) < 0 || Number(nota) > 10) {
    return res.status(400).json({ erro: 'Informe título e uma nota entre 0 e 10.' });
  }
  try {
    const [resultado] = await banco.execute(
      'UPDATE animes SET titulo = ?, genero = ?, nota = ?, capa_url = ? WHERE id = ?',
      [String(titulo).trim(), genero, Number(nota), capa_url, req.params.id]
    );
    if (resultado.affectedRows === 0) return res.status(404).json({ erro: 'Anime não encontrado.' });
    res.json({ mensagem: 'Anime atualizado com sucesso.' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao atualizar o anime.' });
  }
});

app.delete('/api/animes/:id', async (req, res) => {
  try {
    const [resultado] = await banco.execute(
      'DELETE FROM animes WHERE id = ?',
      [req.params.id]
    );
    if (resultado.affectedRows === 0) return res.status(404).json({ erro: 'Anime não encontrado.' });
    res.json({ mensagem: 'Anime excluído com sucesso.' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao excluir o anime.' });
  }
});

app.listen(porta, '0.0.0.0', () => {
  console.log('API de animes disponível na porta ' + porta + '.');
});
