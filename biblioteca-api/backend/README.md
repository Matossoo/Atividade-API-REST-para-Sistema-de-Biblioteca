# Biblioteca API

API REST para gerenciamento de uma biblioteca: cadastro de livros e usuários e controle de empréstimos e devoluções.

## Objetivo do sistema

Organizar o acervo de livros de uma biblioteca e controlar os empréstimos feitos pelos usuários, mantendo o estoque de exemplares atualizado automaticamente.

## Tecnologias utilizadas

- Node.js
- Express
- MySQL (biblioteca `mysql2`)
- CORS
- dotenv (variáveis de ambiente)
- Git e GitHub

## Estrutura do projeto

```
biblioteca-api/
└── backend/
    ├── db.js                     # conexão com o MySQL (pool)
    ├── server.js                 # servidor Express e rotas
    ├── banco.sql                 # script de criação do banco e dados de teste
    ├── modelo-logico.pdf         # modelo lógico do banco (também em .png)
    ├── requisitos-funcionais.md  # requisitos funcionais (RF)
    ├── testes.md                 # registro dos testes das rotas
    ├── testes.http               # requisições prontas para testar
    ├── .env.example              # modelo das variáveis de ambiente
    ├── package.json
    ├── package-lock.json
    └── README.md
```

## Requisitos funcionais

Resumo (a lista completa está em [requisitos-funcionais.md](requisitos-funcionais.md)):

| Código | Requisito |
| --- | --- |
| RF01–RF07 | Cadastro, listagem, consulta, pesquisa, ordenação, edição e exclusão de livros |
| RF08–RF12 | Cadastro, listagem, consulta, edição e exclusão de usuários |
| RF13–RF15 | Registro, listagem e consulta de empréstimos |
| RF16 | Registro de devolução |
| RF17 | Controle de disponibilidade (estoque) |
| RF18 | Validação de dados |

## Modelo lógico

Veja o arquivo [modelo-logico.pdf](modelo-logico.pdf). Resumo das tabelas:

- **livros** (id PK, titulo, autor, isbn UNIQUE, ano_publicacao, categoria, quantidade)
- **usuarios** (id PK, nome, cpf UNIQUE, email UNIQUE, telefone)
- **emprestimos** (id PK, livro_id FK, usuario_id FK, data_emprestimo, data_prevista_devolucao, data_devolucao, status)

Relacionamentos: `livros 1:N emprestimos` e `usuarios 1:N emprestimos`.

## Como configurar o banco de dados

1. Tenha o MySQL 8 instalado e em execução.
2. Execute o script `banco.sql` (ele recria o banco `biblioteca` do zero):

   ```bash
   mysql -u root -p < banco.sql
   ```

   Ou abra o arquivo no MySQL Workbench e execute-o.
3. Copie o arquivo de variáveis de ambiente e ajuste usuário e senha do seu MySQL:

   ```bash
   cp .env.example .env
   ```

   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=sua_senha
   DB_NAME=biblioteca
   PORT=3000
   ```

## Como instalar as dependências

```bash
cd backend
npm install
```

## Como executar o servidor

```bash
npm start
```

O servidor ficará disponível em `http://localhost:3000`. Para reiniciar automaticamente ao salvar arquivos (Node 18+), use `npm run dev`.

## Rotas disponíveis

### Livros

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/livros` | Lista todos os livros |
| GET | `/livros/:id` | Consulta um livro |
| GET | `/livros/busca/:titulo` | Pesquisa livros pelo título (busca parcial) |
| GET | `/livros/ordenados?campo=titulo&ordem=asc` | Lista ordenada. `campo`: titulo, autor, ano_publicacao, categoria, quantidade. `ordem`: asc ou desc |
| POST | `/livros` | Cadastra um livro |
| PUT | `/livros/:id` | Edita um livro |
| DELETE | `/livros/:id` | Exclui um livro |

### Usuários

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/usuarios` | Lista todos os usuários |
| GET | `/usuarios/:id` | Consulta um usuário |
| POST | `/usuarios` | Cadastra um usuário |
| PUT | `/usuarios/:id` | Edita um usuário |
| DELETE | `/usuarios/:id` | Exclui um usuário |

