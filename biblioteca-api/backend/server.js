require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------
const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const CPF_REGEX = /^\d{11}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const vazio = (v) => v === undefined || v === null || String(v).trim() === '';

// Trata erros do banco e devolve o código HTTP adequado
function tratarErro(res, err) {
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ erro: 'Registro duplicado (ISBN, CPF ou e-mail já cadastrado).' });
  }
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({ erro: 'Não é possível excluir: existem empréstimos vinculados a este registro.' });
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ erro: 'Livro ou usuário informado não existe.' });
  }
  if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
    return res.status(400).json({ erro: 'Dados violam uma restrição do banco (ex.: datas ou ano inválidos).' });
  }
  console.error(err);
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
}

// Valida os campos de livro; devolve mensagem de erro ou null
function validarLivro(b) {
  const obrigatorios = ['titulo', 'autor', 'isbn', 'ano_publicacao', 'categoria', 'quantidade'];
  const faltando = obrigatorios.filter((c) => vazio(b[c]));
  if (faltando.length) return `Campos obrigatórios ausentes: ${faltando.join(', ')}.`;
  if (!Number.isInteger(Number(b.ano_publicacao)) || b.ano_publicacao < 1000 || b.ano_publicacao > 2100)
    return 'ano_publicacao deve ser um ano válido.';
  if (!Number.isInteger(Number(b.quantidade)) || b.quantidade < 0)
    return 'quantidade deve ser um inteiro maior ou igual a zero.';
  return null;
}

function validarUsuario(b) {
  const obrigatorios = ['nome', 'cpf', 'email'];
  const faltando = obrigatorios.filter((c) => vazio(b[c]));
  if (faltando.length) return `Campos obrigatórios ausentes: ${faltando.join(', ')}.`;
  if (!CPF_REGEX.test(String(b.cpf))) return 'cpf deve conter 11 dígitos numéricos.';
  if (!EMAIL_REGEX.test(b.email)) return 'e-mail inválido.';
  return null;
}

// ---------------------------------------------------------------
// Rota raiz
// ---------------------------------------------------------------
app.get('/', (req, res) => {
  res.json({ mensagem: 'API da Biblioteca funcionando', rotas: ['/livros', '/usuarios', '/emprestimos'] });
});

// ===============================================================
// LIVROS
// ===============================================================

// Listar todos os livros
app.get('/livros', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM livros');
    res.json(rows);
  } catch (err) { tratarErro(res, err); }
});

// Listar livros ordenados: /livros/ordenados?campo=titulo&ordem=asc
// (precisa vir ANTES de /livros/:id)
app.get('/livros/ordenados', async (req, res) => {
  const campos = ['titulo', 'autor', 'ano_publicacao', 'categoria', 'quantidade'];
  const campo = req.query.campo || 'titulo';
  const ordem = String(req.query.ordem || 'asc').toLowerCase();

  if (!campos.includes(campo))
    return res.status(400).json({ erro: `campo inválido. Use: ${campos.join(', ')}.` });
  if (!['asc', 'desc'].includes(ordem))
    return res.status(400).json({ erro: "ordem inválida. Use 'asc' ou 'desc'." });

  try {
    // campo e ordem passaram pela lista de valores permitidos (evita SQL Injection)
    const [rows] = await db.query(`SELECT * FROM livros ORDER BY ${campo} ${ordem.toUpperCase()}`);
    res.json(rows);
  } catch (err) { tratarErro(res, err); }
});

// Pesquisar livros por título (busca parcial)
app.get('/livros/busca/:titulo', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM livros WHERE titulo LIKE ?', [`%${req.params.titulo}%`]);
    res.json(rows);
  } catch (err) { tratarErro(res, err); }
});

// Consultar um livro
app.get('/livros/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM livros WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ erro: 'Livro não encontrado.' });
    res.json(rows[0]);
  } catch (err) { tratarErro(res, err); }
});

