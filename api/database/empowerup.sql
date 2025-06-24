-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 24/06/2025 às 05:43
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `empowerup`
--
CREATE DATABASE IF NOT EXISTS `empowerup` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `empowerup`;

-- --------------------------------------------------------

--
-- Estrutura para tabela `grupos`
--

CREATE TABLE `grupos` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `membros` int(11) DEFAULT 0,
  `imagem` varchar(255) DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `ultima_atividade` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `grupos`
--

INSERT INTO `grupos` (`id`, `nome`, `descricao`, `categoria`, `membros`, `imagem`, `ativo`, `ultima_atividade`, `created_at`) VALUES
(1, 'Artesãs de alma', 'Para nós divas artesãs', 'Artesanato', 0, '/placeholder.svg?height=100&width=100', 1, '2025-06-24 02:52:08', '2025-06-24 02:52:08'),
(2, 'Artesãs de alma', 'Para nós divas artesãs', 'Artesanato', 0, '/placeholder.svg?height=100&width=100', 1, '2025-06-24 02:52:08', '2025-06-24 02:52:08');

-- --------------------------------------------------------

--
-- Estrutura para tabela `posts`
--

CREATE TABLE `posts` (
  `id` int(11) NOT NULL,
  `autor` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `conteudo` text NOT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `likes` int(11) DEFAULT 0,
  `comentarios` int(11) DEFAULT 0,
  `compartilhamentos` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `posts`
--

INSERT INTO `posts` (`id`, `autor`, `username`, `avatar`, `conteudo`, `categoria`, `tags`, `likes`, `comentarios`, `compartilhamentos`, `created_at`) VALUES
(2, 'Você', '@voce', '/placeholder.svg?height=40&width=40', 'oii', 'Geral', '[]', 0, 0, 0, '2025-06-24 02:04:30'),
(3, 'Você', '@voce', '/placeholder.svg?height=40&width=40', 'ola gostaria', 'Geral', '[]', 0, 0, 0, '2025-06-24 02:14:32'),
(5, 'Você', '@voce', '/placeholder.svg?height=40&width=40', 'teste 22/06', 'Geral', '[]', 0, 0, 0, '2025-06-24 02:17:06'),
(6, 'Você', '@voce', '/placeholder.svg?height=40&width=40', 'teste (foto nn esta funcionando!) rever API', 'Geral', '[]', 0, 0, 0, '2025-06-24 02:17:27'),
(7, 'Você', '@voce', '/placeholder.svg?height=40&width=40', 'Bem-vinda à empower up!', 'Geral', '[]', 0, 0, 0, '2025-06-24 02:17:53'),
(8, 'Você', '@voce', '/placeholder.svg?height=40&width=40', 'oi', 'Geral', '[]', 0, 0, 0, '2025-06-24 02:39:19'),
(9, 'Você', '@voce', '/placeholder.svg?height=40&width=40', 'oi', 'Geral', '[]', 0, 0, 0, '2025-06-24 02:39:19'),
(10, 'Você', '@voce', '/placeholder.svg?height=40&width=40', 'oi', 'Geral', '[]', 0, 0, 0, '2025-06-24 02:39:20'),
(11, 'Você', '@voce', '/placeholder.svg?height=40&width=40', 'ola', 'Geral', '[]', 0, 0, 0, '2025-06-24 03:21:19');

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `tipo` enum('empreendedora','cliente') NOT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `nome`, `email`, `senha`, `telefone`, `bio`, `tipo`, `avatar_url`, `created_at`, `updated_at`) VALUES
(1, 'murilo', 'murisud15@gmail.com', '$2y$10$tuxfPcY/dcR1H5ybuoUi0e2mrCn4lAXfs2YAkGIavGgUTNvHZbTyS', '11930850009', 'sou aluno', 'empreendedora', NULL, '2025-06-24 03:19:32', '2025-06-24 03:19:32');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `grupos`
--
ALTER TABLE `grupos`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `grupos`
--
ALTER TABLE `grupos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