### Empréstimos

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/emprestimos` | Lista todos os empréstimos |
| GET | `/emprestimos/:id` | Consulta um empréstimo |
| POST | `/emprestimos` | Registra um empréstimo (baixa 1 exemplar do estoque) |
| PUT | `/emprestimos/:id` | Registra a devolução (devolve 1 exemplar ao estoque) |

### Códigos HTTP utilizados

| Código | Significado |
| --- | --- |
| 200 | Sucesso |
| 201 | Registro criado |
| 400 | Dados inválidos ou ausentes |
| 404 | Registro ou rota não encontrada |
| 409 | Conflito (ISBN/CPF/e-mail duplicado, livro sem estoque, exclusão com vínculos, devolução já registrada) |
| 500 | Erro interno |

## Exemplos de requisições

**Cadastrar livro** – `POST /livros`

```json
{
  "titulo": "Vidas Secas",
  "autor": "Graciliano Ramos",
  "isbn": "9788501000001",
  "ano_publicacao": 1938,
  "categoria": "Romance",
  "quantidade": 2
}
```

Resposta (201):

```json
{ "id": 7, "titulo": "Vidas Secas", "autor": "Graciliano Ramos", "isbn": "9788501000001", "ano_publicacao": 1938, "categoria": "Romance", "quantidade": 2 }
```

**Pesquisar por título** – `GET /livros/busca/casmurro`

**Ordenar por ano, do mais novo ao mais antigo** – `GET /livros/ordenados?campo=ano_publicacao&ordem=desc`

**Cadastrar usuário** – `POST /usuarios`

```json
{
  "nome": "Diego Reis",
  "cpf": "55566677788",
  "email": "diego@email.com",
  "telefone": "(47) 98888-0000"
}
```

**Registrar empréstimo** – `POST /emprestimos`

```json
{
  "livro_id": 3,
  "usuario_id": 3,
  "data_emprestimo": "2026-09-24",
  "data_prevista_devolucao": "2026-10-08"
}
```

Resposta (201):

```json
{ "id": 3, "livro_id": 3, "usuario_id": 3, "data_emprestimo": "2026-09-24", "data_prevista_devolucao": "2026-10-08", "data_devolucao": null, "status": "emprestado" }
```

**Registrar devolução** – `PUT /emprestimos/3`

```json
{ "data_devolucao": "2026-10-01" }
```

O corpo é opcional; sem ele, a data de hoje é usada. Resposta (200):

```json
{ "mensagem": "Devolução registrada com sucesso.", "id": 3, "data_devolucao": "2026-10-01", "status": "devolvido" }
```

**Exemplo de erro** – `POST /emprestimos` de um livro sem exemplares (409):

```json
{ "erro": "Livro indisponível: não há exemplares em estoque." }
```

## Testes

O registro completo dos testes das rotas está em [testes.md](testes.md). O arquivo [testes.http](testes.http) contém as requisições prontas para uso com a extensão REST Client do VS Code (no Postman, Insomnia ou Thunder Client, basta criar as requisições com os mesmos métodos, URLs e corpos).

## Decisões de projeto

- **Empréstimos e devoluções em transação:** o registro do empréstimo e a atualização do estoque acontecem juntos; se algo falhar, nada é gravado.
- **Exclusão protegida:** livros e usuários com empréstimos vinculados não podem ser excluídos (chave estrangeira com `ON DELETE RESTRICT`), o que preserva o histórico.
- **Ordenação segura:** os campos aceitos em `/livros/ordenados` passam por uma lista de valores permitidos, evitando SQL Injection.
- **Consultas parametrizadas:** todos os valores enviados pelo cliente entram no SQL como parâmetros (`?`).
