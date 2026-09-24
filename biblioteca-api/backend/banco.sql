-- =====================================================
-- Sistema de Biblioteca - Script de criação do banco
-- SGBD: MySQL 8+
-- =====================================================

SET NAMES utf8mb4;

DROP DATABASE IF EXISTS biblioteca;
CREATE DATABASE biblioteca
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE biblioteca;

-- -----------------------------------------------------
-- Tabela: livros
-- -----------------------------------------------------
CREATE TABLE livros (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  titulo          VARCHAR(150) NOT NULL,
  autor           VARCHAR(100) NOT NULL,
  isbn            VARCHAR(20)  NOT NULL,
  ano_publicacao  SMALLINT     NOT NULL,
  categoria       VARCHAR(50)  NOT NULL,
  quantidade      INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_livros_isbn (isbn),
  CONSTRAINT chk_livros_ano CHECK (ano_publicacao BETWEEN 1000 AND 2100)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Tabela: usuarios
-- -----------------------------------------------------
CREATE TABLE usuarios (
  id        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome      VARCHAR(100) NOT NULL,
  cpf       CHAR(11)     NOT NULL,
  email     VARCHAR(120) NOT NULL,
  telefone  VARCHAR(20)  NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_usuarios_cpf (cpf),
  UNIQUE KEY uk_usuarios_email (email)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Tabela: emprestimos
-- Relacionamentos:
--   livros   1 --- N emprestimos
--   usuarios 1 --- N emprestimos
-- -----------------------------------------------------
CREATE TABLE emprestimos (
  id                        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  livro_id                  INT UNSIGNED NOT NULL,
  usuario_id                INT UNSIGNED NOT NULL,
  data_emprestimo           DATE NOT NULL,
  data_prevista_devolucao   DATE NOT NULL,
  data_devolucao            DATE NULL,
  status                    ENUM('emprestado','devolvido') NOT NULL DEFAULT 'emprestado',
  PRIMARY KEY (id),
  CONSTRAINT fk_emprestimos_livro
    FOREIGN KEY (livro_id) REFERENCES livros (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_emprestimos_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_emprestimos_datas
    CHECK (data_prevista_devolucao >= data_emprestimo)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Dados de teste
-- -----------------------------------------------------
INSERT INTO livros (titulo, autor, isbn, ano_publicacao, categoria, quantidade) VALUES
('Dom Casmurro',               'Machado de Assis',      '9788535911664', 1899, 'Romance',   3),
('O Cortiço',                  'Aluísio Azevedo',       '9788508040209', 1890, 'Romance',   2),
('Capitães da Areia',          'Jorge Amado',           '9788535914061', 1937, 'Romance',   4),
('Memórias Póstumas de Brás Cubas', 'Machado de Assis', '9788572326971', 1881, 'Romance',   2),
('Clean Code',                 'Robert C. Martin',      '9780132350884', 2008, 'Tecnologia',3),
('O Pequeno Príncipe',         'Antoine de Saint-Exupéry','9788595081512', 1943, 'Infantil', 5);

INSERT INTO usuarios (nome, cpf, email, telefone) VALUES
('Ana Souza',    '12345678901', 'ana.souza@email.com',    '(47) 99999-0001'),
('Bruno Lima',   '98765432100', 'bruno.lima@email.com',   '(47) 99999-0002'),
('Carla Mendes', '11122233344', 'carla.mendes@email.com', '(47) 99999-0003');

-- Empréstimos de exemplo (o estoque de livros já reflete os empréstimos ativos)
INSERT INTO emprestimos (livro_id, usuario_id, data_emprestimo, data_prevista_devolucao, data_devolucao, status) VALUES
(1, 1, '2026-09-01', '2026-09-15', NULL,         'emprestado'),
(5, 2, '2026-08-20', '2026-09-03', '2026-09-02', 'devolvido');

UPDATE livros SET quantidade = quantidade - 1 WHERE id = 1;
