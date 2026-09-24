# Registro de Testes das Rotas

Testes realizados com o servidor rodando em `http://localhost:3000` e o banco recriado a partir do `banco.sql`. As requisições estão em [testes.http](testes.http). A coluna "Banco" indica a alteração observada no MySQL.

## Livros

| # | Método | URL | Dados enviados | Resposta | HTTP | Banco |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | GET | `/livros/ordenados?campo=ano_publicacao&ordem=desc` | – | Lista com "Clean Code" (2008) primeiro | 200 | Sem alteração |
| 2 | GET | `/livros/ordenados?campo=xx` | – | `campo inválido. Use: titulo, autor...` | 400 | Sem alteração |
| 3 | GET | `/livros/busca/casmurro` | – | Lista com "Dom Casmurro" | 200 | Sem alteração |
| 4 | GET | `/livros/1` | – | Dados do livro 1 | 200 | Sem alteração |
| 5 | GET | `/livros/999` | – | `Livro não encontrado.` | 404 | Sem alteração |
| 6 | POST | `/livros` | Livro "Vidas Secas" completo | Livro criado com `id: 7` | 201 | Novo registro em `livros` |
| 7 | POST | `/livros` | Mesmo ISBN do teste 6 | `Registro duplicado...` | 409 | Sem alteração |
| 8 | POST | `/livros` | Apenas `titulo` | `Campos obrigatórios ausentes...` | 400 | Sem alteração |
| 9 | POST | `/livros` | JSON malformado | `JSON inválido no corpo da requisição.` | 400 | Sem alteração |
| 10 | PUT | `/livros/7` | Novo título e `quantidade: 4` | Livro atualizado | 200 | Registro 7 alterado |
| 11 | DELETE | `/livros/7` | – | `Livro excluído com sucesso.` | 200 | Registro 7 removido |
| 12 | DELETE | `/livros/7` | – | `Livro não encontrado.` | 404 | Sem alteração |
| 13 | DELETE | `/livros/1` | – | `Não é possível excluir: existem empréstimos vinculados...` | 409 | Sem alteração (FK protege o histórico) |

## Usuários

| # | Método | URL | Dados enviados | Resposta | HTTP | Banco |
| --- | --- | --- | --- | --- | --- | --- |
| 14 | POST | `/usuarios` | Diego Reis, CPF `55566677788` | Usuário criado com `id: 4` | 201 | Novo registro em `usuarios` |
| 15 | POST | `/usuarios` | CPF `123` | `cpf deve conter 11 dígitos numéricos.` | 400 | Sem alteração |
| 16 | POST | `/usuarios` | CPF já cadastrado | `Registro duplicado...` | 409 | Sem alteração |
| 17 | PUT | `/usuarios/4` | Novo nome e telefone | Usuário atualizado | 200 | Registro 4 alterado |
| 18 | GET | `/usuarios/4` | – | Dados atualizados | 200 | Sem alteração |
| 19 | DELETE | `/usuarios/4` | – | `Usuário excluído com sucesso.` | 200 | Registro 4 removido |

## Empréstimos e devoluções

| # | Método | URL | Dados enviados | Resposta | HTTP | Banco |
| --- | --- | --- | --- | --- | --- | --- |
| 20 | GET | `/emprestimos` | – | Lista com nome do livro e do usuário | 200 | Sem alteração |
| 21 | POST | `/emprestimos` | Livro 3, usuário 3 | Empréstimo criado, `status: emprestado` | 201 | Novo registro; estoque do livro 3: 4 → 3 |
| 22 | GET | `/emprestimos/3` | – | Empréstimo criado no teste 21 | 200 | Sem alteração |
| 23 | POST | `/emprestimos` | Devolução prevista anterior ao empréstimo | `A data prevista de devolução não pode ser anterior...` | 400 | Sem alteração |
| 24 | POST | `/emprestimos` | `livro_id: 99` | `Livro não encontrado.` | 404 | Sem alteração |
| 25 | POST | `/emprestimos` | `usuario_id: 99` | `Usuário não encontrado.` | 404 | Sem alteração |
| 26 | POST | `/emprestimos` | Apenas `livro_id` | `Campos obrigatórios...` | 400 | Sem alteração |
| 27 | POST | `/emprestimos` | Livro 1 (2 exemplares), 2 vezes | Ambos criados | 201 | Estoque do livro 1: 2 → 0 |
| 28 | POST | `/emprestimos` | Livro 1 sem estoque | `Livro indisponível: não há exemplares em estoque.` | 409 | Sem alteração |
| 29 | PUT | `/emprestimos/3` | `data_devolucao: 2026-10-01` | `Devolução registrada com sucesso.` | 200 | `status: devolvido`; estoque do livro 3: 3 → 4 |
| 30 | PUT | `/emprestimos/3` | – | `Este empréstimo já foi devolvido.` | 409 | Sem alteração |
| 31 | PUT | `/emprestimos/4` | Sem corpo | Devolução com a data de hoje | 200 | `status: devolvido`; estoque devolvido |
| 32 | PUT | `/emprestimos/999` | – | `Empréstimo não encontrado.` | 404 | Sem alteração |
| 33 | PUT | `/emprestimos/5` | Devolução anterior ao empréstimo | `A devolução não pode ser anterior à data do empréstimo.` | 400 | Sem alteração |

## Outros

| # | Método | URL | Resposta | HTTP |
| --- | --- | --- | --- | --- |
| 34 | GET | `/xyz` | `Rota não encontrada.` | 404 |