// Cadastrar livro
app.post('/livros', async (req, res) => {
  const erro = validarLivro(req.body);
  if (erro) return res.status(400).json({ erro });

  const { titulo, autor, isbn, ano_publicacao, categoria, quantidade } = req.body;
  try {
    const [r] = await db.query(
      `INSERT INTO livros (titulo, autor, isbn, ano_publicacao, categoria, quantidade)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [titulo, autor, isbn, ano_publicacao, categoria, quantidade]
    );
    res.status(201).json({ id: r.insertId, titulo, autor, isbn, ano_publicacao, categoria, quantidade });
  } catch (err) { tratarErro(res, err); }
});

// Editar livro
app.put('/livros/:id', async (req, res) => {
  const erro = validarLivro(req.body);
  if (erro) return res.status(400).json({ erro });

  const { titulo, autor, isbn, ano_publicacao, categoria, quantidade } = req.body;
  try {
    const [r] = await db.query(
      `UPDATE livros SET titulo = ?, autor = ?, isbn = ?, ano_publicacao = ?, categoria = ?, quantidade = ?
       WHERE id = ?`,
      [titulo, autor, isbn, ano_publicacao, categoria, quantidade, req.params.id]
    );
    if (!r.affectedRows) return res.status(404).json({ erro: 'Livro não encontrado.' });
    res.json({ id: Number(req.params.id), titulo, autor, isbn, ano_publicacao, categoria, quantidade });
  } catch (err) { tratarErro(res, err); }
});

// Excluir livro
app.delete('/livros/:id', async (req, res) => {
  try {
    const [r] = await db.query('DELETE FROM livros WHERE id = ?', [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ erro: 'Livro não encontrado.' });
    res.json({ mensagem: 'Livro excluído com sucesso.' });
  } catch (err) { tratarErro(res, err); }
});

// ===============================================================
// USUÁRIOS
// ===============================================================

app.get('/usuarios', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM usuarios');
    res.json(rows);
  } catch (err) { tratarErro(res, err); }
});

app.get('/usuarios/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    res.json(rows[0]);
  } catch (err) { tratarErro(res, err); }
});

app.post('/usuarios', async (req, res) => {
  const erro = validarUsuario(req.body);
  if (erro) return res.status(400).json({ erro });

  const { nome, cpf, email, telefone = null } = req.body;
  try {
    const [r] = await db.query(
      'INSERT INTO usuarios (nome, cpf, email, telefone) VALUES (?, ?, ?, ?)',
      [nome, cpf, email, telefone]
    );
    res.status(201).json({ id: r.insertId, nome, cpf, email, telefone });
  } catch (err) { tratarErro(res, err); }
});

app.put('/usuarios/:id', async (req, res) => {
  const erro = validarUsuario(req.body);
  if (erro) return res.status(400).json({ erro });

  const { nome, cpf, email, telefone = null } = req.body;
  try {
    const [r] = await db.query(
      'UPDATE usuarios SET nome = ?, cpf = ?, email = ?, telefone = ? WHERE id = ?',
      [nome, cpf, email, telefone, req.params.id]
    );
    if (!r.affectedRows) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    res.json({ id: Number(req.params.id), nome, cpf, email, telefone });
  } catch (err) { tratarErro(res, err); }
});

app.delete('/usuarios/:id', async (req, res) => {
  try {
    const [r] = await db.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    res.json({ mensagem: 'Usuário excluído com sucesso.' });
  } catch (err) { tratarErro(res, err); }
});

// ===============================================================
// EMPRÉSTIMOS
// ===============================================================

const SELECT_EMPRESTIMOS = `
  SELECT e.id, e.livro_id, l.titulo AS livro, e.usuario_id, u.nome AS usuario,
         e.data_emprestimo, e.data_prevista_devolucao, e.data_devolucao, e.status
  FROM emprestimos e
  JOIN livros l   ON l.id = e.livro_id
  JOIN usuarios u ON u.id = e.usuario_id`;

app.get('/emprestimos', async (req, res) => {
  try {
    const [rows] = await db.query(`${SELECT_EMPRESTIMOS} ORDER BY e.id`);
    res.json(rows);
  } catch (err) { tratarErro(res, err); }
});

app.get('/emprestimos/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`${SELECT_EMPRESTIMOS} WHERE e.id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ erro: 'Empréstimo não encontrado.' });
    res.json(rows[0]);
  } catch (err) { tratarErro(res, err); }
});

