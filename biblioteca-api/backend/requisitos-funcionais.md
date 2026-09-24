# Requisitos Funcionais – Sistema de Biblioteca

Uma biblioteca deseja organizar seu acervo de livros e controlar os empréstimos realizados pelos usuários. A partir desse cenário, foram identificados os requisitos funcionais abaixo.

| Código | Requisito Funcional | Descrição |
| --- | --- | --- |
| RF01 | Cadastro de Livro | O sistema deve permitir cadastrar um novo livro informando título, autor, ISBN, ano de publicação, categoria e quantidade de exemplares. |
| RF02 | Listagem de Livros | O sistema deve permitir consultar todos os livros cadastrados. |
| RF03 | Consulta de Livro | O sistema deve permitir consultar os dados de um livro específico a partir do seu identificador. |
| RF04 | Pesquisa de Livros | O sistema deve permitir pesquisar livros pelo título (busca parcial). |
| RF05 | Ordenação de Livros | O sistema deve permitir listar os livros ordenados por um campo (título, autor, ano, categoria ou quantidade), em ordem crescente ou decrescente. |
| RF06 | Edição de Livro | O sistema deve permitir alterar os dados de um livro já cadastrado. |
| RF07 | Exclusão de Livro | O sistema deve permitir excluir um livro, desde que não existam empréstimos vinculados a ele. |
| RF08 | Cadastro de Usuário | O sistema deve permitir cadastrar um novo usuário informando nome, CPF, e-mail e telefone. |
| RF09 | Listagem de Usuários | O sistema deve permitir consultar todos os usuários cadastrados. |
| RF10 | Consulta de Usuário | O sistema deve permitir consultar os dados de um usuário específico. |
| RF11 | Edição de Usuário | O sistema deve permitir alterar os dados de um usuário já cadastrado. |
| RF12 | Exclusão de Usuário | O sistema deve permitir excluir um usuário, desde que não existam empréstimos vinculados a ele. |
| RF13 | Registro de Empréstimo | O sistema deve permitir registrar o empréstimo de um livro a um usuário, informando as datas de empréstimo e de devolução prevista. |
| RF14 | Listagem de Empréstimos | O sistema deve permitir consultar todos os empréstimos, exibindo o livro, o usuário, as datas e o status. |
| RF15 | Consulta de Empréstimo | O sistema deve permitir consultar um empréstimo específico. |
| RF16 | Registro de Devolução | O sistema deve permitir registrar a devolução de um livro, preenchendo a data de devolução e alterando o status do empréstimo para "devolvido". |
| RF17 | Controle de Disponibilidade | O sistema deve reduzir em uma unidade a quantidade do livro a cada empréstimo, devolvê-la ao registrar a devolução e impedir empréstimos de livros sem exemplares disponíveis. |
| RF18 | Validação de Dados | O sistema deve validar os dados recebidos (campos obrigatórios, CPF com 11 dígitos, e-mail válido, ISBN/CPF/e-mail únicos, datas coerentes) e informar o erro ao cliente. |

## Relação entre requisitos e rotas da API

| Requisito | Rota |
| --- | --- |
| RF01 | `POST /livros` |
| RF02 | `GET /livros` |
| RF03 | `GET /livros/:id` |
| RF04 | `GET /livros/busca/:titulo` |
| RF05 | `GET /livros/ordenados?campo=&ordem=` |
| RF06 | `PUT /livros/:id` |
| RF07 | `DELETE /livros/:id` |
| RF08 | `POST /usuarios` |
| RF09 | `GET /usuarios` |
| RF10 | `GET /usuarios/:id` |
| RF11 | `PUT /usuarios/:id` |
| RF12 | `DELETE /usuarios/:id` |
| RF13 | `POST /emprestimos` |
| RF14 | `GET /emprestimos` |
| RF15 | `GET /emprestimos/:id` |
| RF16 | `PUT /emprestimos/:id` |
| RF17 | `POST /emprestimos` e `PUT /emprestimos/:id` |
| RF18 | Todas as rotas de escrita |