// Registrar empréstimo: valida estoque e baixa 1 unidade do livro (em transação)
app.post('/emprestimos', async (req, res) => {
  const { livro_id, usuario_id, data_emprestimo, data_prevista_devolucao } = req.body;

  if ([livro_id, usuario_id, data_emprestimo, data_prevista_devolucao].some(vazio))
    return res.status(400).json({
      erro: 'Campos obrigatórios: livro_id, usuario_id, data_emprestimo, data_prevista_devolucao.'
    });
  if (!DATA_REGEX.test(data_emprestimo) || !DATA_REGEX.test(data_prevista_devolucao))
    return res.status(400).json({ erro: 'As datas devem estar no formato AAAA-MM-DD.' });
  if (data_prevista_devolucao < data_emprestimo)
    return res.status(400).json({ erro: 'A data prevista de devolução não pode ser anterior ao empréstimo.' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [livros] = await conn.query('SELECT quantidade FROM livros WHERE id = ? FOR UPDATE', [livro_id]);
    if (!livros.length) {
      await conn.rollback();
      return res.status(404).json({ erro: 'Livro não encontrado.' });
    }
    if (livros[0].quantidade < 1) {
      await conn.rollback();
      return res.status(409).json({ erro: 'Livro indisponível: não há exemplares em estoque.' });
    }

    const [usuarios] = await conn.query('SELECT id FROM usuarios WHERE id = ?', [usuario_id]);
    if (!usuarios.length) {
      await conn.rollback();
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const [r] = await conn.query(
      `INSERT INTO emprestimos (livro_id, usuario_id, data_emprestimo, data_prevista_devolucao, status)
       VALUES (?, ?, ?, ?, 'emprestado')`,
      [livro_id, usuario_id, data_emprestimo, data_prevista_devolucao]
    );
    await conn.query('UPDATE livros SET quantidade = quantidade - 1 WHERE id = ?', [livro_id]);

    await conn.commit();
    res.status(201).json({
      id: r.insertId, livro_id, usuario_id, data_emprestimo, data_prevista_devolucao,
      data_devolucao: null, status: 'emprestado'
    });
  } catch (err) {
    await conn.rollback();
    tratarErro(res, err);
  } finally {
    conn.release();
  }
});

// Registrar devolução: preenche data_devolucao, muda status e devolve 1 unidade ao estoque
// Body opcional: { "data_devolucao": "AAAA-MM-DD" } (padrão: data de hoje)
app.put('/emprestimos/:id', async (req, res) => {
  let { data_devolucao } = req.body || {};
  if (vazio(data_devolucao)) {
    data_devolucao = new Date().toISOString().slice(0, 10);
  } else if (!DATA_REGEX.test(data_devolucao)) {
    return res.status(400).json({ erro: 'data_devolucao deve estar no formato AAAA-MM-DD.' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query('SELECT * FROM emprestimos WHERE id = ? FOR UPDATE', [req.params.id]);
    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ erro: 'Empréstimo não encontrado.' });
    }
    const emp = rows[0];
    if (emp.status === 'devolvido') {
      await conn.rollback();
      return res.status(409).json({ erro: 'Este empréstimo já foi devolvido.' });
    }
    if (data_devolucao < emp.data_emprestimo) {
      await conn.rollback();
      return res.status(400).json({ erro: 'A devolução não pode ser anterior à data do empréstimo.' });
    }

    await conn.query(
      "UPDATE emprestimos SET data_devolucao = ?, status = 'devolvido' WHERE id = ?",
      [data_devolucao, req.params.id]
    );
    await conn.query('UPDATE livros SET quantidade = quantidade + 1 WHERE id = ?', [emp.livro_id]);

    await conn.commit();
    res.json({ mensagem: 'Devolução registrada com sucesso.', id: Number(req.params.id), data_devolucao, status: 'devolvido' });
  } catch (err) {
    await conn.rollback();
    tratarErro(res, err);
  } finally {
    conn.release();
  }
});

// ---------------------------------------------------------------
// Rota inexistente + inicialização
// ---------------------------------------------------------------
app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));

// JSON malformado no corpo da requisição
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
