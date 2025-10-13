-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Tempo de geração: 13/10/2025 às 19:42
-- Versão do servidor: 11.8.3-MariaDB-log
-- Versão do PHP: 7.2.34

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
CREATE DATABASE IF NOT EXISTS `empowerup` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `empowerup`;

-- --------------------------------------------------------

--
-- Estrutura para tabela `ad_campaigns`
--

CREATE TABLE `ad_campaigns` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `plan_id` int(11) DEFAULT NULL,
  `titulo` varchar(255) NOT NULL,
  `objetivo` enum('alcance','cliques','conversao','engajamento') NOT NULL DEFAULT 'alcance',
  `status` enum('rascunho','ativo','pausado','encerrado') NOT NULL DEFAULT 'rascunho',
  `data_inicio` datetime NOT NULL,
  `data_fim` datetime DEFAULT NULL,
  `orcamento_total` decimal(10,2) DEFAULT NULL,
  `orcamento_diario` decimal(10,2) DEFAULT NULL,
  `publico_alvo` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`publico_alvo`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `ad_campaigns`
--

INSERT INTO `ad_campaigns` (`id`, `user_id`, `plan_id`, `titulo`, `objetivo`, `status`, `data_inicio`, `data_fim`, `orcamento_total`, `orcamento_diario`, `publico_alvo`, `created_at`, `updated_at`) VALUES
(2, 11, 1, 'marcas novas', 'alcance', 'rascunho', '2025-09-27 10:00:00', '2025-10-02 10:00:00', 0.00, NULL, '\"moda\"', '2025-09-27 00:23:59', '2025-09-27 00:23:59'),
(3, 11, 1, 'marcas novas', 'alcance', 'rascunho', '2025-09-27 10:00:00', '2025-10-02 10:00:00', 0.00, NULL, '\"moda\"', '2025-09-27 00:24:00', '2025-09-27 00:24:00'),
(4, 11, 1, 'marcas novas', 'alcance', 'rascunho', '2025-09-27 10:00:00', '2025-10-02 10:00:00', 0.00, NULL, '\"moda\"', '2025-09-27 00:24:04', '2025-09-27 00:24:04'),
(6, 11, 1, 'marcas novas', 'alcance', 'rascunho', '2025-09-27 10:00:00', '2025-10-02 10:00:00', 0.00, NULL, '\"moda\"', '2025-09-27 00:24:06', '2025-09-27 00:24:06'),
(7, 11, 1, 'marcas novas', 'alcance', 'rascunho', '2025-09-27 10:00:00', '2025-10-02 10:00:00', 0.00, NULL, '\"moda\"', '2025-09-27 00:24:07', '2025-09-27 00:24:07'),
(9, 13, 2, 'teste', 'alcance', 'ativo', '2025-10-12 17:26:00', NULL, NULL, NULL, NULL, '2025-10-12 20:30:03', '2025-10-12 20:30:09');

-- --------------------------------------------------------

--
-- Estrutura para tabela `ad_campaign_posts`
--

CREATE TABLE `ad_campaign_posts` (
  `id` int(11) NOT NULL,
  `campaign_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `status` enum('ativo','pausado','removido') NOT NULL DEFAULT 'ativo',
  `prioridade` int(11) NOT NULL DEFAULT 0,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `ad_campaign_posts`
--

INSERT INTO `ad_campaign_posts` (`id`, `campaign_id`, `post_id`, `status`, `prioridade`, `criado_em`) VALUES
(1, 9, 39, 'ativo', 0, '2025-10-12 20:30:03');

-- --------------------------------------------------------

--
-- Estrutura para tabela `ad_metrics_daily`
--

CREATE TABLE `ad_metrics_daily` (
  `id` int(11) NOT NULL,
  `campaign_id` int(11) NOT NULL,
  `post_id` int(11) DEFAULT NULL,
  `data` date NOT NULL,
  `impressoes` int(11) NOT NULL DEFAULT 0,
  `cliques` int(11) NOT NULL DEFAULT 0,
  `engagements` int(11) NOT NULL DEFAULT 0,
  `gastos` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `conversas`
--

CREATE TABLE `conversas` (
  `id` int(11) NOT NULL,
  `tipo` enum('privada','grupo') NOT NULL,
  `criador_id` int(11) DEFAULT NULL,
  `privacidade` enum('publica','privada') NOT NULL DEFAULT 'privada',
  `nome` varchar(255) DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `imagem` varchar(255) DEFAULT NULL,
  `imagem_capa` varchar(255) DEFAULT NULL,
  `ultima_mensagem_id` int(11) DEFAULT NULL,
  `ultima_mensagem_em` datetime DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `conversas`
--

INSERT INTO `conversas` (`id`, `tipo`, `criador_id`, `privacidade`, `nome`, `descricao`, `imagem`, `imagem_capa`, `ultima_mensagem_id`, `ultima_mensagem_em`, `criado_em`) VALUES
(1, 'privada', NULL, 'privada', NULL, NULL, NULL, NULL, 77, '2025-10-08 02:34:30', '2025-09-24 21:14:32'),
(2, 'privada', NULL, 'privada', NULL, NULL, NULL, NULL, 6, '2025-09-26 19:57:17', '2025-09-26 18:07:14'),
(3, 'privada', NULL, 'privada', NULL, NULL, NULL, NULL, 11, '2025-10-05 00:08:12', '2025-09-26 18:07:34'),
(6, 'privada', 12, 'privada', NULL, NULL, NULL, NULL, 9, '2025-10-01 19:22:53', '2025-10-01 22:22:43'),
(7, 'privada', 11, 'privada', NULL, NULL, NULL, NULL, 10, '2025-10-01 21:56:06', '2025-10-02 00:55:55'),
(8, 'privada', 13, 'privada', NULL, NULL, NULL, NULL, 13, '2025-10-05 06:21:11', '2025-10-05 06:17:37'),
(9, 'privada', 11, 'privada', NULL, NULL, NULL, NULL, 76, '2025-10-08 02:34:29', '2025-10-05 12:57:21'),
(10, 'privada', 11, 'privada', NULL, NULL, NULL, NULL, 15, '2025-10-05 12:57:42', '2025-10-05 12:57:35'),
(11, 'privada', 13, 'privada', NULL, NULL, NULL, NULL, 18, '2025-10-05 17:34:29', '2025-10-05 17:34:13'),
(12, 'privada', 21, 'privada', NULL, NULL, NULL, NULL, 24, '2025-10-07 15:24:33', '2025-10-06 15:09:55'),
(13, 'privada', 24, 'privada', NULL, NULL, NULL, NULL, 23, '2025-10-07 15:22:08', '2025-10-07 15:22:04'),
(14, 'privada', 24, 'privada', NULL, NULL, NULL, NULL, 25, '2025-10-07 15:35:08', '2025-10-07 15:35:06'),
(15, 'privada', 24, 'privada', NULL, NULL, NULL, NULL, 34, '2025-10-07 15:37:01', '2025-10-07 15:35:24'),
(16, 'privada', 23, 'privada', NULL, NULL, NULL, NULL, 36, '2025-10-07 22:31:39', '2025-10-07 15:35:39'),
(17, 'privada', 23, 'privada', NULL, NULL, NULL, NULL, 30, '2025-10-07 15:35:56', '2025-10-07 15:35:51'),
(18, 'privada', 21, 'privada', NULL, NULL, NULL, NULL, NULL, '2025-10-07 15:46:26', '2025-10-07 15:46:26'),
(19, 'privada', 21, 'privada', NULL, NULL, NULL, NULL, NULL, '2025-10-07 15:46:28', '2025-10-07 15:46:28'),
(20, 'privada', 22, 'privada', NULL, NULL, NULL, NULL, 74, '2025-10-08 00:35:33', '2025-10-08 00:05:58'),
(21, 'privada', 11, 'privada', NULL, NULL, NULL, NULL, 75, '2025-10-08 02:27:37', '2025-10-08 02:27:33'),
(22, 'privada', 1, 'privada', NULL, NULL, NULL, NULL, 78, '2025-10-08 03:07:43', '2025-10-08 03:07:39'),
(23, 'privada', 13, 'privada', NULL, NULL, NULL, NULL, 86, '2025-10-13 14:58:19', '2025-10-13 14:49:22'),
(24, 'privada', 13, 'privada', NULL, NULL, NULL, NULL, 85, '2025-10-13 14:58:03', '2025-10-13 14:57:36');

-- --------------------------------------------------------

--
-- Estrutura para tabela `conversa_convites`
--

CREATE TABLE `conversa_convites` (
  `id` int(11) NOT NULL,
  `conversa_id` int(11) NOT NULL,
  `remetente_id` int(11) NOT NULL,
  `convidado_id` int(11) NOT NULL,
  `status` enum('pendente','aceito','recusado','expirado') NOT NULL DEFAULT 'pendente',
  `token` varchar(255) NOT NULL,
  `expira_em` datetime DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `aceito_em` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `conversa_mensagens_fixadas`
--

CREATE TABLE `conversa_mensagens_fixadas` (
  `id` int(11) NOT NULL,
  `conversa_id` int(11) NOT NULL,
  `mensagem_id` int(11) NOT NULL,
  `fixado_por` int(11) NOT NULL,
  `fixado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `conversa_participantes`
--

CREATE TABLE `conversa_participantes` (
  `id` int(11) NOT NULL,
  `conversa_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `papel` enum('owner','admin','member') NOT NULL DEFAULT 'member',
  `status` enum('ativo','bloqueado') DEFAULT 'ativo',
  `ultimo_visto_em` datetime DEFAULT NULL,
  `silenciado` tinyint(1) NOT NULL DEFAULT 0,
  `favorito` tinyint(1) NOT NULL DEFAULT 0,
  `joined_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `conversa_participantes`
--

INSERT INTO `conversa_participantes` (`id`, `conversa_id`, `usuario_id`, `papel`, `status`, `ultimo_visto_em`, `silenciado`, `favorito`, `joined_at`) VALUES
(1, 1, 1, 'member', 'ativo', '2025-10-08 02:34:30', 0, 0, NULL),
(2, 1, 4, 'member', 'ativo', NULL, 0, 0, NULL),
(3, 2, 10, 'member', 'ativo', '2025-09-26 19:57:17', 0, 0, NULL),
(4, 2, 9, 'member', 'ativo', NULL, 0, 0, NULL),
(5, 3, 10, 'member', 'ativo', '2025-10-04 18:36:21', 0, 0, NULL),
(6, 3, 11, 'member', 'ativo', '2025-10-05 00:08:12', 0, 0, NULL),
(7, 6, 12, 'member', 'ativo', '2025-10-01 19:22:54', 0, 0, '2025-10-01 19:22:43'),
(8, 6, 10, 'member', 'ativo', NULL, 0, 0, '2025-10-01 19:22:43'),
(9, 7, 11, 'member', 'ativo', '2025-10-01 21:56:06', 0, 0, '2025-10-01 21:55:55'),
(10, 7, 9, 'member', 'ativo', NULL, 0, 0, '2025-10-01 21:55:55'),
(11, 8, 13, 'member', 'ativo', '2025-10-05 06:23:46', 0, 0, '2025-10-05 06:17:37'),
(12, 8, 11, 'member', 'ativo', '2025-10-05 06:21:11', 0, 0, '2025-10-05 06:17:37'),
(13, 9, 11, 'member', 'ativo', '2025-10-05 12:57:28', 0, 0, '2025-10-05 12:57:21'),
(14, 9, 15, 'member', 'ativo', '2025-10-08 02:34:29', 0, 0, '2025-10-05 12:57:21'),
(15, 10, 11, 'member', 'ativo', '2025-10-05 12:57:42', 0, 0, '2025-10-05 12:57:35'),
(16, 10, 18, 'member', 'ativo', NULL, 0, 0, '2025-10-05 12:57:35'),
(17, 11, 13, 'member', 'ativo', '2025-10-05 17:34:29', 0, 0, '2025-10-05 17:34:13'),
(18, 11, 18, 'member', 'ativo', NULL, 0, 0, '2025-10-05 17:34:13'),
(19, 12, 21, 'member', 'ativo', '2025-10-07 22:14:05', 0, 0, '2025-10-06 15:09:55'),
(20, 12, 11, 'member', 'ativo', '2025-10-08 02:27:25', 0, 0, '2025-10-06 15:09:55'),
(21, 13, 24, 'member', 'ativo', '2025-10-07 15:22:08', 0, 0, '2025-10-07 15:22:04'),
(22, 13, 10, 'member', 'ativo', NULL, 0, 0, '2025-10-07 15:22:04'),
(23, 14, 24, 'member', 'ativo', '2025-10-07 15:36:50', 0, 0, '2025-10-07 15:35:06'),
(24, 14, 17, 'member', 'ativo', NULL, 0, 0, '2025-10-07 15:35:06'),
(25, 15, 24, 'member', 'ativo', '2025-10-07 15:37:06', 0, 0, '2025-10-07 15:35:24'),
(26, 15, 23, 'member', 'ativo', '2025-10-07 15:37:21', 0, 0, '2025-10-07 15:35:24'),
(27, 16, 23, 'member', 'ativo', '2025-10-07 22:31:39', 0, 0, '2025-10-07 15:35:39'),
(28, 16, 21, 'member', 'ativo', '2025-10-08 10:35:23', 0, 0, '2025-10-07 15:35:39'),
(29, 17, 23, 'member', 'ativo', '2025-10-07 15:37:10', 0, 0, '2025-10-07 15:35:51'),
(30, 17, 17, 'member', 'ativo', NULL, 0, 0, '2025-10-07 15:35:51'),
(31, 18, 21, 'member', 'ativo', '2025-10-07 22:14:12', 0, 0, '2025-10-07 15:46:26'),
(32, 18, 24, 'member', 'ativo', NULL, 0, 0, '2025-10-07 15:46:26'),
(33, 19, 21, 'member', 'ativo', '2025-10-07 15:46:28', 0, 0, '2025-10-07 15:46:28'),
(34, 19, 17, 'member', 'ativo', NULL, 0, 0, '2025-10-07 15:46:28'),
(35, 20, 22, 'member', 'ativo', '2025-10-13 14:58:33', 0, 0, '2025-10-08 00:05:58'),
(36, 20, 25, 'member', 'ativo', '2025-10-08 00:57:53', 0, 0, '2025-10-08 00:05:58'),
(37, 21, 11, 'member', 'ativo', '2025-10-08 02:27:37', 0, 0, '2025-10-08 02:27:33'),
(38, 21, 23, 'member', 'ativo', NULL, 0, 0, '2025-10-08 02:27:33'),
(39, 22, 1, 'member', 'ativo', '2025-10-08 03:07:43', 0, 0, '2025-10-08 03:07:39'),
(40, 22, 24, 'member', 'ativo', NULL, 0, 0, '2025-10-08 03:07:39'),
(41, 23, 13, 'member', 'ativo', '2025-10-13 14:58:19', 0, 0, '2025-10-13 14:49:22'),
(42, 23, 1, 'member', 'ativo', NULL, 0, 0, '2025-10-13 14:49:22'),
(43, 24, 13, 'member', 'ativo', '2025-10-13 14:58:20', 0, 0, '2025-10-13 14:57:36'),
(44, 24, 22, 'member', 'ativo', '2025-10-13 14:58:35', 0, 0, '2025-10-13 14:57:36');

-- --------------------------------------------------------

--
-- Estrutura para tabela `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `slug` varchar(200) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `nivel` enum('iniciante','intermediario','avancado') NOT NULL DEFAULT 'iniciante',
  `duracao_estimado` int(11) DEFAULT NULL,
  `imagem_capa` varchar(500) DEFAULT NULL,
  `trailer_url` varchar(500) DEFAULT NULL,
  `destaque` tinyint(1) NOT NULL DEFAULT 0,
  `publicado` tinyint(1) NOT NULL DEFAULT 0,
  `criado_por` int(11) DEFAULT NULL,
  `publicado_em` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `courses`
--

INSERT INTO `courses` (`id`, `categoria_id`, `slug`, `titulo`, `descricao`, `nivel`, `duracao_estimado`, `imagem_capa`, `trailer_url`, `destaque`, `publicado`, `criado_por`, `publicado_em`, `created_at`, `updated_at`) VALUES
(1, 1, 'trilha-inicio-negocios', 'Trilha: Comece Seu Negócio do Zero', 'Um passo a passo prático inspirado em conteúdos do Sebrae para tirar sua ideia do papel.', 'iniciante', 180, 'https://img.youtube.com/vi/zP6x9hXDs2c/maxresdefault.jpg', NULL, 1, 1, NULL, NULL, '2025-09-26 20:33:42', '2025-09-26 20:33:42'),
(2, 2, 'marketing-digital-para-empreendedoras', 'Marketing Digital para Empreendedoras', 'Aprenda a criar presença digital e vender mais nas redes sociais.', 'intermediario', 210, 'https://img.youtube.com/vi/vBzBa7Ykg8k/maxresdefault.jpg', NULL, 1, 1, NULL, NULL, '2025-09-26 20:33:43', '2025-09-26 20:33:43'),
(3, 4, 'introducao-ao-empreendedorismo', 'Introdução ao Empreendedorismo Feminino', 'Construa uma base sólida para tirar sua ideia do papel com ferramentas práticas, exemplos reais e materiais exclusivos pensados para mulheres empreendedoras.', 'iniciante', 150, NULL, NULL, 1, 1, NULL, '2025-10-12 21:28:53', '2025-10-12 21:28:53', '2025-10-12 21:28:53');

-- --------------------------------------------------------

--
-- Estrutura para tabela `course_categories`
--

CREATE TABLE `course_categories` (
  `id` int(11) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `cor` varchar(9) DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `course_categories`
--

INSERT INTO `course_categories` (`id`, `slug`, `nome`, `descricao`, `cor`, `icon`, `ativo`, `created_at`) VALUES
(1, 'empreendedorismo', 'Empreendedorismo', 'Fundamentos para iniciar e escalar negócios', NULL, NULL, 1, '2025-09-26 20:33:42'),
(2, 'marketing-digital', 'Marketing Digital', 'Aprenda a divulgar e posicionar seu negócio online', NULL, NULL, 1, '2025-09-26 20:33:42'),
(3, 'financas', 'Finanças', 'Organização financeira e precificação para empreendedoras', NULL, NULL, 1, '2025-09-26 20:33:42'),
(4, 'fundamentos-empreendedorismo', 'Fundamentos do Empreendedorismo', 'Trilhas para começar seu negócio com confiança.', NULL, NULL, 1, '2025-10-12 21:28:53');

-- --------------------------------------------------------

--
-- Estrutura para tabela `course_enrollments`
--

CREATE TABLE `course_enrollments` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `subscription_id` int(11) DEFAULT NULL,
  `status` enum('ativo','concluido','pendente','cancelado') NOT NULL DEFAULT 'ativo',
  `progresso` decimal(5,2) NOT NULL DEFAULT 0.00,
  `iniciado_em` datetime NOT NULL DEFAULT current_timestamp(),
  `concluido_em` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `course_lessons`
--

CREATE TABLE `course_lessons` (
  `id` int(11) NOT NULL,
  `module_id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `conteudo_url` varchar(500) DEFAULT NULL,
  `duracao_min` int(11) DEFAULT NULL,
  `ordem` int(11) NOT NULL DEFAULT 0,
  `tipo` enum('video','artigo','recurso') NOT NULL DEFAULT 'video',
  `recurso_extra` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`recurso_extra`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `course_lessons`
--

INSERT INTO `course_lessons` (`id`, `module_id`, `titulo`, `descricao`, `conteudo_url`, `duracao_min`, `ordem`, `tipo`, `recurso_extra`, `created_at`) VALUES
(1, 1, 'Como validar sua ideia de negócio', NULL, 'https://www.youtube.com/watch?v=zP6x9hXDs2c', 24, 1, 'video', NULL, '2025-09-26 20:33:42'),
(2, 1, 'Definindo seu público-alvo', NULL, 'https://www.youtube.com/watch?v=OVwOB1p5MNk', 18, 2, 'video', NULL, '2025-09-26 20:33:43'),
(3, 2, 'Canvas para empreendedoras', NULL, 'https://www.youtube.com/watch?v=gGnZk90un0w', 28, 1, 'video', NULL, '2025-09-26 20:33:43'),
(4, 2, 'Como precificar seus produtos', NULL, 'https://www.youtube.com/watch?v=uks0YqSuk-g', 22, 2, 'video', NULL, '2025-09-26 20:33:43'),
(5, 3, 'Estratégias de redes sociais', NULL, 'https://www.youtube.com/watch?v=vBzBa7Ykg8k', 35, 1, 'video', NULL, '2025-09-26 20:33:43'),
(6, 3, 'Conteúdo que engaja', NULL, 'https://www.youtube.com/watch?v=mZPtE2Qua7o', 26, 2, 'video', NULL, '2025-09-26 20:33:43'),
(7, 4, 'Como transformar seguidores em clientes', NULL, 'https://www.youtube.com/watch?v=Fknc0aF4P-8', 31, 1, 'video', NULL, '2025-09-26 20:33:44'),
(8, 4, 'CRM para pequenas empreendedoras', NULL, 'https://www.youtube.com/watch?v=DaIW3N3KX9w', 28, 2, 'video', NULL, '2025-09-26 20:33:44'),
(9, 5, 'Bem-vinda à jornada empreendedora', NULL, NULL, 12, 1, 'video', '{\"youtube_embed\": \"\"}', '2025-10-12 21:28:53'),
(10, 5, 'Como lidar com medos e inseguranças', NULL, NULL, 18, 2, 'video', '{\"youtube_embed\": \"\"}', '2025-10-12 21:28:53'),
(11, 5, 'Organizando sua rotina para empreender', NULL, NULL, 20, 3, 'video', '{\"youtube_embed\": \"\"}', '2025-10-12 21:28:53'),
(12, 6, 'Identificando oportunidades no seu contexto', NULL, NULL, 22, 1, 'video', '{\"youtube_embed\": \"\"}', '2025-10-12 21:28:53'),
(13, 6, 'Proposta de valor para clientes reais', NULL, NULL, 20, 2, 'video', '{\"youtube_embed\": \"\"}', '2025-10-12 21:28:53'),
(14, 6, 'Primeiros passos no plano financeiro', NULL, NULL, 24, 3, 'video', '{\"youtube_embed\": \"\"}', '2025-10-12 21:28:53'),
(15, 7, 'Checklist para validar sua ideia', NULL, NULL, 18, 1, 'video', '{\"youtube_embed\": \"\"}', '2025-10-12 21:28:53'),
(16, 7, 'Construindo seu MVP com poucos recursos', NULL, NULL, 21, 2, 'video', '{\"youtube_embed\": \"\"}', '2025-10-12 21:28:53'),
(17, 7, 'Preparando-se para os primeiros clientes', NULL, NULL, 15, 3, 'video', '{\"youtube_embed\": \"\"}', '2025-10-12 21:28:53');

-- --------------------------------------------------------

--
-- Estrutura para tabela `course_modules`
--

CREATE TABLE `course_modules` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `ordem` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `course_modules`
--

INSERT INTO `course_modules` (`id`, `course_id`, `titulo`, `descricao`, `ordem`, `created_at`) VALUES
(1, 1, 'Validação da Ideia', 'Confirme se o seu negócio resolve um problema real.', 1, '2025-09-26 20:33:42'),
(2, 1, 'Modelo de Negócio', 'Estruture a proposta de valor e o funcionamento da sua empresa.', 2, '2025-09-26 20:33:43'),
(3, 2, 'Fundamentos do Marketing Digital', NULL, 1, '2025-09-26 20:33:43'),
(4, 2, 'Vendas e Relacionamento', NULL, 2, '2025-09-26 20:33:43'),
(5, 3, 'Mentalidade Empreendedora', 'Descubra o que muda quando você assume o papel de empreendedora.', 1, '2025-10-12 21:28:53'),
(6, 3, 'Da Ideia ao Modelo de Negócio', 'Transforme sua ideia em uma proposta de valor clara e sustentável.', 2, '2025-10-12 21:28:53'),
(7, 3, 'Colocando em Prática', 'Defina metas, valide com o mercado e crie sua primeira oferta.', 3, '2025-10-12 21:28:53');

-- --------------------------------------------------------

--
-- Estrutura para tabela `course_progress`
--

CREATE TABLE `course_progress` (
  `id` int(11) NOT NULL,
  `enrollment_id` int(11) NOT NULL,
  `lesson_id` int(11) NOT NULL,
  `assistido` tinyint(1) NOT NULL DEFAULT 0,
  `assistido_em` datetime DEFAULT NULL,
  `nota` int(11) DEFAULT NULL,
  `feedback` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `course_resources`
--

CREATE TABLE `course_resources` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `tipo` enum('pdf','link','modelo','checklist','outro') NOT NULL DEFAULT 'link',
  `url` varchar(500) NOT NULL,
  `descricao` text DEFAULT NULL,
  `ordem` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `course_resources`
--

INSERT INTO `course_resources` (`id`, `course_id`, `titulo`, `tipo`, `url`, `descricao`, `ordem`, `created_at`) VALUES
(1, 3, 'Canvas para o seu negócio', 'modelo', '', 'Modelo editável para estruturar seu plano.', 1, '2025-10-12 21:28:53'),
(2, 3, 'Checklist primeiros 30 dias', 'checklist', '', 'Ações rápidas para ganhar tração.', 2, '2025-10-12 21:28:53');

-- --------------------------------------------------------

--
-- Estrutura para tabela `course_reviews`
--

CREATE TABLE `course_reviews` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `comentario` text DEFAULT NULL,
  `destacado` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `denuncias`
--

CREATE TABLE `denuncias` (
  `id` int(11) NOT NULL,
  `denunciante_id` int(11) NOT NULL,
  `denunciado_id` int(11) NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `eventos`
--

CREATE TABLE `eventos` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `tipo` enum('workshop','palestra','curso','meetup','networking') NOT NULL,
  `data_evento` datetime NOT NULL,
  `data_fim` datetime DEFAULT NULL,
  `local` varchar(255) DEFAULT NULL,
  `endereco` text DEFAULT NULL,
  `capacidade_maxima` int(11) DEFAULT 50,
  `valor` decimal(10,2) DEFAULT 0.00,
  `eh_gratuito` tinyint(1) DEFAULT 1,
  `instrutor_nome` varchar(255) DEFAULT NULL,
  `instrutor_bio` text DEFAULT NULL,
  `instrutor_foto` varchar(255) DEFAULT NULL,
  `requisitos` text DEFAULT NULL,
  `material_necessario` text DEFAULT NULL,
  `certificado` tinyint(1) DEFAULT 0,
  `status` enum('ativo','cancelado','finalizado') DEFAULT 'ativo',
  `imagem_url` varchar(500) DEFAULT NULL,
  `link_online` varchar(500) DEFAULT NULL,
  `eh_online` tinyint(1) DEFAULT 0,
  `criado_por` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `eventos`
--

INSERT INTO `eventos` (`id`, `titulo`, `descricao`, `tipo`, `data_evento`, `data_fim`, `local`, `endereco`, `capacidade_maxima`, `valor`, `eh_gratuito`, `instrutor_nome`, `instrutor_bio`, `instrutor_foto`, `requisitos`, `material_necessario`, `certificado`, `status`, `imagem_url`, `link_online`, `eh_online`, `criado_por`, `created_at`, `updated_at`) VALUES
(2, 'Palestra', 'Alem do olhar', 'palestra', '2025-10-09 10:00:00', NULL, 'online', 'Online', 250, 0.00, 1, 'Marise', 'Diva', '', 'gjjfjfj', 'lujlouhliu', 1, 'ativo', '', '', 1, 1, '2025-10-02 01:18:14', '2025-10-02 01:18:14'),
(4, 'Workshop de Artesanato', 'Seja bem-vinda!', 'workshop', '2025-10-25 10:00:00', '2025-10-25 16:00:00', 'Etec Prof. Maria Cristina Medeiros', 'Rua Bélgica, 88 - Colônia, Ribeirão Pires SP', 100, 0.00, 1, 'Além do Olhar', 'Projeto de Recursos Humanos', '', 'Força de vontade!', 'Papel e caneta', 0, 'ativo', '', '', 0, 1, '2025-10-13 15:16:53', '2025-10-13 15:16:53');

-- --------------------------------------------------------

--
-- Estrutura para tabela `evento_categorias`
--

CREATE TABLE `evento_categorias` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `descricao` text DEFAULT NULL,
  `cor` varchar(7) DEFAULT '#2563eb',
  `icone` varchar(50) DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `evento_categorias`
--

INSERT INTO `evento_categorias` (`id`, `nome`, `descricao`, `cor`, `icone`, `ativo`, `created_at`) VALUES
(1, 'Empreendedorismo', 'Eventos sobre empreendedorismo e negócios', '#2563eb', 'briefcase', 1, '2025-09-09 04:07:53'),
(2, 'Tecnologia', 'Workshops e palestras sobre tecnologia', '#7c3aed', 'laptop', 1, '2025-09-09 04:07:53'),
(3, 'Marketing', 'Estratégias de marketing e vendas', '#dc2626', 'megaphone', 1, '2025-09-09 04:07:53'),
(4, 'Finanças', 'Educação financeira e investimentos', '#059669', 'dollar-sign', 1, '2025-09-09 04:07:53'),
(5, 'Desenvolvimento Pessoal', 'Crescimento pessoal e profissional', '#ea580c', 'user', 1, '2025-09-09 04:07:53'),
(6, 'Networking', 'Eventos para conexões e networking', '#0891b2', 'users', 1, '2025-09-09 04:07:53');

-- --------------------------------------------------------

--
-- Estrutura para tabela `evento_inscricoes`
--

CREATE TABLE `evento_inscricoes` (
  `id` int(11) NOT NULL,
  `evento_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `nome_completo` varchar(255) NOT NULL,
  `telefone` varchar(20) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `observacoes` text DEFAULT NULL,
  `status` enum('confirmada','lista_espera','cancelada') DEFAULT 'confirmada',
  `data_inscricao` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_presenca` timestamp NULL DEFAULT NULL,
  `compareceu` tinyint(1) DEFAULT 0,
  `avaliacao` int(11) DEFAULT NULL CHECK (`avaliacao` >= 1 and `avaliacao` <= 5),
  `feedback` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `evento_inscricoes`
--

INSERT INTO `evento_inscricoes` (`id`, `evento_id`, `user_id`, `nome_completo`, `telefone`, `email`, `observacoes`, `status`, `data_inscricao`, `data_presenca`, `compareceu`, `avaliacao`, `feedback`, `created_at`, `updated_at`) VALUES
(1, 2, 24, 'Aline Dantas de Lima', '11953044381', 'alinedantasdl@gmail.com', '', 'confirmada', '2025-10-07 15:11:17', NULL, 0, NULL, NULL, '2025-10-07 15:11:17', '2025-10-07 15:11:17'),
(2, 2, 25, 'Roberta Fonseca', '11997237935', 'ipbolado70@gmail.com', 'Sou deficiente auditiva, precisa de tradutor de linguagem de sinais.', 'confirmada', '2025-10-07 23:59:09', NULL, 0, NULL, NULL, '2025-10-07 23:59:09', '2025-10-07 23:59:09'),
(3, 2, 11, 'Taylor', '11987562560', 'murilo.silva388@etec.sp.gov.br', '', 'confirmada', '2025-10-08 02:29:54', NULL, 0, NULL, NULL, '2025-10-08 02:29:54', '2025-10-08 02:29:54'),
(4, 2, 15, 'Mariana Nascimento', '11994614611', 'mariaans.lobo@gmail.com', '', 'confirmada', '2025-10-08 02:35:56', NULL, 0, NULL, NULL, '2025-10-08 02:35:56', '2025-10-08 02:35:56'),
(5, 2, 1, 'murilo', '11930850009', 'murisud15@gmail.com', '', 'confirmada', '2025-10-08 11:02:06', NULL, 0, NULL, NULL, '2025-10-08 11:02:06', '2025-10-08 11:02:06');

-- --------------------------------------------------------

--
-- Estrutura para tabela `grupos`
--

CREATE TABLE `grupos` (
  `id` int(11) NOT NULL,
  `criador_id` int(11) DEFAULT NULL,
  `nome` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `regras` text DEFAULT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `tags` text DEFAULT NULL,
  `privacidade` enum('publico','privado','somente_convidados') NOT NULL DEFAULT 'publico',
  `moderacao_nivel` enum('aberto','moderado','restrito') NOT NULL DEFAULT 'moderado',
  `membros` int(11) DEFAULT 0,
  `imagem` varchar(255) DEFAULT NULL,
  `imagem_capa` varchar(255) DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `ultima_atividade` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `grupos`
--

INSERT INTO `grupos` (`id`, `criador_id`, `nome`, `slug`, `descricao`, `regras`, `categoria`, `tags`, `privacidade`, `moderacao_nivel`, `membros`, `imagem`, `imagem_capa`, `ativo`, `ultima_atividade`, `created_at`) VALUES
(1, NULL, 'Artesãs de alma', NULL, 'Para nós divas artesãs', NULL, 'Artesanato', NULL, 'publico', 'moderado', 0, '/placeholder.svg?height=100&width=100', NULL, 1, '2025-06-24 02:52:08', '2025-06-24 02:52:08'),
(2, NULL, 'Artesãs de alma', NULL, 'Para nós divas artesãs', NULL, 'Artesanato', NULL, 'publico', 'moderado', 0, '/placeholder.svg?height=100&width=100', NULL, 1, '2025-06-24 02:52:08', '2025-06-24 02:52:08'),
(3, 13, 'Teste', 'teste', 'Teste de cadastro', '', 'Moda', '[\"#sustentabilidade\"]', 'publico', 'aberto', 1, '/placeholder.svg?height=100&amp;amp;width=100', '', 1, '2025-10-13 14:52:23', '2025-10-13 14:51:23');

-- --------------------------------------------------------

--
-- Estrutura para tabela `grupo_convites`
--

CREATE TABLE `grupo_convites` (
  `id` int(11) NOT NULL,
  `grupo_id` int(11) NOT NULL,
  `convidante_id` int(11) NOT NULL,
  `convidado_id` int(11) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `token` varchar(255) NOT NULL,
  `status` enum('pendente','aceito','expirado','revogado','recusado') NOT NULL DEFAULT 'pendente',
  `expira_em` datetime DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `respondido_em` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `grupo_membros`
--

CREATE TABLE `grupo_membros` (
  `id` int(11) NOT NULL,
  `grupo_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `papel` enum('owner','moderador','membro') NOT NULL DEFAULT 'membro',
  `status` enum('ativo','pendente','banido','recusado') NOT NULL DEFAULT 'pendente',
  `joined_at` timestamp NULL DEFAULT NULL,
  `last_seen_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `grupo_membros`
--

INSERT INTO `grupo_membros` (`id`, `grupo_id`, `usuario_id`, `papel`, `status`, `joined_at`, `last_seen_at`, `created_at`) VALUES
(1, 3, 13, 'owner', 'ativo', '2025-10-13 14:51:23', '2025-10-13 14:51:23', '2025-10-13 14:51:23');

-- --------------------------------------------------------

--
-- Estrutura para tabela `grupo_posts`
--

CREATE TABLE `grupo_posts` (
  `id` int(11) NOT NULL,
  `grupo_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `grupo_solicitacoes`
--

CREATE TABLE `grupo_solicitacoes` (
  `id` int(11) NOT NULL,
  `grupo_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `mensagem` text DEFAULT NULL,
  `status` enum('pendente','aprovado','rejeitado') NOT NULL DEFAULT 'pendente',
  `analisado_por` int(11) DEFAULT NULL,
  `analisado_em` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `grupo_topicos`
--

CREATE TABLE `grupo_topicos` (
  `id` int(11) NOT NULL,
  `grupo_id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `slug` varchar(255) NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `mensagem_reacoes`
--

CREATE TABLE `mensagem_reacoes` (
  `id` int(11) NOT NULL,
  `mensagem_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `reacao` varchar(32) NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `mensagens`
--

CREATE TABLE `mensagens` (
  `id` int(11) NOT NULL,
  `conversa_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `conteudo` text DEFAULT NULL,
  `tipo` enum('texto','arquivo','sistema') NOT NULL DEFAULT 'texto',
  `metadata` longtext DEFAULT NULL,
  `reply_to_id` int(11) DEFAULT NULL,
  `anexo` varchar(255) DEFAULT NULL,
  `lida` tinyint(1) DEFAULT 0,
  `enviada_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `lida_em` datetime DEFAULT NULL,
  `recebida_em` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `mensagens`
--

INSERT INTO `mensagens` (`id`, `conversa_id`, `usuario_id`, `conteudo`, `tipo`, `metadata`, `reply_to_id`, `anexo`, `lida`, `enviada_em`, `lida_em`, `recebida_em`) VALUES
(1, 1, 1, 'Olá! Esta é uma mensagem de teste.', 'texto', NULL, NULL, NULL, 0, '2025-09-24 21:15:29', NULL, NULL),
(2, 1, 4, 'Oi! Tudo bem?', 'texto', NULL, NULL, NULL, 1, '2025-09-24 21:15:29', '2025-10-08 02:34:26', '2025-10-08 02:34:26'),
(3, 2, 10, 'oie!', 'texto', NULL, NULL, NULL, 0, '2025-09-26 18:07:19', NULL, NULL),
(4, 3, 10, 'Olá Taylor!', 'texto', NULL, NULL, NULL, 1, '2025-09-26 18:07:47', '2025-10-05 00:08:04', '2025-10-05 00:08:04'),
(5, 3, 11, 'oieee', 'texto', NULL, NULL, NULL, 0, '2025-09-26 19:31:39', NULL, NULL),
(6, 2, 10, 'jujjnmyhnhynm', 'texto', NULL, NULL, NULL, 0, '2025-09-26 22:57:17', NULL, NULL),
(7, 3, 11, 'gente wu amo', 'texto', NULL, NULL, NULL, 0, '2025-10-01 19:52:40', NULL, NULL),
(8, 3, 10, 'oiii migaaaa', 'texto', NULL, NULL, NULL, 1, '2025-10-01 20:55:55', '2025-10-05 00:08:04', '2025-10-05 00:08:04'),
(9, 6, 12, 'oi amiga', 'texto', NULL, NULL, NULL, 0, '2025-10-01 22:22:53', NULL, NULL),
(10, 7, 11, 'hii', 'texto', NULL, NULL, NULL, 0, '2025-10-02 00:56:06', NULL, NULL),
(11, 3, 11, 'ta bem??', 'texto', NULL, NULL, NULL, 0, '2025-10-05 03:08:11', NULL, NULL),
(12, 8, 13, 'Olá! Tudo bem?', 'texto', NULL, NULL, NULL, 1, '2025-10-05 06:17:51', '2025-10-05 06:21:07', '2025-10-05 06:21:07'),
(13, 8, 11, 'Oiee! Sim', 'texto', NULL, NULL, NULL, 1, '2025-10-05 06:21:11', '2025-10-05 06:23:46', '2025-10-05 06:23:46'),
(14, 9, 11, 'testing the chat', 'texto', NULL, NULL, NULL, 1, '2025-10-05 12:57:28', '2025-10-08 02:34:23', '2025-10-08 02:34:23'),
(15, 10, 11, 'testando o chat', 'texto', NULL, NULL, NULL, 0, '2025-10-05 12:57:42', NULL, NULL),
(16, 11, 13, 'oi more', 'texto', NULL, NULL, NULL, 0, '2025-10-05 17:34:24', NULL, NULL),
(17, 11, 13, 'oi more', 'texto', NULL, NULL, NULL, 0, '2025-10-05 17:34:24', NULL, NULL),
(18, 11, 13, 'ops', 'texto', NULL, NULL, NULL, 0, '2025-10-05 17:34:29', NULL, NULL),
(19, 12, 21, 'oi amigaaa', 'texto', NULL, NULL, NULL, 1, '2025-10-06 15:10:01', '2025-10-06 15:10:51', '2025-10-06 15:10:51'),
(20, 12, 11, 'hey bbr', 'texto', NULL, NULL, NULL, 1, '2025-10-06 15:10:58', '2025-10-06 15:11:59', '2025-10-06 15:11:59'),
(21, 12, 21, 'tudo bom bb????', 'texto', NULL, NULL, NULL, 1, '2025-10-06 15:13:53', '2025-10-07 15:08:20', '2025-10-07 15:08:20'),
(22, 12, 11, 'nao bb', 'texto', NULL, NULL, NULL, 1, '2025-10-07 15:08:24', '2025-10-07 15:24:28', '2025-10-07 15:24:28'),
(23, 13, 24, 'oii miga', 'texto', NULL, NULL, NULL, 0, '2025-10-07 15:22:08', NULL, NULL),
(24, 12, 21, 'afffff', 'texto', NULL, NULL, NULL, 1, '2025-10-07 15:24:33', '2025-10-08 02:27:25', '2025-10-08 02:27:25'),
(25, 14, 24, 'oii', 'texto', NULL, NULL, NULL, 0, '2025-10-07 15:35:08', NULL, NULL),
(26, 15, 24, 'nossa', 'texto', NULL, NULL, NULL, 1, '2025-10-07 15:35:28', '2025-10-07 15:35:39', '2025-10-07 15:35:39'),
(27, 15, 24, 'essa ryllary eh uma chata ne', 'texto', NULL, NULL, NULL, 1, '2025-10-07 15:35:34', '2025-10-07 15:35:39', '2025-10-07 15:35:39'),
(28, 16, 23, 'oiii', 'texto', NULL, NULL, NULL, 1, '2025-10-07 15:35:42', '2025-10-07 15:37:59', '2025-10-07 15:37:59'),
(29, 15, 23, 'pse...', 'texto', NULL, NULL, NULL, 1, '2025-10-07 15:35:48', '2025-10-07 15:35:56', '2025-10-07 15:35:56'),
(30, 17, 23, 'oi amgggg', 'texto', NULL, NULL, NULL, 0, '2025-10-07 15:35:56', NULL, NULL),
(31, 15, 24, 'aff a msg n atualiza sozinhaaa', 'texto', NULL, NULL, NULL, 1, '2025-10-07 15:36:07', '2025-10-07 15:36:17', '2025-10-07 15:36:17'),
(32, 15, 23, 'só atualiza se sai da conversa affffff', 'texto', NULL, NULL, NULL, 1, '2025-10-07 15:36:35', '2025-10-07 15:36:38', '2025-10-07 15:36:38'),
(33, 15, 24, 'pesou', 'texto', NULL, NULL, NULL, 1, '2025-10-07 15:36:44', '2025-10-07 15:36:52', '2025-10-07 15:36:52'),
(34, 15, 23, 'TwT', 'texto', NULL, NULL, NULL, 1, '2025-10-07 15:37:01', '2025-10-07 15:37:06', '2025-10-07 15:37:06'),
(35, 16, 21, 'oi amg, tudo bem???', 'texto', NULL, NULL, NULL, 1, '2025-10-07 15:38:13', '2025-10-07 22:31:35', '2025-10-07 22:31:35'),
(36, 16, 23, 'tudo mal amg', 'texto', NULL, NULL, NULL, 1, '2025-10-07 22:31:39', '2025-10-08 10:35:23', '2025-10-08 10:35:23'),
(37, 20, 22, 'kpop...', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:09:07', '2025-10-08 00:18:21', '2025-10-08 00:18:21'),
(38, 20, 25, 'Rexpeita', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:18:35', '2025-10-08 00:18:44', '2025-10-08 00:18:44'),
(39, 20, 22, 'eu não', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:18:48', '2025-10-08 00:18:58', '2025-10-08 00:18:58'),
(40, 20, 25, 'Cadê mandar foto no chat, queremos memes', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:18:56', '2025-10-08 00:19:01', '2025-10-08 00:19:01'),
(41, 20, 22, 'a mensagem ta marcando o horário errado...', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:18:59', '2025-10-08 00:19:13', '2025-10-08 00:19:13'),
(42, 20, 22, 'ninguém quer meme não', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:19:10', '2025-10-08 00:19:13', '2025-10-08 00:19:13'),
(43, 20, 25, 'F', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:19:19', '2025-10-08 00:19:24', '2025-10-08 00:19:24'),
(44, 20, 22, 'o chat nem atualiza em tempo real aindakkkkkk', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:19:35', '2025-10-08 00:20:00', '2025-10-08 00:20:00'),
(45, 20, 22, 'mas em minha defesa eu fiz ele em umas 4horas', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:19:48', '2025-10-08 00:20:00', '2025-10-08 00:20:00'),
(46, 20, 25, '⣿⣿⣿⣿⣿⠟⠋⠄⠄⠄⠄⠄⠄⠄⢁⠈⢻⢿⣿⣿⣿⣿⣿⣿⣿\n⣿⣿⣿⣿⣿⠃⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠈⡀⠭⢿⣿⣿⣿⣿\n⣿⣿⣿⣿⡟⠄⢀⣾⣿⣿⣿⣷⣶⣿⣷⣶⣶⡆⠄⠄⠄⣿⣿⣿⣿\n⣿⣿⣿⣿⡇⢀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⠄⠄⢸⣿⣿⣿⣿\n⣿⣿⣿⣿⣇⣼⣿⣿⠿⠶⠙⣿⡟⠡⣴⣿⣽⣿⣧⠄⢸⣿⣿⣿⣿\n⣿⣿⣿⣿⣿⣾⣿⣿⣟⣭⣾⣿⣷⣶⣶⣴⣶⣿⣿⢄⣿⣿⣿⣿⣿\n⣿⣿⣿⣿⣿⣿⣿⣿⡟⣩⣿⣿⣿⡏⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿\n⣿⣿⣿⣿⣿⣿⣹⡋⠘⠷⣦⣀⣠⡶⠁⠈⠁⠄⣿⣿⣿⣿⣿⣿⣿\n⣿⣿⣿⣿⣿⣿⣍⠃⣴⣶⡔⠒⠄⣠⢀⠄⠄⠄⡨⣿⣿⣿⣿⣿⣿\n⣿⣿⣿⣿⣿⣿⣿⣦⡘⠿⣷⣿⠿⠟⠃⠄⠄⣠⡇⠈⠻⣿⣿⣿⣿\n⣿⣿⣿⣿⡿⠟⠋⢁⣷⣠⠄⠄⠄⠄⣀⣠⣾⡟⠄⠄⠄⠄⠉⠙⠻\n⡿⠟⠋⠁⠄⠄⠄⢸⣿⣿⡯⢓⣴⣾⣿⣿⡟⠄⠄⠄⠄⠄⠄⠄⠄\n⠄⠄⠄⠄⠄⠄⠄⣿⡟⣷⠄⠹⣿⣿⣿⡿⠁⠄⠄⠄⠄⠄⠄⠄⠄', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:19:57', '2025-10-08 00:20:05', '2025-10-08 00:20:05'),
(47, 20, 22, '(⊙.⊙(◉_◉)⊙.⊙)', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:21:34', '2025-10-08 00:22:13', '2025-10-08 00:22:13'),
(48, 20, 25, 'Se clica só na notificação ele não pula pras mensagens', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:22:26', '2025-10-08 00:23:12', '2025-10-08 00:23:12'),
(49, 20, 22, 'shhhhhh', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:23:19', '2025-10-08 00:23:42', '2025-10-08 00:23:42'),
(50, 20, 22, 'tem até dia 24 de noite pra arrumar esses erros', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:23:35', '2025-10-08 00:23:42', '2025-10-08 00:23:42'),
(51, 20, 25, 'Desse mês?', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:23:50', '2025-10-08 00:23:56', '2025-10-08 00:23:56'),
(52, 20, 22, 'isso', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:23:59', '2025-10-08 00:24:42', '2025-10-08 00:24:42'),
(53, 20, 22, 'dia 25, sábado a gente vai apresentar pro público', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:24:09', '2025-10-08 00:24:42', '2025-10-08 00:24:42'),
(54, 20, 22, 'na feira tecnológica', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:24:14', '2025-10-08 00:24:42', '2025-10-08 00:24:42'),
(55, 20, 22, 'ai depois só 26 de novembro q é a apresentação final', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:24:25', '2025-10-08 00:24:42', '2025-10-08 00:24:42'),
(56, 20, 25, 'A foto de capa também não alinha direito, qualquer coisa sugere as medidas pra ela ficar centralizada certinho', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:24:39', '2025-10-08 00:25:24', '2025-10-08 00:25:24'),
(57, 20, 25, 'Público, eu posso ir ver?', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:25:02', '2025-10-08 00:25:24', '2025-10-08 00:25:24'),
(58, 20, 22, 'ta cheio de detalhe pequeno pra corrigir, tem muita coisa q ta não tem ou que ta meio errado por falta de atenção nossa😭😭', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:26:34', '2025-10-08 00:27:21', '2025-10-08 00:27:21'),
(59, 20, 22, 'qualquer pessoa pode entrar na etec dia 25 pra ver as apresentações de todas as salas, pq vai ter tcc e outras coisas', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:27:07', '2025-10-08 00:27:21', '2025-10-08 00:27:21'),
(60, 20, 22, 'só q é de tarde né', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:27:16', '2025-10-08 00:27:21', '2025-10-08 00:27:21'),
(61, 20, 22, 'das 11h às 15h na vdd', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:27:51', '2025-10-08 00:28:30', '2025-10-08 00:28:30'),
(62, 20, 25, 'F', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:28:34', '2025-10-08 00:28:42', '2025-10-08 00:28:42'),
(63, 20, 25, 'E a de 26 de novembro, vcs sabem o horário?', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:28:55', '2025-10-08 00:29:08', '2025-10-08 00:29:08'),
(64, 20, 22, 'é em horário de aula pq é dia da semana', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:29:22', '2025-10-08 00:30:39', '2025-10-08 00:30:39'),
(65, 20, 22, 'só não se sabe ainda em que aulas vai ser, quanto tempo vai durar', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:29:47', '2025-10-08 00:30:39', '2025-10-08 00:30:39'),
(66, 20, 22, 'mas é aberto pra familia entrar tbm', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:29:57', '2025-10-08 00:30:39', '2025-10-08 00:30:39'),
(67, 20, 22, 'só não da pra ver todas as apresentações pq é no auditório e não tem espaço pra todo mundo', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:30:19', '2025-10-08 00:30:39', '2025-10-08 00:30:39'),
(68, 20, 25, 'Se vocês souberem me passa que eu vou ver, a final', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:31:06', '2025-10-08 00:33:08', '2025-10-08 00:33:08'),
(69, 20, 25, 'Na minha época tinha convite contado, ai quem fosse podia ver todas kkk', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:31:30', '2025-10-08 00:33:08', '2025-10-08 00:33:08'),
(70, 20, 22, 'eu não sei direito como vai ser esse ano ainda pq nem a cintia ta sabendo', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:33:38', '2025-10-08 00:33:58', '2025-10-08 00:33:58'),
(71, 20, 22, 'mas nos dois ultimos anos, o convidado ia ver a apresentação e ja tinha q sair do auditório pros convidados do próximo grupo entrar', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:34:30', '2025-10-08 00:57:53', '2025-10-08 00:57:53'),
(72, 20, 22, 'pq ficou o primeiro e o segundo de informática assistindo tbm', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:34:51', '2025-10-08 00:57:53', '2025-10-08 00:57:53'),
(73, 20, 22, 'tinha aluno deitado até no chão por falta de espaço', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:35:07', '2025-10-08 00:57:53', '2025-10-08 00:57:53'),
(74, 20, 22, '(eu fui um deles, até hj nao sei ao certo quais foram os tccs de informática do ano passado pq eu tava no fundo deitada quase dormindo)', 'texto', NULL, NULL, NULL, 1, '2025-10-08 00:35:33', '2025-10-08 00:57:53', '2025-10-08 00:57:53'),
(75, 21, 11, 'mano', 'texto', NULL, NULL, NULL, 0, '2025-10-08 02:27:37', NULL, NULL),
(76, 9, 15, 'hey baby grrr', 'texto', NULL, NULL, NULL, 0, '2025-10-08 02:34:29', NULL, NULL),
(77, 1, 1, 'oiii', 'texto', NULL, NULL, NULL, 0, '2025-10-08 02:34:30', NULL, NULL),
(78, 22, 1, '✌️', 'texto', NULL, NULL, NULL, 0, '2025-10-08 03:07:43', NULL, NULL),
(79, 23, 13, 'mano cala a boca vvelho', 'texto', NULL, NULL, NULL, 0, '2025-10-13 14:49:28', NULL, NULL),
(80, 23, 13, 'vc nn cala a boca', 'texto', NULL, NULL, NULL, 0, '2025-10-13 14:49:32', NULL, NULL),
(81, 23, 13, 'retardada', 'texto', NULL, NULL, NULL, 0, '2025-10-13 14:49:37', NULL, NULL),
(82, 24, 13, 'oiii', 'texto', NULL, NULL, NULL, 1, '2025-10-13 14:57:38', '2025-10-13 14:57:45', '2025-10-13 14:57:45'),
(83, 24, 22, 'ola', 'texto', NULL, NULL, NULL, 1, '2025-10-13 14:57:48', '2025-10-13 14:57:54', '2025-10-13 14:57:54'),
(84, 24, 13, 'ahhh ta', 'texto', NULL, NULL, NULL, 1, '2025-10-13 14:57:58', '2025-10-13 14:58:16', '2025-10-13 14:58:16'),
(85, 24, 22, 'interessante', 'texto', NULL, NULL, NULL, 1, '2025-10-13 14:58:03', '2025-10-13 14:58:20', '2025-10-13 14:58:20'),
(86, 23, 13, 'lindaaaaaaaaaaaaaaa', 'texto', NULL, NULL, NULL, 0, '2025-10-13 14:58:19', NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `from_user_id` int(11) DEFAULT NULL,
  `type` enum('like','comment','follow','save','mention','message','group','course','system') NOT NULL,
  `categoria` enum('social','mensagem','grupos','cursos','sistema') NOT NULL DEFAULT 'social',
  `post_id` int(11) DEFAULT NULL,
  `comment_id` int(11) DEFAULT NULL,
  `contexto_id` int(11) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `data_extra` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data_extra`)),
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','sent','read','archived') NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `categoria`, `post_id`, `comment_id`, `contexto_id`, `message`, `data_extra`, `is_read`, `created_at`, `status`) VALUES
(1, 7, 9, 'like', 'social', 28, NULL, NULL, NULL, NULL, 0, '2025-09-08 20:43:54', 'pending'),
(2, 7, 9, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-09-08 20:23:11', 'pending'),
(3, 7, 9, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-09-08 20:23:29', 'pending'),
(4, 6, 9, 'like', 'social', 23, NULL, NULL, NULL, NULL, 0, '2025-09-08 20:23:32', 'pending'),
(5, 6, 9, 'like', 'social', 24, NULL, NULL, NULL, NULL, 0, '2025-09-08 20:23:46', 'pending'),
(6, 6, 9, 'save', 'social', 24, NULL, NULL, NULL, NULL, 0, '2025-09-08 20:23:39', 'pending'),
(7, 6, 9, 'like', 'social', 25, NULL, NULL, NULL, NULL, 0, '2025-09-08 20:24:04', 'pending'),
(8, 6, 9, 'comment', 'social', 25, 5, NULL, NULL, NULL, 0, '2025-09-08 20:24:11', 'pending'),
(9, 6, 9, 'save', 'social', 25, NULL, NULL, NULL, NULL, 0, '2025-09-08 20:24:17', 'pending'),
(10, 5, 9, 'comment', 'social', 20, 6, NULL, NULL, NULL, 0, '2025-09-08 20:24:31', 'pending'),
(11, 5, 9, 'save', 'social', 20, NULL, NULL, NULL, NULL, 0, '2025-09-08 20:24:33', 'pending'),
(12, 5, 9, 'like', 'social', 20, NULL, NULL, NULL, NULL, 0, '2025-09-08 20:24:35', 'pending'),
(13, 5, 9, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-09-08 20:24:41', 'pending'),
(14, 7, 9, 'save', 'social', 28, NULL, NULL, NULL, NULL, 0, '2025-09-08 20:43:51', 'pending'),
(15, 6, 9, 'like', 'social', 27, NULL, NULL, NULL, NULL, 0, '2025-09-08 21:06:36', 'pending'),
(16, 6, 9, 'like', 'social', 26, NULL, NULL, NULL, NULL, 0, '2025-09-08 21:06:47', 'pending'),
(17, 6, 9, 'save', 'social', 26, NULL, NULL, NULL, NULL, 0, '2025-09-08 21:06:50', 'pending'),
(18, 9, 10, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-09-09 01:32:40', 'pending'),
(19, 6, 10, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-09-09 01:33:08', 'pending'),
(20, 9, 10, 'save', 'social', 30, NULL, NULL, NULL, NULL, 0, '2025-09-09 01:36:35', 'pending'),
(21, 9, 10, 'save', 'social', 29, NULL, NULL, NULL, NULL, 0, '2025-09-09 01:36:36', 'pending'),
(22, 9, 10, 'like', 'social', 30, NULL, NULL, NULL, NULL, 0, '2025-09-09 01:36:52', 'pending'),
(23, 9, 10, 'like', 'social', 29, NULL, NULL, NULL, NULL, 0, '2025-09-09 01:37:07', 'pending'),
(24, 9, 10, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-09-09 01:53:32', 'pending'),
(25, 9, 10, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-09-09 01:53:46', 'pending'),
(26, 6, 10, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-09-09 01:54:03', 'pending'),
(27, 9, 10, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-09-09 01:54:31', 'pending'),
(28, 10, 11, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-09-09 02:38:23', 'pending'),
(29, 10, 11, 'like', 'social', 31, NULL, NULL, NULL, NULL, 0, '2025-09-09 02:38:23', 'pending'),
(30, 9, 11, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-09-09 02:38:30', 'pending'),
(31, 10, 11, 'save', 'social', 31, NULL, NULL, NULL, NULL, 0, '2025-09-09 02:40:11', 'pending'),
(32, 11, 10, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-26 17:48:03', 'pending'),
(33, 9, 11, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-09-26 19:31:54', 'pending'),
(34, 10, 11, 'comment', 'social', 31, 10, NULL, NULL, NULL, 0, '2025-09-26 19:32:15', 'pending'),
(35, 9, 10, 'message', 'mensagem', NULL, NULL, 2, 'jujjnmyhnhynm', '{\"mensagem_id\":6,\"preview\":\"jujjnmyhnhynm\"}', 0, '2025-09-26 22:57:17', 'pending'),
(36, 11, NULL, 'system', 'sistema', NULL, NULL, NULL, 'Assinatura ativada: Premium', '{\"plan\":\"plano-premium\"}', 1, '2025-09-27 00:20:38', 'pending'),
(37, 10, 11, 'message', 'mensagem', NULL, NULL, 3, 'gente wu amo', '{\"mensagem_id\":7,\"preview\":\"gente wu amo\"}', 0, '2025-10-01 19:52:41', 'pending'),
(38, 11, 10, 'message', 'mensagem', NULL, NULL, 3, 'oiii migaaaa', '{\"mensagem_id\":8,\"preview\":\"oiii migaaaa\"}', 1, '2025-10-01 20:55:56', 'pending'),
(39, 11, 10, 'like', 'social', 34, NULL, NULL, NULL, NULL, 1, '2025-10-01 20:56:15', 'pending'),
(40, 11, 10, 'like', 'social', 33, NULL, NULL, NULL, NULL, 1, '2025-10-01 20:56:17', 'pending'),
(41, 11, 12, 'like', 'social', 35, NULL, NULL, NULL, NULL, 1, '2025-10-01 22:21:25', 'pending'),
(42, 11, 12, 'like', 'social', 34, NULL, NULL, NULL, NULL, 1, '2025-10-01 22:21:27', 'pending'),
(43, 11, 12, 'comment', 'social', 34, 11, NULL, NULL, NULL, 1, '2025-10-01 22:21:33', 'pending'),
(44, 11, 12, 'save', 'social', 33, NULL, NULL, NULL, NULL, 1, '2025-10-01 22:21:42', 'pending'),
(45, 10, 12, 'like', 'social', 31, NULL, NULL, NULL, NULL, 0, '2025-10-01 22:21:44', 'pending'),
(46, 10, 12, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-10-01 22:21:46', 'pending'),
(47, 11, 12, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 1, '2025-10-01 22:21:49', 'pending'),
(49, 9, 12, 'like', 'social', 30, NULL, NULL, NULL, NULL, 0, '2025-10-01 22:22:12', 'pending'),
(50, 9, 12, 'like', 'social', 29, NULL, NULL, NULL, NULL, 0, '2025-10-01 22:22:13', 'pending'),
(51, 10, 12, 'save', 'social', 31, NULL, NULL, NULL, NULL, 0, '2025-10-01 22:22:20', 'pending'),
(52, 10, 12, 'message', 'mensagem', NULL, NULL, 6, 'oi amiga', '{\"mensagem_id\":9,\"preview\":\"oi amiga\"}', 0, '2025-10-01 22:22:54', 'pending'),
(53, 12, 10, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-10-01 22:52:18', 'pending'),
(54, 9, 11, 'message', 'mensagem', NULL, NULL, 7, 'hii', '{\"mensagem_id\":10,\"preview\":\"hii\"}', 0, '2025-10-02 00:56:07', 'pending'),
(55, 10, NULL, 'system', 'sistema', NULL, NULL, NULL, 'Assinatura ativada: Premium', '{\"plan\":\"plano-premium\"}', 0, '2025-10-02 02:18:04', 'pending'),
(56, 11, 10, 'like', 'social', 35, NULL, NULL, NULL, NULL, 1, '2025-10-02 02:45:25', 'pending'),
(57, 12, 10, 'like', 'social', 36, NULL, NULL, NULL, NULL, 0, '2025-10-02 02:45:25', 'pending'),
(58, 6, 10, 'like', 'social', 26, NULL, NULL, NULL, NULL, 0, '2025-10-04 22:14:23', 'pending'),
(59, 12, 11, 'like', 'social', 36, NULL, NULL, NULL, NULL, 0, '2025-10-04 23:21:14', 'pending'),
(60, 12, 11, 'comment', 'social', 36, 13, NULL, NULL, NULL, 0, '2025-10-04 23:21:32', 'pending'),
(61, 12, 11, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-10-05 02:15:30', 'pending'),
(62, 10, 11, 'like', 'social', 31, NULL, NULL, NULL, NULL, 0, '2025-10-05 03:07:44', 'pending'),
(63, 10, 11, 'message', 'mensagem', NULL, NULL, 3, 'ta bem??', '{\"mensagem_id\":11,\"preview\":\"ta bem??\"}', 0, '2025-10-05 03:08:12', 'pending'),
(64, 11, 13, 'like', 'social', 37, NULL, NULL, NULL, NULL, 1, '2025-10-05 06:17:15', 'pending'),
(65, 11, 13, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 1, '2025-10-05 06:17:32', 'pending'),
(66, 11, 13, 'message', 'mensagem', NULL, NULL, 8, 'Olá! Tudo bem?', '{\"mensagem_id\":12,\"preview\":\"Olá! Tudo bem?\"}', 1, '2025-10-05 06:17:51', 'pending'),
(67, 13, 11, 'message', 'mensagem', NULL, NULL, 8, 'Oiee! Sim', '{\"mensagem_id\":13,\"preview\":\"Oiee! Sim\"}', 1, '2025-10-05 06:21:11', 'pending'),
(68, 13, 11, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 1, '2025-10-05 06:23:02', 'pending'),
(69, 11, 13, 'like', 'social', 34, NULL, NULL, NULL, NULL, 1, '2025-10-05 06:33:08', 'pending'),
(70, 11, 13, 'comment', 'social', 34, 15, NULL, NULL, NULL, 1, '2025-10-05 06:33:14', 'pending'),
(71, 11, 13, 'comment', 'social', 34, 16, NULL, NULL, NULL, 1, '2025-10-05 06:33:22', 'pending'),
(72, 10, 13, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-10-05 06:33:35', 'pending'),
(73, 11, 13, 'like', 'social', 35, NULL, NULL, NULL, NULL, 1, '2025-10-05 06:33:43', 'pending'),
(74, 13, 11, 'like', 'social', 40, NULL, NULL, NULL, NULL, 1, '2025-10-05 07:02:12', 'pending'),
(75, 13, 11, 'like', 'social', 39, NULL, NULL, NULL, NULL, 1, '2025-10-05 07:02:14', 'pending'),
(76, 13, 11, 'comment', 'social', 39, 17, NULL, NULL, NULL, 1, '2025-10-05 07:02:21', 'pending'),
(77, 13, 14, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 1, '2025-10-05 10:59:36', 'pending'),
(78, 10, 15, 'comment', 'social', 31, 18, NULL, NULL, NULL, 0, '2025-10-05 11:30:36', 'pending'),
(79, 18, 11, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-10-05 12:55:58', 'pending'),
(80, 18, 11, 'like', 'social', 44, NULL, NULL, NULL, NULL, 0, '2025-10-05 12:56:07', 'pending'),
(81, 15, 11, 'like', 'social', 42, NULL, NULL, NULL, NULL, 0, '2025-10-05 12:56:21', 'pending'),
(82, 15, 11, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-10-05 12:56:27', 'pending'),
(83, 15, 11, 'message', 'mensagem', NULL, NULL, 9, 'testing the chat', '{\"mensagem_id\":14,\"preview\":\"testing the chat\"}', 0, '2025-10-05 12:57:28', 'pending'),
(84, 18, 11, 'message', 'mensagem', NULL, NULL, 10, 'testando o chat', '{\"mensagem_id\":15,\"preview\":\"testando o chat\"}', 0, '2025-10-05 12:57:42', 'pending'),
(85, 18, 13, 'like', 'social', 44, NULL, NULL, NULL, NULL, 0, '2025-10-05 17:33:53', 'pending'),
(86, 18, 13, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-10-05 17:33:57', 'pending'),
(87, 18, 13, 'message', 'mensagem', NULL, NULL, 11, 'ops', '{\"mensagem_id\":18,\"preview\":\"ops\"}', 0, '2025-10-05 17:34:29', 'pending'),
(88, 18, 13, 'message', 'mensagem', NULL, NULL, 11, 'oi more', '{\"mensagem_id\":16,\"preview\":\"oi more\"}', 0, '2025-10-05 17:34:24', 'pending'),
(89, 11, 21, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 1, '2025-10-06 15:07:58', 'pending'),
(90, 11, 21, 'message', 'mensagem', NULL, NULL, 12, 'tudo bom bb????', '{\"mensagem_id\":21,\"preview\":\"tudo bom bb????\"}', 1, '2025-10-06 15:13:53', 'pending'),
(91, 21, 11, 'message', 'mensagem', NULL, NULL, 12, 'nao bb', '{\"mensagem_id\":22,\"preview\":\"nao bb\"}', 1, '2025-10-07 15:08:24', 'pending'),
(92, 11, 21, 'save', 'social', 37, NULL, NULL, NULL, NULL, 1, '2025-10-06 15:15:32', 'pending'),
(93, 11, 21, 'like', 'social', 37, NULL, NULL, NULL, NULL, 1, '2025-10-06 15:15:33', 'pending'),
(94, 11, 21, 'like', 'social', 35, NULL, NULL, NULL, NULL, 1, '2025-10-06 15:15:35', 'pending'),
(95, 11, 21, 'like', 'social', 38, NULL, NULL, NULL, NULL, 1, '2025-10-06 15:15:37', 'pending'),
(96, 18, 17, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-10-06 15:16:34', 'pending'),
(97, 15, 17, 'like', 'social', 42, NULL, NULL, NULL, NULL, 0, '2025-10-06 15:16:41', 'pending'),
(98, 21, 17, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 1, '2025-10-06 15:17:36', 'pending'),
(99, 21, 17, 'like', 'social', 45, NULL, NULL, NULL, NULL, 1, '2025-10-06 15:17:37', 'pending'),
(100, 21, 17, 'comment', 'social', 45, 19, NULL, NULL, NULL, 1, '2025-10-06 15:17:48', 'pending'),
(101, 17, 21, 'like', 'social', 46, NULL, NULL, NULL, NULL, 1, '2025-10-06 15:18:56', 'pending'),
(102, 17, 21, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 1, '2025-10-06 15:18:57', 'pending'),
(103, 17, 21, 'comment', 'social', 46, 20, NULL, NULL, NULL, 0, '2025-10-06 15:19:09', 'pending'),
(104, 17, 21, 'comment', 'social', 46, 21, NULL, NULL, NULL, 1, '2025-10-06 15:20:38', 'pending'),
(105, 21, 23, 'like', 'social', 45, NULL, NULL, NULL, NULL, 1, '2025-10-06 15:39:20', 'pending'),
(106, 21, 23, 'comment', 'social', 45, 22, NULL, NULL, NULL, 1, '2025-10-06 15:35:28', 'pending'),
(107, 21, 23, 'save', 'social', 45, NULL, NULL, NULL, NULL, 1, '2025-10-06 15:35:32', 'pending'),
(108, 11, 23, 'like', 'social', 37, NULL, NULL, NULL, NULL, 1, '2025-10-06 15:35:42', 'pending'),
(109, 21, 23, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 1, '2025-10-06 15:39:17', 'pending'),
(111, 23, 11, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 1, '2025-10-07 15:08:31', 'pending'),
(112, 24, NULL, 'system', 'sistema', NULL, NULL, NULL, 'Assinatura ativada: Premium', '{\"plan\":\"plano-premium\"}', 1, '2025-10-07 15:14:51', 'pending'),
(113, 10, 24, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-10-07 15:21:47', 'pending'),
(114, 10, 24, 'message', 'mensagem', NULL, NULL, 13, 'oii miga', '{\"mensagem_id\":23,\"preview\":\"oii miga\"}', 0, '2025-10-07 15:22:08', 'pending'),
(115, 11, 21, 'message', 'mensagem', NULL, NULL, 12, 'afffff', '{\"mensagem_id\":24,\"preview\":\"afffff\"}', 1, '2025-10-07 15:24:33', 'pending'),
(116, 17, 24, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-10-07 15:26:48', 'pending'),
(117, 23, 24, 'like', 'social', 47, NULL, NULL, NULL, NULL, 1, '2025-10-07 15:28:03', 'pending'),
(118, 23, 24, 'comment', 'social', 47, 24, NULL, NULL, NULL, 1, '2025-10-07 15:28:10', 'pending'),
(119, 11, 23, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 1, '2025-10-07 15:29:33', 'pending'),
(120, 17, 23, 'like', 'social', 46, NULL, NULL, NULL, NULL, 0, '2025-10-07 15:32:19', 'pending'),
(121, 17, 23, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-10-07 15:32:21', 'pending'),
(122, 24, 23, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 1, '2025-10-07 15:32:50', 'pending'),
(123, 24, 23, 'like', 'social', 49, NULL, NULL, NULL, NULL, 1, '2025-10-07 15:33:10', 'pending'),
(124, 24, 23, 'comment', 'social', 49, 25, NULL, NULL, NULL, 1, '2025-10-07 15:33:15', 'pending'),
(125, 23, 24, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 1, '2025-10-07 15:35:21', 'pending'),
(126, 23, 24, 'like', 'social', 48, NULL, NULL, NULL, NULL, 1, '2025-10-07 15:34:49', 'pending'),
(127, 23, 24, 'comment', 'social', 48, 27, NULL, NULL, NULL, 1, '2025-10-07 15:35:01', 'pending'),
(128, 17, 24, 'message', 'mensagem', NULL, NULL, 14, 'oii', '{\"mensagem_id\":25,\"preview\":\"oii\"}', 0, '2025-10-07 15:35:08', 'pending'),
(129, 23, 24, 'message', 'mensagem', NULL, NULL, 15, 'pesou', '{\"mensagem_id\":33,\"preview\":\"pesou\"}', 1, '2025-10-07 15:36:44', 'pending'),
(130, 21, 23, 'message', 'mensagem', NULL, NULL, 16, 'tudo mal amg', '{\"mensagem_id\":36,\"preview\":\"tudo mal amg\"}', 1, '2025-10-07 22:31:39', 'pending'),
(131, 24, 23, 'message', 'mensagem', NULL, NULL, 15, 'TwT', '{\"mensagem_id\":34,\"preview\":\"TwT\"}', 1, '2025-10-07 15:37:01', 'pending'),
(132, 17, 23, 'message', 'mensagem', NULL, NULL, 17, 'oi amgggg', '{\"mensagem_id\":30,\"preview\":\"oi amgggg\"}', 0, '2025-10-07 15:35:56', 'pending'),
(133, 23, 21, 'message', 'mensagem', NULL, NULL, 16, 'oi amg, tudo bem???', '{\"mensagem_id\":35,\"preview\":\"oi amg, tudo bem???\"}', 1, '2025-10-07 15:38:13', 'pending'),
(134, 23, 21, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 1, '2025-10-07 15:38:25', 'pending'),
(135, 24, 21, 'like', 'social', 49, NULL, NULL, NULL, NULL, 0, '2025-10-07 15:38:50', 'pending'),
(136, 24, 21, 'comment', 'social', 49, 28, NULL, NULL, NULL, 0, '2025-10-07 15:39:00', 'pending'),
(137, 23, 21, 'like', 'social', 48, NULL, NULL, NULL, NULL, 1, '2025-10-07 15:39:10', 'pending'),
(138, 23, 21, 'comment', 'social', 48, 29, NULL, NULL, NULL, 1, '2025-10-07 15:40:04', 'pending'),
(139, 24, 21, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-10-07 15:40:40', 'pending'),
(140, 23, 21, 'comment', 'social', 48, 30, NULL, NULL, NULL, 1, '2025-10-07 15:41:05', 'pending'),
(141, 21, 22, 'like', 'social', 50, NULL, NULL, NULL, NULL, 1, '2025-10-07 22:21:54', 'pending'),
(142, 24, 22, 'like', 'social', 49, NULL, NULL, NULL, NULL, 0, '2025-10-07 22:22:12', 'pending'),
(143, 24, 22, 'comment', 'social', 49, 31, NULL, NULL, NULL, 0, '2025-10-07 22:22:19', 'pending'),
(144, 23, 22, 'like', 'social', 48, NULL, NULL, NULL, NULL, 1, '2025-10-07 22:22:24', 'pending'),
(145, 23, 22, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 1, '2025-10-07 22:22:27', 'pending'),
(146, 23, 22, 'comment', 'social', 48, 32, NULL, NULL, NULL, 1, '2025-10-07 22:22:38', 'pending'),
(147, 23, 22, 'like', 'social', 47, NULL, NULL, NULL, NULL, 1, '2025-10-07 22:22:46', 'pending'),
(148, 23, 22, 'comment', 'social', 47, 33, NULL, NULL, NULL, 1, '2025-10-07 22:22:54', 'pending'),
(149, 21, 22, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 1, '2025-10-07 22:24:02', 'pending'),
(150, 17, 22, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-10-07 22:24:05', 'pending'),
(151, 22, 21, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 1, '2025-10-07 22:30:46', 'pending'),
(152, 22, 21, 'like', 'social', 51, NULL, NULL, NULL, NULL, 1, '2025-10-07 22:30:49', 'pending'),
(153, 22, 21, 'comment', 'social', 51, 34, NULL, NULL, NULL, 1, '2025-10-07 22:30:59', 'pending'),
(154, 22, 23, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 1, '2025-10-07 22:31:45', 'pending'),
(155, 22, 23, 'like', 'social', 51, NULL, NULL, NULL, NULL, 1, '2025-10-07 22:31:48', 'pending'),
(156, 21, 23, 'like', 'social', 50, NULL, NULL, NULL, NULL, 1, '2025-10-07 22:31:52', 'pending'),
(157, 22, 23, 'comment', 'social', 51, 35, NULL, NULL, NULL, 1, '2025-10-07 22:32:25', 'pending'),
(158, 23, 22, 'save', 'social', 48, NULL, NULL, NULL, NULL, 0, '2025-10-07 22:37:32', 'pending'),
(159, 22, 25, 'like', 'social', 51, NULL, NULL, NULL, NULL, 1, '2025-10-07 23:59:57', 'pending'),
(160, 25, 22, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 1, '2025-10-08 00:05:28', 'pending'),
(161, 22, 25, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 1, '2025-10-08 00:08:38', 'pending'),
(162, 25, 22, 'message', 'mensagem', NULL, NULL, 20, '(eu fui um deles, até hj nao sei ao certo quais foram os tccs de informática do ano passado pq eu tava no fundo deitada ', '{\"mensagem_id\":74,\"preview\":\"(eu fui um deles, até hj nao sei ao certo quais foram os tccs de informática do ano passado pq eu tava no fundo deitada \"}', 1, '2025-10-08 00:35:33', 'pending'),
(163, 22, 25, 'message', 'mensagem', NULL, NULL, 20, 'Na minha época tinha convite contado, ai quem fosse podia ver todas kkk', '{\"mensagem_id\":69,\"preview\":\"Na minha época tinha convite contado, ai quem fosse podia ver todas kkk\"}', 1, '2025-10-08 00:31:30', 'pending'),
(164, 17, 25, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-10-08 00:21:24', 'pending'),
(165, 25, 22, 'like', 'social', 52, NULL, NULL, NULL, NULL, 1, '2025-10-08 00:22:16', 'pending'),
(166, 25, 22, 'comment', 'social', 52, 36, NULL, NULL, NULL, 1, '2025-10-08 00:23:08', 'pending'),
(167, 23, 25, 'like', 'social', 48, NULL, NULL, NULL, NULL, 0, '2025-10-08 00:26:36', 'pending'),
(168, 25, 11, 'like', 'social', 52, NULL, NULL, NULL, NULL, 1, '2025-10-08 02:25:45', 'pending'),
(169, 22, 11, 'like', 'social', 51, NULL, NULL, NULL, NULL, 1, '2025-10-08 02:25:51', 'pending'),
(170, 21, 11, 'like', 'social', 50, NULL, NULL, NULL, NULL, 1, '2025-10-08 02:25:55', 'pending'),
(171, 24, 11, 'like', 'social', 49, NULL, NULL, NULL, NULL, 0, '2025-10-08 02:26:00', 'pending'),
(172, 23, 11, 'message', 'mensagem', NULL, NULL, 21, 'mano', '{\"mensagem_id\":75,\"preview\":\"mano\"}', 0, '2025-10-08 02:27:37', 'pending'),
(173, 16, 11, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-10-08 02:27:59', 'pending'),
(174, 11, 15, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-10-08 02:34:19', 'pending'),
(175, 11, 15, 'message', 'mensagem', NULL, NULL, 9, 'hey baby grrr', '{\"mensagem_id\":76,\"preview\":\"hey baby grrr\"}', 0, '2025-10-08 02:34:29', 'pending'),
(176, 4, 1, 'message', 'mensagem', NULL, NULL, 1, 'oiii', '{\"mensagem_id\":77,\"preview\":\"oiii\"}', 0, '2025-10-08 02:34:30', 'pending'),
(177, 17, 15, 'like', 'social', 46, NULL, NULL, NULL, NULL, 0, '2025-10-08 02:35:20', 'pending'),
(178, 25, 1, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 1, '2025-10-08 03:07:11', 'pending'),
(179, 17, 1, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-10-08 03:07:25', 'pending'),
(180, 23, 1, 'like', 'social', 47, NULL, NULL, NULL, NULL, 0, '2025-10-08 03:07:31', 'pending'),
(181, 24, 1, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-10-08 03:07:36', 'pending'),
(182, 24, 1, 'message', 'mensagem', NULL, NULL, 22, '✌️', '{\"mensagem_id\":78,\"preview\":\"✌️\"}', 0, '2025-10-08 03:07:43', 'pending'),
(183, 25, 1, 'like', 'social', 52, NULL, NULL, NULL, NULL, 1, '2025-10-08 10:35:18', 'pending'),
(184, 22, 1, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 1, '2025-10-08 10:35:23', 'pending'),
(185, 21, 1, 'like', 'social', 50, NULL, NULL, NULL, NULL, 1, '2025-10-08 10:35:43', 'pending'),
(186, 25, 21, 'like', 'social', 52, NULL, NULL, NULL, NULL, 1, '2025-10-08 10:35:44', 'pending'),
(187, 18, 1, 'like', 'social', 44, NULL, NULL, NULL, NULL, 0, '2025-10-08 11:53:40', 'pending'),
(188, 1, 22, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 1, '2025-10-08 23:34:30', 'pending'),
(189, 1, 22, 'like', 'social', 53, NULL, NULL, NULL, NULL, 1, '2025-10-08 23:35:19', 'pending'),
(190, 1, 22, 'comment', 'social', 53, 38, NULL, NULL, NULL, 1, '2025-10-08 23:35:27', 'pending'),
(191, 13, NULL, 'system', 'sistema', NULL, NULL, NULL, 'Assinatura ativada: Premium', '{\"plan\":\"plano-premium\"}', 1, '2025-10-12 20:28:58', 'pending'),
(192, 1, NULL, 'system', 'sistema', NULL, NULL, NULL, 'Assinatura ativada: Premium', '{\"plan\":\"plano-premium\"}', 1, '2025-10-13 02:46:18', 'pending'),
(193, 13, 1, 'like', 'social', 39, NULL, NULL, NULL, NULL, 1, '2025-10-13 02:47:34', 'pending'),
(194, 21, 13, 'like', 'social', 50, NULL, NULL, NULL, NULL, 1, '2025-10-13 14:30:56', 'pending'),
(196, 1, 13, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-10-13 14:49:16', 'pending'),
(197, 1, 13, 'message', 'mensagem', NULL, NULL, 23, 'lindaaaaaaaaaaaaaaa', '{\"mensagem_id\":86,\"preview\":\"lindaaaaaaaaaaaaaaa\"}', 0, '2025-10-13 14:58:19', 'pending'),
(198, 22, 13, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 1, '2025-10-13 14:55:04', 'pending'),
(199, 25, 13, 'like', 'social', 52, NULL, NULL, NULL, NULL, 0, '2025-10-13 14:55:37', 'pending'),
(200, 22, 13, 'like', 'social', 51, NULL, NULL, NULL, NULL, 1, '2025-10-13 14:55:42', 'pending'),
(201, 24, 13, 'like', 'social', 49, NULL, NULL, NULL, NULL, 0, '2025-10-13 14:55:45', 'pending'),
(202, 23, 13, 'like', 'social', 48, NULL, NULL, NULL, NULL, 0, '2025-10-13 14:55:46', 'pending'),
(203, 23, 13, 'like', 'social', 47, NULL, NULL, NULL, NULL, 0, '2025-10-13 14:55:50', 'pending'),
(204, 17, 13, 'like', 'social', 46, NULL, NULL, NULL, NULL, 0, '2025-10-13 14:55:52', 'pending'),
(205, 21, 13, 'like', 'social', 45, NULL, NULL, NULL, NULL, 1, '2025-10-13 14:55:53', 'pending'),
(206, 21, 13, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 1, '2025-10-13 14:56:00', 'pending'),
(207, 21, 13, 'comment', 'social', 50, 40, NULL, NULL, NULL, 1, '2025-10-13 14:56:08', 'pending'),
(208, 1, 13, 'like', 'social', 3, NULL, NULL, NULL, NULL, 0, '2025-10-13 14:56:26', 'pending'),
(209, 1, 13, 'comment', 'social', 3, 41, NULL, NULL, NULL, 0, '2025-10-13 14:56:32', 'pending'),
(210, 13, 22, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 1, '2025-10-13 14:57:06', 'pending'),
(211, 1, 22, 'like', 'social', 54, NULL, NULL, NULL, NULL, 0, '2025-10-13 14:57:33', 'pending'),
(212, 22, 13, 'message', 'mensagem', NULL, NULL, 24, 'ahhh ta', '{\"mensagem_id\":84,\"preview\":\"ahhh ta\"}', 1, '2025-10-13 14:57:58', 'pending'),
(213, 13, 22, 'message', 'mensagem', NULL, NULL, 24, 'interessante', '{\"mensagem_id\":85,\"preview\":\"interessante\"}', 1, '2025-10-13 14:58:03', 'pending'),
(214, 13, 21, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 1, '2025-10-13 15:00:27', 'pending'),
(215, 13, 21, 'like', 'social', 40, NULL, NULL, NULL, NULL, 1, '2025-10-13 15:00:32', 'pending'),
(216, 13, 21, 'comment', 'social', 40, 42, NULL, NULL, NULL, 1, '2025-10-13 15:00:37', 'pending'),
(217, 1, 21, 'like', 'social', 54, NULL, NULL, NULL, NULL, 0, '2025-10-13 15:01:57', 'pending'),
(218, 1, 21, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-10-13 15:02:00', 'pending'),
(219, 1, 21, 'like', 'social', 53, NULL, NULL, NULL, NULL, 0, '2025-10-13 15:02:01', 'pending'),
(220, 25, 21, 'follow', 'social', NULL, NULL, NULL, NULL, NULL, 0, '2025-10-13 15:02:04', 'pending');

-- --------------------------------------------------------

--
-- Estrutura para tabela `posts`
--

CREATE TABLE `posts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `autor` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `conteudo` text NOT NULL,
  `imagem` varchar(255) DEFAULT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `grupo_id` int(11) DEFAULT NULL,
  `escopo_visibilidade` enum('publico','seguidores','grupo','privado') NOT NULL DEFAULT 'publico',
  `is_promovido` tinyint(1) NOT NULL DEFAULT 0,
  `promocao_status` enum('ativo','agendado','expirado','pausado') DEFAULT NULL,
  `promocao_expira_em` datetime DEFAULT NULL,
  `promocao_metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`promocao_metadata`)),
  `ad_campaign_id` int(11) DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `likes` int(11) DEFAULT 0,
  `comentarios` int(11) DEFAULT 0,
  `compartilhamentos` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `imagem_url` varchar(500) DEFAULT NULL,
  `video_url` varchar(500) DEFAULT NULL,
  `gif_url` varchar(500) DEFAULT NULL,
  `tipo_midia` enum('imagem','video','gif','none') DEFAULT 'none',
  `media_data` longblob DEFAULT NULL,
  `media_type` varchar(50) DEFAULT NULL,
  `media_filename` varchar(255) DEFAULT NULL,
  `media_size` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `posts`
--

INSERT INTO `posts` (`id`, `user_id`, `autor`, `username`, `avatar`, `conteudo`, `imagem`, `categoria`, `grupo_id`, `escopo_visibilidade`, `is_promovido`, `promocao_status`, `promocao_expira_em`, `promocao_metadata`, `ad_campaign_id`, `tags`, `likes`, `comentarios`, `compartilhamentos`, `created_at`, `imagem_url`, `video_url`, `gif_url`, `tipo_midia`, `media_data`, `media_type`, `media_filename`, `media_size`) VALUES
(2, 1, 'Você', '@voce', '/placeholder.svg?height=40&width=40', 'oii', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 0, 0, 0, '2025-06-24 02:04:30', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(3, 1, 'Você', '@voce', '/placeholder.svg?height=40&width=40', 'ola gostaria', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 1, 1, 0, '2025-06-24 02:14:32', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(5, 1, 'Você', '@voce', '/placeholder.svg?height=40&width=40', 'teste 22/06', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 0, 1, 0, '2025-06-24 02:17:06', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(6, 1, 'Você', '@voce', '/placeholder.svg?height=40&width=40', 'teste (foto nn esta funcionando!) rever API', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 0, 0, 0, '2025-06-24 02:17:27', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(7, 1, 'Você', '@voce', '/placeholder.svg?height=40&width=40', 'Bem-vinda à empower up!', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 0, 0, 0, '2025-06-24 02:17:53', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(8, 1, 'Você', '@voce', '/placeholder.svg?height=40&width=40', 'oi', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 0, 0, 0, '2025-06-24 02:39:19', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(9, 1, 'Você', '@voce', '/placeholder.svg?height=40&width=40', 'oi', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 0, 0, 0, '2025-06-24 02:39:19', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(10, 1, 'Você', '@voce', '/placeholder.svg?height=40&width=40', 'oi', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 0, 0, 0, '2025-06-24 02:39:20', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(11, 1, 'Você', '@voce', '/placeholder.svg?height=40&width=40', 'ola', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 0, 0, 0, '2025-06-24 03:21:19', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(12, 1, 'Você', '@voce', '/placeholder.svg?height=40&width=40', 'oiii', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 0, 0, 0, '2025-07-14 23:59:40', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(13, 4, 'dui', '@', '/placeholder.svg?height=40&width=40', 'olá!', NULL, 'Dicas', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[\"amor\",\"pets\"]', 0, 0, 0, '2025-07-15 01:55:44', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(14, 4, 'dui', '@dui', '/images/pfp/user/68840f7b84a6b_1753485179.jpg', 'oiiie', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 0, 0, 0, '2025-07-26 02:05:57', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(15, 4, 'dui', '@dui', '/images/pfp/user/68840f7b84a6b_1753485179.jpg', 'hello girls', NULL, 'Beleza', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[\"#moda #beleza\"]', 0, 0, 0, '2025-07-26 02:06:50', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(16, 4, 'dui', '@dui', '/images/pfp/user/68840f7b84a6b_1753485179.jpg', 'oii', NULL, 'Beleza', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[\"#amo\"]', 0, 2, 0, '2025-08-01 19:55:00', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(17, 4, 'dui', '@dui', '/images/pfp/user/68840f7b84a6b_1753485179.jpg', 'amei esa foto fchação', NULL, 'Inspiração', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[\"#gata\"]', 0, 0, 0, '2025-08-01 19:57:14', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(18, 1, 'murilo', 'murilo', '/images/pfp/user/68759965eae9b_1752537445.jpg', 'oii', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 0, 0, 0, '2025-08-06 01:47:34', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(19, 5, 'more', 'more', '/placeholder.svg?height=40&width=40', 'oiii', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 0, 0, 0, '2025-08-20 00:27:55', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(20, 5, 'more', 'more', '/placeholder.svg?height=40&width=40', 'cjhcjhvjhvjgij', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 0, 1, 0, '2025-08-20 01:39:03', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(21, 5, 'more', 'more', '/placeholder.svg?height=40&width=40', 'teste', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 0, 0, 0, '2025-09-01 22:47:24', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(22, 5, 'more', 'more', '/placeholder.svg?height=40&width=40', 'eu amo', NULL, 'Educação', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 0, 0, 0, '2025-09-02 00:24:38', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(23, 6, 'Marise Rezende Barbosa Jusevicius', 'mariserezendebarbosajusevicius', '/placeholder.svg?height=40&width=40', 'yjuiikuyki', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 0, 0, 0, '2025-09-02 22:22:37', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(24, 6, 'Marise Rezende Barbosa Jusevicius', 'mariserezendebarbosajusevicius', '/placeholder.svg?height=40&width=40', 'oiiiiiiiiiiiii', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 0, 0, 0, '2025-09-02 22:22:49', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(25, 6, 'Marise Rezende Barbosa Jusevicius', 'mariserezendebarbosajusevicius', '/placeholder.svg?height=40&width=40', 'amei!', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 0, 1, 0, '2025-09-02 22:23:01', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(26, 6, 'Marise Rezende Barbosa Jusevicius', 'mariserezendebarbosajusevicius', '/placeholder.svg?height=40&width=40', 'oii', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 2, 0, 0, '2025-09-02 22:27:53', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(27, 6, 'Marise Rezende Barbosa Jusevicius', 'mariserezendebarbosajusevicius', '/placeholder.svg?height=40&width=40', 'oii', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 0, 0, 0, '2025-09-02 22:28:16', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(28, 7, 'Matheus Miranda', 'matheusmiranda', '/placeholder.svg?height=40&width=40', 'huahhahahaha', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 0, 1, 0, '2025-09-03 01:29:05', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(29, 9, 'Giovanna Salles Arruda', 'giovannasallesarruda', '/placeholder.svg?height=40&width=40', 'gente que divonico!!!', NULL, 'Negócios', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 3, 0, 0, '2025-09-07 23:24:45', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(30, 9, 'Giovanna Salles Arruda', 'giovannasallesarruda', '/images/pfp/user/68be2b6f974fd_1757293423.jpg', 'gente oiii', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 3, 0, 0, '2025-09-08 20:25:25', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(31, 10, 'Mariana Lobo Nascimento', 'marianalobonascimento', '/placeholder.svg?height=40&width=40', 'sou nova aqui!', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 3, 4, 0, '2025-09-09 01:30:32', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(33, 11, 'Taylor Alison Swift', 'taylorswift13', '/placeholder.svg?height=40&width=40', 'Welcome to New York!', NULL, 'Negócios', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 2, 0, 0, '2025-09-09 02:38:07', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(34, 11, 'Taylor Alison Swift', 'taylorswift13', '/images/pfp/user/68bf9369566b6_1757385577.jpg', 'teste', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 4, 4, 0, '2025-09-09 03:04:52', '/images/posts/68bf9954b363a_1757387092.jpg', NULL, NULL, 'imagem', NULL, NULL, NULL, NULL),
(35, 11, 'Taylor Alison Swift', 'taylorswift13', '/images/pfp/user/68bf9369566b6_1757385577.jpg', 'oiii', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 4, 0, 0, '2025-10-01 21:24:31', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(36, 12, 'tanisha', 'tanisha', '/placeholder.svg?height=40&width=40', 'oie', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 2, 1, 0, '2025-10-01 22:03:09', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(37, 11, 'Taylor Alison Swift', 'taylorswift13', '/images/pfp/user/68bf9369566b6_1757385577.jpg', 'oie gente testando aqui', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 3, 0, 0, '2025-10-04 23:12:54', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(38, 11, 'Taylor Alison Swift', 'taylorswift13', '/images/pfp/user/68bf9369566b6_1757385577.jpg', 'teste mobile', NULL, 'Educação', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[\"#inspiracao\"]', 2, 0, 0, '2025-10-05 06:22:43', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(39, 13, 'Gabriela Garcia', 'gabis_garcia', '/images/pfp/user/68e20e26d6ca7_1759645222.png', 'Nova aqui!', NULL, 'Artesanato', NULL, 'publico', 1, 'ativo', NULL, NULL, 9, '[\"#procuroamigas\"]', 3, 1, 0, '2025-10-05 06:32:45', '/images/posts/68e2110dcc598_1759645965.jpeg', NULL, NULL, 'imagem', NULL, NULL, NULL, NULL),
(40, 13, 'Gabriela Garcia', 'gabis_garcia', '/images/pfp/user/68e20e26d6ca7_1759645222.png', 'Nova aqui!', NULL, 'Inspiração', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[\"#procuroamigas\"]', 2, 1, 0, '2025-10-05 06:33:06', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(41, 14, 'Aurora Verdadeira', 'Auroraamaismais', '/placeholder.svg?height=40&width=40', 'Eu ameii dms a plataforma', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[\"#empreendedorismofeminino #procuroamigas\"]', 0, 0, 0, '2025-10-05 11:00:15', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(42, 15, 'Mariana Nascimento', 'marinasciiii', '/images/pfp/user/68e257365b98f_1759663926.jpeg', 'omg hey, this app is fire!! 🔥🔥🔥🔥🔥🔥', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 2, 0, 0, '2025-10-05 11:36:50', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(43, 16, 'Leticia Nascimento de Almeida', 'le_almeidan', '/placeholder.svg?height=40&width=40', 'OMG', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 0, 0, 0, '2025-10-05 11:49:12', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(44, 18, 'Laura Jordão Campos', 'larry', '/placeholder.svg?height=40&width=40', 'Arrasador aqui viu', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 3, 0, 0, '2025-10-05 12:19:32', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(45, 21, 'Fernanda Gonçalves', 'fefegoncalves02', '/images/pfp/user/68e3da5308b2b_1759763027.jpg', 'bom diaaa', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 3, 2, 0, '2025-10-06 15:17:19', '/images/posts/68e3dd7fbafca_1759763839.jpg', NULL, NULL, 'imagem', NULL, NULL, NULL, NULL),
(46, 17, 'Ryllary Victória Barroso', 'Ryll', '/images/pfp/user/68e264047a611_1759667204.png', 'oier', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 4, 2, 0, '2025-10-06 15:18:42', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(47, 23, 'Priscila Novaes', 'pitty', '/images/pfp/user/68e3e0eb4c35b_1759764715.jpg', 'O futuro pertence àqueles que acreditam na beleza de seus sonhos.👀🙈🙈', NULL, 'Inspiração', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[\"#acreditenosseussonhos\",\"#empreendedorismo\",\"#beleza\",\"#sonhos\"]', 4, 2, 0, '2025-10-06 15:38:57', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(48, 23, 'Priscila Novaes', 'pitty', '/images/pfp/user/68e531cd37cc1_1759850957.png', 'Eu estava aqui o tempo todo\r\nSó você não viu...', NULL, 'Moda', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[\"#cabelo\",\"#cabeleleira\"]', 5, 4, 0, '2025-10-07 15:32:00', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(49, 24, 'Aline Dantas de Lima', 'Ariana', '/images/pfp/user/68e52ecff3790_1759850191.jpeg', 'oi gente! nova aqui', NULL, 'Moda', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[\"#nova #acheilegal #amei\"]', 5, 4, 0, '2025-10-07 15:32:18', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(50, 21, 'Fernanda Gonçalves', 'fefegoncalves02', '/images/pfp/user/68e5310534223_1759850757.png', 'Acordei alegre manas', NULL, 'Inspiração', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[\"#bomdia\",\"#otimamanha\",\"#felicidades\"]', 5, 1, 0, '2025-10-07 15:43:34', '/images/posts/68e5352644419_1759851814.jpg', NULL, NULL, 'imagem', NULL, NULL, NULL, NULL),
(51, 22, 'Raquel Araujo', 'gh0stchild_', '/images/pfp/user/68e591bf162d9_1759875519.jpg', '😻🙇‍♀️🧙‍♂️🧚‍♂️🧝‍♀️💃🫂', NULL, 'Tecnologia', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[\"#tecnologia\",\"#jogos\",\"#zelda\",\"#mulheresrs\"]', 5, 2, 0, '2025-10-07 22:28:20', '/images/posts/68e59404675c9_1759876100.jpg', NULL, NULL, 'imagem', NULL, NULL, NULL, NULL),
(52, 25, 'Lee Chae ryeong', 'ITZYChaeryeong', '/images/pfp/user/68e5aa50a639c_1759881808.jpg', 'Boa noite, por aqui trabalhando até tarde hoje rs', NULL, 'Inspiração', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[\"#Empreendedorismo\",\"#ForçaDeEquipe\",\"#Foco\",\"#TrabalhoDuro\"]', 5, 2, 0, '2025-10-08 00:18:15', '/images/posts/68e5adc7da886_1759882695.jpg', NULL, NULL, 'imagem', NULL, NULL, NULL, NULL),
(53, 1, 'murilo', 'boreal', '/images/pfp/user/68e5cdda03331_1759890906.png', 'Olá', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 3, 1, 0, '2025-10-08 11:01:46', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(54, 1, 'murilo', 'boreal', '/images/pfp/user/68e5cdda03331_1759890906.png', 'Oi meninas!', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[]', 3, 0, 0, '2025-10-13 01:18:46', '/images/posts/68ec5376b7dce_1760318326.jpeg', NULL, NULL, 'imagem', NULL, NULL, NULL, NULL),
(56, 21, 'Fernanda Gonçalves', 'fefegoncalves02', '/images/pfp/user/68e5310534223_1759850757.png', 'faz um tempinho que eu não entro aqui...', NULL, 'Geral', NULL, 'publico', 0, NULL, NULL, NULL, NULL, '[\"#bomdia\"]', 0, 0, 0, '2025-10-13 15:01:24', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `post_comentarios`
--

CREATE TABLE `post_comentarios` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `conteudo` text NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `post_comentarios`
--

INSERT INTO `post_comentarios` (`id`, `post_id`, `user_id`, `conteudo`, `parent_id`, `created_at`, `updated_at`) VALUES
(1, 16, 4, 'arrasouuu', NULL, '2025-08-01 19:55:12', '2025-08-01 19:55:12'),
(2, 16, 4, 'miga sua loka', 1, '2025-08-01 19:55:32', '2025-08-01 19:55:32'),
(3, 5, 4, 'arrasou viado!', NULL, '2025-08-01 20:48:51', '2025-08-01 20:48:51'),
(4, 28, 9, 'oii', NULL, '2025-09-08 19:45:29', '2025-09-08 19:45:29'),
(5, 25, 9, 'ola!', NULL, '2025-09-08 20:24:10', '2025-09-08 20:24:10'),
(6, 20, 9, 'oi amore', NULL, '2025-09-08 20:24:31', '2025-09-08 20:24:31'),
(7, 31, 10, 'teste coment', NULL, '2025-09-09 01:31:39', '2025-09-09 01:31:39'),
(8, 31, 10, 'uhul', 7, '2025-09-09 01:32:09', '2025-09-09 01:32:09'),
(10, 31, 11, 'oiiiii', NULL, '2025-09-26 19:32:15', '2025-09-26 19:32:15'),
(11, 34, 12, 'oiiiiiiiiiii', NULL, '2025-10-01 22:21:33', '2025-10-01 22:21:33'),
(13, 36, 11, 'oi migaa', NULL, '2025-10-04 23:21:32', '2025-10-04 23:21:32'),
(14, 34, 11, 'miga arraso', NULL, '2025-10-04 23:35:32', '2025-10-05 00:22:19'),
(15, 34, 13, 'arrasou bb', NULL, '2025-10-05 06:33:14', '2025-10-05 06:33:14'),
(16, 34, 13, 'apaga', 14, '2025-10-05 06:33:22', '2025-10-05 06:33:22'),
(17, 39, 11, 'Que foto linda!!', NULL, '2025-10-05 07:02:21', '2025-10-05 07:02:21'),
(18, 31, 15, 'its me, hi!🙋🏻‍♀️', NULL, '2025-10-05 11:30:36', '2025-10-05 11:30:36'),
(19, 45, 17, 'Paz de deus irmã', NULL, '2025-10-06 15:17:48', '2025-10-06 15:17:48'),
(20, 46, 21, 'oiiiii', NULL, '2025-10-06 15:19:09', '2025-10-06 15:19:09'),
(21, 46, 21, 'sua foto de perfil é de jojo? Eca', NULL, '2025-10-06 15:20:38', '2025-10-06 15:20:38'),
(22, 45, 23, 'bom dia irmã', NULL, '2025-10-06 15:35:28', '2025-10-06 15:35:28'),
(24, 47, 24, 'Poético', NULL, '2025-10-07 15:28:10', '2025-10-07 15:28:10'),
(25, 49, 23, 'oi, rs', NULL, '2025-10-07 15:33:15', '2025-10-07 15:33:15'),
(26, 49, 24, 'oi migaaaa', 25, '2025-10-07 15:34:30', '2025-10-07 15:34:41'),
(27, 48, 24, 'EU AMO ESSA', NULL, '2025-10-07 15:35:01', '2025-10-07 15:35:01'),
(28, 49, 21, 'Seja bem vindaaaaaa', NULL, '2025-10-07 15:39:00', '2025-10-07 15:39:00'),
(29, 48, 21, 'Você tá sempre indo e vindo, tudo bem', NULL, '2025-10-07 15:40:04', '2025-10-07 15:40:04'),
(30, 48, 21, 'ama nada, só ama Deus, você gosta dela, GOSTA', 27, '2025-10-07 15:41:05', '2025-10-07 15:41:05'),
(31, 49, 22, 'oiiii', NULL, '2025-10-07 22:22:19', '2025-10-07 22:22:19'),
(32, 48, 22, 'sabe muito', NULL, '2025-10-07 22:22:38', '2025-10-07 22:22:38'),
(33, 47, 22, 'poético...', NULL, '2025-10-07 22:22:54', '2025-10-07 22:22:54'),
(34, 51, 21, '🤮🤮🤮', NULL, '2025-10-07 22:30:59', '2025-10-07 22:30:59'),
(35, 51, 23, 'que cabeçuda', NULL, '2025-10-07 22:32:25', '2025-10-07 22:32:25'),
(36, 52, 22, 'OMG é vc msm chaeryeong??? sou sua fã', NULL, '2025-10-08 00:23:08', '2025-10-08 00:23:08'),
(37, 52, 25, '네, 저예요, 고마워요 미지', 36, '2025-10-08 00:26:14', '2025-10-08 00:26:14'),
(38, 53, 22, 'oier', NULL, '2025-10-08 23:35:27', '2025-10-08 23:35:27'),
(40, 50, 13, 'palmas', NULL, '2025-10-13 14:56:08', '2025-10-13 14:56:08'),
(41, 3, 13, 'att', NULL, '2025-10-13 14:56:32', '2025-10-13 14:56:32'),
(42, 40, 21, 'bem vindaaa', NULL, '2025-10-13 15:00:37', '2025-10-13 15:00:37');

--
-- Acionadores `post_comentarios`
--
DELIMITER $$
CREATE TRIGGER `update_post_comments_count` AFTER INSERT ON `post_comentarios` FOR EACH ROW BEGIN
                    UPDATE posts SET comentarios = (
                        SELECT COUNT(*) FROM post_comentarios WHERE post_id = NEW.post_id
                    ) WHERE id = NEW.post_id;
                END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_post_comments_count_delete` AFTER DELETE ON `post_comentarios` FOR EACH ROW BEGIN
                    UPDATE posts SET comentarios = (
                        SELECT COUNT(*) FROM post_comentarios WHERE post_id = OLD.post_id
                    ) WHERE id = OLD.post_id;
                END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `post_compartilhamentos`
--

CREATE TABLE `post_compartilhamentos` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Acionadores `post_compartilhamentos`
--
DELIMITER $$
CREATE TRIGGER `update_post_shares_count` AFTER INSERT ON `post_compartilhamentos` FOR EACH ROW BEGIN
                    UPDATE posts SET compartilhamentos = (
                        SELECT COUNT(*) FROM post_compartilhamentos WHERE post_id = NEW.post_id
                    ) WHERE id = NEW.post_id;
                END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_post_shares_count_delete` AFTER DELETE ON `post_compartilhamentos` FOR EACH ROW BEGIN
                    UPDATE posts SET compartilhamentos = (
                        SELECT COUNT(*) FROM post_compartilhamentos WHERE post_id = OLD.post_id
                    ) WHERE id = OLD.post_id;
                END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `post_likes`
--

CREATE TABLE `post_likes` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `post_likes`
--

INSERT INTO `post_likes` (`id`, `post_id`, `user_id`, `created_at`) VALUES
(15, 29, 9, '2025-09-08 19:46:52'),
(32, 30, 9, '2025-09-08 21:06:31'),
(34, 26, 9, '2025-09-08 21:06:47'),
(35, 31, 10, '2025-09-09 01:30:40'),
(36, 30, 10, '2025-09-09 01:36:51'),
(38, 29, 10, '2025-09-09 01:37:07'),
(40, 33, 11, '2025-09-09 02:38:19'),
(42, 34, 11, '2025-10-01 20:23:45'),
(43, 34, 10, '2025-10-01 20:56:15'),
(44, 33, 10, '2025-10-01 20:56:16'),
(45, 35, 12, '2025-10-01 22:21:23'),
(46, 34, 12, '2025-10-01 22:21:26'),
(47, 31, 12, '2025-10-01 22:21:44'),
(48, 30, 12, '2025-10-01 22:22:12'),
(49, 29, 12, '2025-10-01 22:22:13'),
(50, 35, 10, '2025-10-02 02:45:10'),
(51, 36, 10, '2025-10-02 02:45:10'),
(52, 26, 10, '2025-10-04 22:14:22'),
(53, 36, 11, '2025-10-04 23:21:14'),
(54, 31, 11, '2025-10-05 03:07:42'),
(55, 37, 13, '2025-10-05 06:17:15'),
(56, 38, 11, '2025-10-05 06:22:53'),
(57, 39, 13, '2025-10-05 06:32:55'),
(58, 34, 13, '2025-10-05 06:33:08'),
(59, 35, 13, '2025-10-05 06:33:43'),
(60, 40, 11, '2025-10-05 07:02:12'),
(61, 39, 11, '2025-10-05 07:02:14'),
(62, 44, 11, '2025-10-05 12:56:07'),
(63, 42, 11, '2025-10-05 12:56:21'),
(64, 44, 13, '2025-10-05 17:33:53'),
(65, 37, 21, '2025-10-06 15:15:33'),
(66, 35, 21, '2025-10-06 15:15:35'),
(67, 38, 21, '2025-10-06 15:15:37'),
(68, 42, 17, '2025-10-06 15:16:41'),
(69, 45, 17, '2025-10-06 15:17:37'),
(70, 46, 21, '2025-10-06 15:18:56'),
(72, 37, 23, '2025-10-06 15:35:42'),
(73, 45, 23, '2025-10-06 15:39:20'),
(74, 47, 24, '2025-10-07 15:28:03'),
(75, 46, 23, '2025-10-07 15:32:19'),
(76, 49, 23, '2025-10-07 15:33:10'),
(77, 48, 24, '2025-10-07 15:34:49'),
(78, 49, 21, '2025-10-07 15:38:50'),
(79, 48, 21, '2025-10-07 15:39:10'),
(80, 50, 22, '2025-10-07 22:21:54'),
(81, 49, 22, '2025-10-07 22:22:12'),
(82, 48, 22, '2025-10-07 22:22:24'),
(83, 47, 22, '2025-10-07 22:22:46'),
(84, 51, 21, '2025-10-07 22:30:49'),
(85, 51, 23, '2025-10-07 22:31:48'),
(86, 50, 23, '2025-10-07 22:31:52'),
(87, 51, 25, '2025-10-07 23:59:57'),
(88, 52, 22, '2025-10-08 00:22:16'),
(89, 48, 25, '2025-10-08 00:26:36'),
(90, 52, 11, '2025-10-08 02:25:45'),
(91, 51, 11, '2025-10-08 02:25:51'),
(92, 50, 11, '2025-10-08 02:25:55'),
(93, 49, 11, '2025-10-08 02:26:00'),
(94, 46, 15, '2025-10-08 02:35:20'),
(95, 47, 1, '2025-10-08 03:07:31'),
(96, 52, 1, '2025-10-08 10:35:18'),
(97, 50, 1, '2025-10-08 10:35:43'),
(98, 52, 21, '2025-10-08 10:35:44'),
(99, 44, 1, '2025-10-08 11:53:40'),
(100, 53, 22, '2025-10-08 23:35:19'),
(101, 53, 1, '2025-10-12 20:31:47'),
(102, 54, 1, '2025-10-13 02:45:07'),
(103, 39, 1, '2025-10-13 02:47:34'),
(104, 50, 13, '2025-10-13 14:30:56'),
(105, 52, 13, '2025-10-13 14:55:37'),
(106, 51, 13, '2025-10-13 14:55:42'),
(107, 49, 13, '2025-10-13 14:55:45'),
(108, 48, 13, '2025-10-13 14:55:46'),
(109, 47, 13, '2025-10-13 14:55:50'),
(110, 46, 13, '2025-10-13 14:55:52'),
(111, 45, 13, '2025-10-13 14:55:53'),
(112, 3, 13, '2025-10-13 14:56:26'),
(113, 54, 22, '2025-10-13 14:57:33'),
(114, 40, 21, '2025-10-13 15:00:32'),
(115, 54, 21, '2025-10-13 15:01:57'),
(116, 53, 21, '2025-10-13 15:02:01');

--
-- Acionadores `post_likes`
--
DELIMITER $$
CREATE TRIGGER `update_post_likes_count` AFTER INSERT ON `post_likes` FOR EACH ROW BEGIN
                    UPDATE posts SET likes = (
                        SELECT COUNT(*) FROM post_likes WHERE post_id = NEW.post_id
                    ) WHERE id = NEW.post_id;
                END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_post_likes_count_delete` AFTER DELETE ON `post_likes` FOR EACH ROW BEGIN
                    UPDATE posts SET likes = (
                        SELECT COUNT(*) FROM post_likes WHERE post_id = OLD.post_id
                    ) WHERE id = OLD.post_id;
                END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `post_media`
--

CREATE TABLE `post_media` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `media_data` longblob NOT NULL,
  `media_type` varchar(50) NOT NULL,
  `media_filename` varchar(255) NOT NULL,
  `media_size` int(11) NOT NULL,
  `media_order` tinyint(4) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `post_saves`
--

CREATE TABLE `post_saves` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `post_saves`
--

INSERT INTO `post_saves` (`id`, `post_id`, `user_id`, `created_at`) VALUES
(1, 24, 9, '2025-09-08 17:23:39'),
(2, 25, 9, '2025-09-08 17:24:17'),
(3, 20, 9, '2025-09-08 17:24:33'),
(5, 28, 9, '2025-09-08 17:43:50'),
(6, 30, 9, '2025-09-08 18:06:12'),
(7, 26, 9, '2025-09-08 18:06:49'),
(9, 31, 10, '2025-09-08 22:36:16'),
(10, 30, 10, '2025-09-08 22:36:34'),
(11, 29, 10, '2025-09-08 22:36:36'),
(12, 31, 11, '2025-09-08 23:40:11'),
(13, 33, 12, '2025-10-01 19:21:42'),
(14, 31, 12, '2025-10-01 19:22:20'),
(16, 39, 13, '2025-10-05 06:34:58'),
(17, 37, 21, '2025-10-06 15:15:32'),
(18, 45, 23, '2025-10-06 15:35:32'),
(19, 48, 22, '2025-10-07 22:37:32');

-- --------------------------------------------------------

--
-- Estrutura para tabela `schema_migrations`
--

CREATE TABLE `schema_migrations` (
  `id` int(11) NOT NULL,
  `migration` varchar(255) NOT NULL,
  `run_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `schema_migrations`
--

INSERT INTO `schema_migrations` (`id`, `migration`, `run_at`) VALUES
(1, '001_create_schema_basics.php', '2025-09-02 21:42:38'),
(2, '002_indexes_constraints.php', '2025-09-02 21:42:39'),
(3, '003_user_tokens.php', '2025-09-02 21:42:41'),
(4, '004_create_user_follows.php', '2025-09-08 00:22:57'),
(5, '005_create_post_saves.php', '2025-09-08 20:21:09'),
(6, '006_create_notifications.php', '2025-09-26 20:32:06'),
(7, '007_add_user_profile_fields.php', '2025-09-26 20:32:06'),
(8, '008_create_events_system.php', '2025-09-26 20:32:06'),
(9, '009_upgrade_conversations_and_groups.php', '2025-09-26 20:32:22'),
(10, '010_build_community_groups.php', '2025-09-26 20:32:46'),
(11, '011_create_subscriptions_and_courses.php', '2025-09-26 20:33:44'),
(12, '012_add_promoted_posts_and_ads.php', '2025-09-26 20:33:57'),
(13, '013_extend_notifications.php', '2025-09-26 20:33:57'),
(14, '014_patch_message_schema.php', '2025-10-01 19:44:08'),
(15, '015_enhance_message_receipts.php', '2025-10-05 01:42:03'),
(16, '016_add_user_cover_image.php', '2025-10-05 02:12:07'),
(17, '017_add_notifications_status.php', '2025-10-07 02:39:24'),
(18, '018_add_user_foto_perfil.php', '2025-10-07 02:39:24'),
(19, '019_create_grupo_posts.php', '2025-10-07 02:39:24'),
(20, '020_seed_intro_course.php', '2025-10-13 00:20:51');

-- --------------------------------------------------------

--
-- Estrutura para tabela `subscription_plans`
--

CREATE TABLE `subscription_plans` (
  `id` int(11) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `valor_mensal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `moeda` varchar(10) NOT NULL DEFAULT 'BRL',
  `limite_anuncios_semana` int(11) DEFAULT NULL,
  `acesso_grupos` tinyint(1) NOT NULL DEFAULT 0,
  `acesso_cursos` tinyint(1) NOT NULL DEFAULT 0,
  `anuncios_promovidos` tinyint(1) NOT NULL DEFAULT 0,
  `beneficios` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`beneficios`)),
  `destaque` tinyint(1) NOT NULL DEFAULT 0,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `ordem` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `subscription_plans`
--

INSERT INTO `subscription_plans` (`id`, `slug`, `nome`, `descricao`, `valor_mensal`, `moeda`, `limite_anuncios_semana`, `acesso_grupos`, `acesso_cursos`, `anuncios_promovidos`, `beneficios`, `destaque`, `ativo`, `ordem`, `created_at`, `updated_at`) VALUES
(1, 'plano-essencial', 'Essencial', 'Até 5 anúncios simultâneos por semana e acesso às comunidades exclusivas.', 30.00, 'BRL', 5, 1, 0, 1, '[\"Até 5 anúncios simultâneos por semana\",\"Acesso a grupos exclusivos da comunidade\",\"Badge Essencial no perfil\"]', 0, 1, 1, '2025-09-26 20:33:41', '2025-09-26 20:33:41'),
(2, 'plano-premium', 'Premium', 'Mais de 10 anúncios simultâneos, acesso aos cursos e destaque na plataforma.', 50.00, 'BRL', 10, 1, 1, 1, '[\"Anuncie com campanhas ilimitadas (fair-use)\",\"Acesso completo aos cursos e trilhas\",\"Prioridade em destaque de eventos e comunidades\",\"Badge Premium no perfil\"]', 1, 1, 2, '2025-09-26 20:33:41', '2025-09-26 20:33:41');

-- --------------------------------------------------------

--
-- Estrutura para tabela `subscription_transactions`
--

CREATE TABLE `subscription_transactions` (
  `id` int(11) NOT NULL,
  `subscription_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `moeda` varchar(10) NOT NULL DEFAULT 'BRL',
  `status` enum('pendente','pago','falhou','estornado') NOT NULL DEFAULT 'pendente',
  `referencia_gateway` varchar(255) DEFAULT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payload`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `subscription_transactions`
--

INSERT INTO `subscription_transactions` (`id`, `subscription_id`, `user_id`, `plan_id`, `valor`, `moeda`, `status`, `referencia_gateway`, `payload`, `created_at`, `updated_at`) VALUES
(1, 1, 11, 2, 50.00, 'BRL', 'pago', NULL, '{\"auto_renova\":true}', '2025-09-27 00:20:37', '2025-09-27 00:20:37'),
(2, 2, 10, 2, 50.00, 'BRL', 'pago', NULL, '{\"auto_renova\":true}', '2025-10-02 02:18:03', '2025-10-02 02:18:03'),
(3, 3, 24, 2, 50.00, 'BRL', 'pago', NULL, '{\"auto_renova\":true}', '2025-10-07 15:14:51', '2025-10-07 15:14:51'),
(4, 4, 13, 2, 50.00, 'BRL', 'pago', NULL, '{\"auto_renova\":true}', '2025-10-12 20:28:58', '2025-10-12 20:28:58'),
(5, 5, 1, 2, 50.00, 'BRL', 'pago', NULL, '{\"auto_renova\":true}', '2025-10-13 02:46:18', '2025-10-13 02:46:18');

-- --------------------------------------------------------

--
-- Estrutura para tabela `user_follows`
--

CREATE TABLE `user_follows` (
  `follower_id` int(11) NOT NULL,
  `followed_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `user_follows`
--

INSERT INTO `user_follows` (`follower_id`, `followed_id`, `created_at`) VALUES
(1, 17, '2025-10-08 03:07:25'),
(1, 22, '2025-10-08 10:35:23'),
(1, 24, '2025-10-08 03:07:36'),
(1, 25, '2025-10-08 03:07:11'),
(9, 5, '2025-09-08 17:24:41'),
(9, 6, '2025-09-08 16:45:54'),
(9, 7, '2025-09-08 17:23:29'),
(10, 6, '2025-09-08 22:54:03'),
(10, 9, '2025-09-08 22:54:31'),
(10, 11, '2025-09-26 14:48:03'),
(10, 12, '2025-10-01 19:52:15'),
(11, 9, '2025-09-26 16:31:54'),
(11, 10, '2025-09-08 23:38:22'),
(11, 12, '2025-10-04 23:15:29'),
(11, 13, '2025-10-05 06:23:02'),
(11, 15, '2025-10-05 12:56:27'),
(11, 16, '2025-10-08 02:27:59'),
(11, 18, '2025-10-05 12:55:58'),
(11, 23, '2025-10-07 15:08:31'),
(12, 10, '2025-10-01 19:21:46'),
(12, 11, '2025-10-01 19:21:48'),
(13, 1, '2025-10-13 14:49:16'),
(13, 10, '2025-10-05 06:33:35'),
(13, 11, '2025-10-05 06:17:32'),
(13, 18, '2025-10-05 17:33:57'),
(13, 21, '2025-10-13 14:56:00'),
(13, 22, '2025-10-13 14:55:04'),
(14, 13, '2025-10-05 10:59:36'),
(15, 11, '2025-10-08 02:34:19'),
(17, 18, '2025-10-06 15:16:34'),
(17, 21, '2025-10-06 15:17:36'),
(21, 1, '2025-10-13 15:02:00'),
(21, 11, '2025-10-06 15:07:58'),
(21, 13, '2025-10-13 15:00:27'),
(21, 17, '2025-10-06 15:18:57'),
(21, 22, '2025-10-07 22:30:46'),
(21, 23, '2025-10-07 15:38:25'),
(21, 24, '2025-10-07 15:40:40'),
(21, 25, '2025-10-13 15:02:04'),
(22, 1, '2025-10-08 23:34:30'),
(22, 13, '2025-10-13 14:57:06'),
(22, 17, '2025-10-07 22:24:05'),
(22, 21, '2025-10-07 22:24:02'),
(22, 23, '2025-10-07 22:22:27'),
(22, 25, '2025-10-08 00:05:28'),
(23, 11, '2025-10-07 15:29:33'),
(23, 17, '2025-10-07 15:32:21'),
(23, 21, '2025-10-06 15:39:17'),
(23, 22, '2025-10-07 22:31:45'),
(23, 24, '2025-10-07 15:32:50'),
(24, 10, '2025-10-07 15:21:47'),
(24, 17, '2025-10-07 15:26:48'),
(24, 23, '2025-10-07 15:35:21'),
(25, 17, '2025-10-08 00:21:24'),
(25, 22, '2025-10-08 00:08:38');

-- --------------------------------------------------------

--
-- Estrutura para tabela `user_subscriptions`
--

CREATE TABLE `user_subscriptions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `status` enum('ativa','pendente','cancelada','expirada') NOT NULL DEFAULT 'pendente',
  `starts_at` datetime NOT NULL,
  `expires_at` datetime NOT NULL,
  `auto_renova` tinyint(1) NOT NULL DEFAULT 1,
  `cancel_requested_at` datetime DEFAULT NULL,
  `canceled_at` datetime DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `user_subscriptions`
--

INSERT INTO `user_subscriptions` (`id`, `user_id`, `plan_id`, `status`, `starts_at`, `expires_at`, `auto_renova`, `cancel_requested_at`, `canceled_at`, `metadata`, `created_at`, `updated_at`) VALUES
(1, 11, 2, 'ativa', '2025-09-26 21:20:36', '2025-10-26 21:20:36', 1, NULL, NULL, NULL, '2025-09-27 00:20:36', '2025-09-27 00:20:36'),
(2, 10, 2, 'ativa', '2025-10-01 23:18:03', '2025-10-31 23:18:03', 1, NULL, NULL, NULL, '2025-10-02 02:18:03', '2025-10-02 02:18:03'),
(3, 24, 2, 'ativa', '2025-10-07 12:14:51', '2025-11-06 12:14:51', 1, NULL, NULL, NULL, '2025-10-07 15:14:51', '2025-10-07 15:14:51'),
(4, 13, 2, 'ativa', '2025-10-12 17:28:58', '2025-11-11 17:28:58', 1, NULL, NULL, NULL, '2025-10-12 20:28:58', '2025-10-12 20:28:58'),
(5, 1, 2, 'ativa', '2025-10-12 23:46:18', '2025-11-11 23:46:18', 1, NULL, NULL, NULL, '2025-10-13 02:46:18', '2025-10-13 02:46:18');

-- --------------------------------------------------------

--
-- Estrutura para tabela `user_tokens`
--

CREATE TABLE `user_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `type` enum('email_verification','password_reset','refresh') NOT NULL,
  `expires_at` datetime DEFAULT NULL,
  `revoked` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `user_tokens`
--

INSERT INTO `user_tokens` (`id`, `user_id`, `token`, `type`, `expires_at`, `revoked`, `created_at`) VALUES
(1, 6, 'eb3f4e4cd89fac6ed14db4848e3cb273dbcbf342018e931e53608987e0833e18', 'email_verification', '2025-09-03 19:20:53', 0, '2025-09-02 22:20:53'),
(2, 6, '222de2d91f315144693813da9667f0f66130ecd3ccfa566fd202d5f272af72f1', 'refresh', '2025-10-02 19:21:00', 0, '2025-09-02 22:21:00'),
(3, 7, 'e05ad58393dac209dc87b0125090cd293f3ffb43b96234f56d1e0c8cdd4dfa3a', 'email_verification', '2025-09-03 20:47:42', 0, '2025-09-02 23:47:42'),
(4, 7, '390b2ac737af1d0912fd10611abf5c778b7080275dc5662ada1155b183834591', 'refresh', '2025-10-02 20:47:46', 0, '2025-09-02 23:47:46'),
(5, 8, 'ac2a9330e651ce4a953bdae84650b0576645433e13675d38f9623325bbe5c916', 'email_verification', '2025-09-03 22:32:04', 0, '2025-09-03 01:32:04'),
(6, 8, 'a5b30f318f45cdc8e9cacfcefbebfe863d10aa57bfe08107c0692ee210641caa', 'refresh', '2025-10-02 22:32:09', 0, '2025-09-03 01:32:09'),
(7, 9, '3242d655112dc7b8c38968256a4509e11288a505fc4c4fb5b9be7fbc532f25e8', 'email_verification', '2025-09-08 20:24:04', 0, '2025-09-07 23:24:04'),
(8, 9, 'fab53e07746eeda17216fa359ab133af9e985ca1571afab2be859c3386b522ae', 'refresh', '2025-10-07 20:24:17', 0, '2025-09-07 23:24:17'),
(9, 9, '2adb0565aa0c3e37ed430268fb6b444295ccf8c30c3df99375b1044903e1afe4', 'refresh', '2025-10-08 18:09:05', 0, '2025-09-08 21:09:06'),
(10, 9, '3b1bc9456937c5ab9cc868daa451c2aa382d076445854490b2f197f61eb51045', 'refresh', '2025-10-08 18:43:50', 0, '2025-09-08 21:43:50'),
(11, 9, 'db296532dd26fcba48a74bac5da27eb2262e8d40880c9542e5e9378a038f4d0a', 'refresh', '2025-10-08 18:53:55', 0, '2025-09-08 21:53:55'),
(12, 9, '05dde9577b9fcde448fb484299b497f1d0f2384c02deb0ec033592209d80cdc4', 'refresh', '2025-10-08 19:00:24', 0, '2025-09-08 22:00:24'),
(13, 9, 'ceb0e9887ad279554416bb800b19c98ecf2373b8ec0ed6ef96c2902ee5c487d4', 'refresh', '2025-10-08 19:33:25', 0, '2025-09-08 22:33:25'),
(14, 9, '04e07014762c5f7824d8e80dc35636c551642b4385aa1cec5bdb171970e3a528', 'refresh', '2025-10-08 19:35:28', 0, '2025-09-08 22:35:28'),
(15, 9, '24c18ab80e95bb5ff901a4375a33a25f92e4e6c31f97d3488884f994fafc2e67', 'refresh', '2025-10-08 19:50:03', 0, '2025-09-08 22:50:03'),
(16, 10, 'd3e2370210b2c53b2f5f811fdb53c9a6faaae15b103c2fdeaedbc13be01bd96c', 'email_verification', '2025-09-09 19:57:55', 0, '2025-09-08 22:57:55'),
(17, 10, '8f526f643e2027a7a2d1240341e17390f61f6f3c41de8b3a785f0e35909ebf72', 'refresh', '2025-10-08 19:58:08', 0, '2025-09-08 22:58:08'),
(18, 10, '0aec0e2c4f94da744059cd3495ffe4276a020cdacc9d62d343df54850a07ff13', 'refresh', '2025-10-08 20:33:49', 0, '2025-09-08 23:33:49'),
(19, 10, '0a1d93f87e927325cf6469919e65d8fcf3a88841714bfba9bab202cebb8516b7', 'refresh', '2025-10-08 22:22:33', 0, '2025-09-09 01:22:33'),
(20, 10, 'f438af518ca46b40d9761b4995d2f0acb87a39dd0188b2140ad7b4002ebaca70', 'refresh', '2025-10-08 23:34:18', 0, '2025-09-09 02:34:18'),
(21, 11, '1b33b0cd93cd06054ee7c9778a0bd806770f7de5916230e584287c7eb9ea9a70', 'email_verification', '2025-09-09 23:37:39', 0, '2025-09-09 02:37:39'),
(22, 11, '506f74fa58683df271fbb4b4bbebacedaaec7df054c4ac9ba94ecbf07d35c386', 'refresh', '2025-10-08 23:37:48', 0, '2025-09-09 02:37:48'),
(23, 11, 'f271f8646539f5c66ebb25de059cda38147c39ea0f6b5f3d5747c027da9507c1', 'refresh', '2025-10-24 18:01:53', 0, '2025-09-24 21:01:53'),
(24, 10, 'a9532740b4f3cb614f6c98ba8bdbbc2a19bf9ad9b7f3dcd398a8db71471c2faf', 'refresh', '2025-10-26 14:47:55', 0, '2025-09-26 17:47:55'),
(25, 11, '9cc562af97cbd689d3d3249645e87565f116d71ddf197d8718da9b25262c9eab', 'refresh', '2025-10-26 16:31:22', 0, '2025-09-26 19:31:22'),
(26, 10, 'b24e97f6a4551cb1f72831b8e8ca8446eb12bf35477c37a87834bdb7812eec76', 'refresh', '2025-10-26 16:32:29', 0, '2025-09-26 19:32:29'),
(27, 11, 'e76be920ba5b5aad226cc0b658b4157040d03c105279dd6b7e0ff1547096702e', 'refresh', '2025-10-26 20:37:32', 0, '2025-09-26 23:37:33'),
(28, 10, '687294a16412c95c446dadd40a88cda62c58250ce2d135d95b8e85370ad7cf1b', 'refresh', '2025-10-31 17:55:17', 0, '2025-10-01 20:55:17'),
(29, 11, 'aca2649df47844978021d7a1572af5c0240d20f38331c11086166bcc8bb48874', 'refresh', '2025-10-31 18:08:41', 0, '2025-10-01 21:08:41'),
(30, 10, '985f3a3c1767b8ec4c6d05f1044a4f72fa9487b8bced70ad991a9e18f994d55f', 'refresh', '2025-10-31 18:09:21', 0, '2025-10-01 21:09:21'),
(31, 11, '46f54684a5bf9545252a8b581b26dd0388853953678e1f5ba140449913f35bfd', 'refresh', '2025-10-31 18:24:00', 0, '2025-10-01 21:24:00'),
(32, 12, '90ef2a10868f2e6a14e17e4cabf62a22302332c37203a11c0f2acacec2c7fe8a', 'email_verification', '2025-10-02 19:02:42', 0, '2025-10-01 22:02:42'),
(33, 12, '44341516a772e079b726ace6eb8a9d7a5d8935be3f391d0c323f93812e9da28d', 'refresh', '2025-10-31 19:02:51', 0, '2025-10-01 22:02:51'),
(34, 10, '9a3e04e0805cbecb8f6e3d8b4a2b02fc49d7c10348a35dd346b07de3895ea8d6', 'refresh', '2025-10-31 19:23:15', 0, '2025-10-01 22:23:15'),
(35, 11, 'b096e9440d555950503296d8e8e81d7cfbe236d0b929cf2abeebd68c99ce889f', 'refresh', '2025-10-31 21:47:43', 0, '2025-10-02 00:47:43'),
(36, 11, '28f5f84194331739721bb7e496bc5981523dea152b54a5d72b6347e20190d1dd', 'refresh', '2025-11-03 20:09:19', 0, '2025-10-04 23:09:19'),
(37, 11, 'b523d68cbb8b6eee990ce99c67ffe3875bfb76f5528191ec2d7339668a9af040', 'refresh', '2025-11-04 03:14:22', 0, '2025-10-05 06:14:22'),
(38, 13, 'f49008c7830cc0eca13812995374a643b457090fe3534c9986a40470cee548d1', 'email_verification', '2025-10-06 03:16:59', 1, '2025-10-05 06:16:59'),
(39, 13, '261e68406b704edc4812407bcd36b346a88df212472a2b480a46d9ac16989dba', 'refresh', '2025-11-04 03:17:03', 0, '2025-10-05 06:17:03'),
(40, 11, '7ad341178ea9f61dfcb5680395c19c932134d5ba1a57f24dd6d884fcff846253', 'refresh', '2025-11-04 03:20:50', 0, '2025-10-05 06:20:50'),
(41, 13, '74064e5f841e560eb3b82dcd0d34997a609fa4967c567df5adefa33ea8ef31db', 'refresh', '2025-11-04 03:23:24', 0, '2025-10-05 06:23:24'),
(42, 11, '1e17b5390f57a3fc8bdcdbb880ebe5da80f0c94925951caab4a9f65f5379c0a3', 'refresh', '2025-11-04 04:01:55', 0, '2025-10-05 07:01:55'),
(43, 14, 'ae0b13527e6655fd959de900910b09df49049528a048cccaa2e0509f7a184c52', 'email_verification', '2025-10-06 07:59:15', 0, '2025-10-05 10:59:15'),
(44, 14, '7247ac9a02bfcad072057ae210bfcfbfa30fd54a5c7f2074fbb3dde72dfb33bd', 'refresh', '2025-11-04 07:59:19', 0, '2025-10-05 10:59:19'),
(45, 15, '19d394a8defacedc2e514eee525684010ab64735f40b5c16283f3c39d9eaf862', 'email_verification', '2025-10-06 08:28:50', 1, '2025-10-05 11:28:50'),
(46, 15, 'de9f6f2eeb72770e1fed39438d44ad85532798e77266426109f012dae249355f', 'refresh', '2025-11-04 08:28:55', 0, '2025-10-05 11:28:55'),
(47, 16, '441043b8a17c8dfe9af457386a259cf6d366898d94df962232fa58b0a6ee681f', 'email_verification', '2025-10-06 08:47:59', 0, '2025-10-05 11:47:59'),
(48, 16, '7e7625d4820b123a94f7df89ba534adcdcd8f2b5961c54d6680ff988327d3f1f', 'refresh', '2025-11-04 08:48:02', 0, '2025-10-05 11:48:02'),
(49, 17, '3b6e83f3d3837c19a9fc6da11285d517b0fe352b44d9d22f3869b2d008849933', 'email_verification', '2025-10-06 08:56:05', 0, '2025-10-05 11:56:05'),
(50, 17, '30564e6c275b5cda33d563e38e5f79edf9f5a76573e3e458b629c2c0d3f604ff', 'refresh', '2025-11-04 08:56:08', 0, '2025-10-05 11:56:08'),
(51, 18, 'eb45e9849496c352296a832a619fe327349b4a88775d5ddcf33d37122432bd80', 'email_verification', '2025-10-06 09:17:26', 1, '2025-10-05 12:17:26'),
(52, 18, '6a02f7a8e4ab02cf2e4195096e51081dd136593aac0452a7d263e578f5aecba2', 'refresh', '2025-11-04 09:17:29', 0, '2025-10-05 12:17:29'),
(53, 11, 'e29eda15ac5aabc3826896396c1d0368982b42cb3835a33c0094c85d82479d96', 'refresh', '2025-11-04 09:55:45', 0, '2025-10-05 12:55:45'),
(54, 11, '4ea6ac2d5869c67abb39ca5317760a7f3acac57a843a3f85acf5ad853393632d', 'refresh', '2025-11-04 10:01:35', 0, '2025-10-05 13:01:35'),
(55, 19, '7b3c2ca1c71bd84b8c0988faf24071c112332511b7ce76feaa831e0577a817c5', 'email_verification', '2025-10-06 10:09:01', 0, '2025-10-05 13:09:01'),
(56, 19, '13a86ec3d232fc79d8a8de85fe68c9b334560e280c55e0154203758ec0b89977', 'refresh', '2025-11-04 10:09:04', 0, '2025-10-05 13:09:04'),
(57, 20, 'f0bbd4f670a7d804b1f0e293561d7898fff01a26f06d040aafdeaf82613b1f18', 'email_verification', '2025-10-06 10:10:03', 0, '2025-10-05 13:10:03'),
(58, 20, '8a3890205c98982cd67c0797e70125dad58a442a672982050445f7b2e337c8b0', 'refresh', '2025-11-04 10:10:06', 0, '2025-10-05 13:10:06'),
(59, 13, '620e97d24b0f9672188f68ede14d5ced04dc20af3e71fef7b63889800f1d4c47', 'refresh', '2025-11-04 14:33:21', 0, '2025-10-05 17:33:21'),
(60, 11, '76f8c2eae69b94d36755324834703c0c2910ff0303ae6412d6b615eff1133825', 'refresh', '2025-11-04 22:56:52', 0, '2025-10-06 01:56:52'),
(61, 21, 'd6c00e4496ef2c84a6ac5469e3b7660f945c1e5b267a3abf8ebffb22721f4bbd', 'email_verification', '2025-10-07 12:01:45', 1, '2025-10-06 15:01:45'),
(62, 21, '2b64c6b80e6c5eef290060057bfc6715b0dbdd52261ba74a100763b2d001733d', 'refresh', '2025-11-05 12:01:49', 0, '2025-10-06 15:01:49'),
(63, 11, 'd1e8ee823de632ca28c1d546ca16e2c6f451503cc75d2ff2dc76c69772112aea', 'refresh', '2025-11-05 12:10:36', 0, '2025-10-06 15:10:36'),
(64, 21, 'bfe009ec37dd8b3b398972d73b5d5430b9ead6293795a0f72a4783711679c940', 'refresh', '2025-11-05 12:11:52', 0, '2025-10-06 15:11:52'),
(65, 17, '915fe90bcda6111b27c9ef66e1b7f7a3de18c3994c09a60d818bfaa526d1cf95', 'refresh', '2025-11-05 12:14:42', 0, '2025-10-06 15:14:42'),
(66, 22, 'c114f6eed469cf24ceb190bd115a14929918e830e314bf717d126de02201a504', 'email_verification', '2025-10-07 12:23:18', 1, '2025-10-06 15:23:18'),
(67, 22, '16315fad6c734f8f7b6cb0a0b90fbed81d60164ef12fafc7fb0d150c8e0a275d', 'refresh', '2025-11-05 12:23:22', 0, '2025-10-06 15:23:22'),
(68, 23, '9d0b47327851e28849ac47281812e1445f8b327e1fa7e51e083dd4e70434645e', 'email_verification', '2025-10-07 12:30:58', 1, '2025-10-06 15:30:58'),
(69, 23, '749e305402871ee2ad5fd5665a5bfbd12ac6f928effbaaa85432491335398b0b', 'refresh', '2025-11-05 12:31:01', 0, '2025-10-06 15:31:01'),
(70, 11, 'e0f615f9204af8bdabdba676f26d01a97254c1d2ce81ee8f7e13dc7b08aa2cc5', 'refresh', '2025-11-06 12:07:26', 0, '2025-10-07 15:07:26'),
(71, 24, 'a73ad4a9648e09dc7188b52b3714c6a5edfafaf12e7e939e9ce5feabe02b075c', 'email_verification', '2025-10-08 12:10:20', 1, '2025-10-07 15:10:20'),
(72, 24, 'fecaf2204c78ed5fa7a14d56955c9c6c3f15c64f53c57eb1097dddb65aaf69a0', 'refresh', '2025-11-06 12:10:23', 0, '2025-10-07 15:10:23'),
(73, 21, '92cdc6efb0943601c33bd53c4f15bc701dda726b5028cdb756bc984f015d8683', 'refresh', '2025-11-06 12:24:15', 0, '2025-10-07 15:24:15'),
(74, 17, 'e1f069e987104d66c44b59a3b6d4bd27f8753894ff8b104aa1c886603d1d07b8', 'refresh', '2025-11-06 12:24:18', 0, '2025-10-07 15:24:18'),
(75, 23, '1fc6c9e1a7c5643105c9eca30b7984de58b44966cd838211a2acf6dc5a3ffc8e', 'refresh', '2025-11-06 12:28:03', 0, '2025-10-07 15:28:03'),
(76, 21, 'cf870b3b22fec2a7845b17e6757b31be6249b741aafcc927ffa5c5502b3d3ab3', 'refresh', '2025-11-06 12:37:52', 0, '2025-10-07 15:37:52'),
(77, 21, 'ec71fcf9f3501014ad4cd4aedc9a97b353aec7740ae6a00387c3c42f7e39db27', 'refresh', '2025-11-06 19:07:20', 0, '2025-10-07 22:07:20'),
(78, 22, '81efc877aa7f6b5ca36b6ce4666363142007155037308fe1b218457e91fb7ab2', 'refresh', '2025-11-06 19:17:33', 0, '2025-10-07 22:17:33'),
(79, 21, '6d59813e095569eface7ee982ad349077d042c9853cf6e4f138c640619838477', 'refresh', '2025-11-06 19:30:35', 0, '2025-10-07 22:30:35'),
(80, 23, '8789779addbb06354f4d2f8e273b961c227b7a298a7317379f891dd62f604a56', 'refresh', '2025-11-06 19:31:32', 0, '2025-10-07 22:31:32'),
(81, 22, 'de996fdc25f5ddf741c936b3ae5373624fed4b65823ab3e94764649308790c43', 'refresh', '2025-11-06 19:35:30', 0, '2025-10-07 22:35:30'),
(82, 22, '3a600918064847f1716f0f70d66a92dc0ce587ecde0bcce9aefe2cef5cf47def', 'refresh', '2025-11-06 20:54:57', 0, '2025-10-07 23:54:57'),
(83, 25, '8e709108af4aa7f9dba38d8e4c851fc8e6c52d2a8dec3fd6aca570bca0285818', 'email_verification', '2025-10-08 20:58:18', 1, '2025-10-07 23:58:18'),
(84, 25, '3283c5dae4d5754988015847a895dcf06d8c1a975e1809c132b210e1f80e4e2d', 'refresh', '2025-11-06 20:58:22', 0, '2025-10-07 23:58:22'),
(85, 11, '7bb65119b4cd42635d30e0381b698149e136ab646046ce9a0d26283935b8aa07', 'refresh', '2025-11-06 23:22:36', 0, '2025-10-08 02:22:36'),
(86, 15, '9c58b4c8ee78c9efe7ac31a7c065202bd41f2fae9fc2824aaed872829d3e398a', 'password_reset', '2025-10-08 00:32:53', 1, '2025-10-08 02:32:53'),
(87, 1, '961ca2615afad21738564f6b9aaccfe5d78527c8f2bc50861b0cac3ae7d293c3', 'password_reset', '2025-10-08 00:32:54', 1, '2025-10-08 02:32:54'),
(88, 15, '33b80d30184adb16fa7a8c46ad430dddc55c46e1ff4e55ab4476e469d195d290', 'refresh', '2025-11-06 23:33:59', 0, '2025-10-08 02:33:59'),
(89, 1, '8c3d843a2e34a04d5a1b733b7f9999fe8f5438e1fc727d26351161b907f659ee', 'refresh', '2025-11-06 23:34:19', 0, '2025-10-08 02:34:19'),
(90, 1, 'ed96e7ac8fafa41e0655c00ddda9b1f5ac3218afa01079d4aae9fe7441473756', 'refresh', '2025-11-07 07:33:20', 0, '2025-10-08 10:33:20'),
(91, 21, '19a0961cfbbda5077e3c385c4e46a2e48d59abd12374938152f78a6a53dcde6d', 'refresh', '2025-11-07 07:35:08', 0, '2025-10-08 10:35:08'),
(92, 13, '9f66dd2900c52b6c5a380c2ce5b0807c1776c907e82dc19da0d909f19fc65338', 'refresh', '2025-11-11 17:18:26', 0, '2025-10-12 20:18:26'),
(93, 13, '3a7708a436193a684c6ba54edf294b5466bb487a3eec470390666866863ec419', 'refresh', '2025-11-11 22:08:37', 0, '2025-10-13 01:08:37'),
(94, 13, '0c848689cd1e730d5e07c09075a2d949eab8954c231dfb0274dbcaad771e4fd1', 'refresh', '2025-11-12 11:30:29', 0, '2025-10-13 14:30:29'),
(95, 13, 'a501466c42b096a36449c34e40efb9030d1febe9a805b080169026764ab9fc98', 'refresh', '2025-11-12 11:31:48', 0, '2025-10-13 14:31:48'),
(96, 13, 'ed2ee798ac67f67c3d15c1c98e6906792955b19657c1c4ef27c24e33427cb306', 'refresh', '2025-11-12 11:57:13', 0, '2025-10-13 14:57:13'),
(97, 21, 'abf348b0314a660b75fc0fca23a33ef74f10c16fc6040de66931211fa9b9467b', 'refresh', '2025-11-12 12:00:17', 0, '2025-10-13 15:00:17');

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `verified` tinyint(1) NOT NULL DEFAULT 0,
  `telefone` varchar(20) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `localizacao` varchar(255) DEFAULT NULL,
  `tipo` enum('empreendedora','cliente') NOT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `foto_perfil` varchar(255) DEFAULT NULL,
  `capa_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `nome`, `username`, `email`, `senha`, `verified`, `telefone`, `bio`, `website`, `localizacao`, `tipo`, `avatar_url`, `foto_perfil`, `capa_url`, `created_at`, `updated_at`) VALUES
(1, 'murilo', 'boreal', 'murisud15@gmail.com', '$2y$10$W.1M4q5twdt/DNjqAxOMOO8ImxUuwIO0nR02BR7fLGRtv3sl/g3Su', 0, '11930850009', 'Há 10 anos empreendendo e amando a profissão.', 'https://www.taylorswift.com', 'Salt Lake City', 'empreendedora', '/images/pfp/user/68e5cdda03331_1759890906.png', NULL, '/images/covers/user/68e5d523c4dc6_1759892771.jpeg', '2025-06-24 03:19:32', '2025-10-08 03:06:11'),
(4, 'dui', 'dui', 'giovanna@gmail.com', '$2y$10$zX7vJcaNy4OaJRsJftruuuTrMFZG/erAZtiMqyWySdjtnjl2Nsuo.', 0, '1191234567', 'hii', NULL, NULL, 'empreendedora', '/images/pfp/user/68840f7b84a6b_1753485179.jpg', NULL, NULL, '2025-07-15 01:54:31', '2025-07-25 23:12:59'),
(5, 'more', 'more', 'vivi@gmail.com', '$2y$10$87YSeobQCWXYol03cEQgX.RrAJ5GRTQKV/rNPdZQxxzc3N7gBHMVm', 0, '(11) 98283-3435', 'kgykiugtt', NULL, NULL, 'empreendedora', '/images/pfp/user/68b6426dd2aa2_1756775021.jpg', NULL, NULL, '2025-08-20 00:05:04', '2025-09-02 01:04:33'),
(6, 'Marise Rezende Barbosa Jusevicius', 'mariserezendebarbosajusevicius', 'gaga@gmail.com', '$2y$10$78s1o9Pl927o0ifXfM5X9eOJenycKXPw/WD60c9F/stHxsC6T77qK', 0, '11982833435', 'dhdtjyjyk', NULL, NULL, 'empreendedora', '/images/pfp/user/68b77034e5974_1756852276.jpg', NULL, NULL, '2025-09-02 22:20:53', '2025-09-02 22:31:17'),
(7, 'Matheus Miranda', 'matheusmiranda', 'matheusmiranda02@gmail.com', '$2y$10$lgYsSLQjT8p0CHPSua.Ki.Gs1XCt79WA6CUttBVKH4I7U2yU8jmLu', 0, '11902289225', 'Não gosto', NULL, NULL, 'empreendedora', '/placeholder.svg?height=40&width=40', NULL, NULL, '2025-09-02 23:47:42', '2025-09-02 23:47:42'),
(8, 'Gabruel Araujo', 'gabruelaraujo', 'gabsaraujo@gmail.com', '$2y$10$7INugAf.lF9VGjd16jl9iOwGD8/sdFwzVZju8qZBBDptgNWkPA1G.', 0, '11988965098', 'ulalala', NULL, NULL, 'empreendedora', '/placeholder.svg?height=40&width=40', NULL, NULL, '2025-09-03 01:32:04', '2025-09-03 01:32:04'),
(9, 'Giovanna Salles Arruda', 'giovannasallesarruda', 'gigi_salles@gmail.com', '$2y$10$9fwoUUYNW8nNWVvZOXn.9uLLO1hLepmFV5BytEOhXS3F/YOEGGiZ6', 0, '11940314316', 'As vezes curto assitir a algumas séries', NULL, NULL, 'empreendedora', '/images/pfp/user/68be2b6f974fd_1757293423.jpg', NULL, NULL, '2025-09-07 23:23:56', '2025-09-08 01:03:44'),
(10, 'Mariana Lobo Nascimento', 'marianalobonascimento', 'mari.lobao@etec.sp.gov.br', '$2y$10$nAHW4TZ02R6F3zABOYA.pORg30.6wy0Kj0xzmiWVw7taXFTDU05yC', 0, '11950710210', 'sou fa da Lana e gosto de gato', '', '', 'empreendedora', '/images/pfp/user/68bf8470d7616_1757381744.jpg', NULL, NULL, '2025-09-08 22:57:55', '2025-09-09 01:53:06'),
(11, 'Taylor', 'muribs', 'taylor@gmail.com', '$2y$10$yuTJeHYtDLAXzer6Elj9weuJQqZy93dQ89CkDKtF9Wf6HdKB6Q72m', 0, '11987562560', 'Sou cantora e artista multipremiada', 'https://marketplace.empowerup.com.br/taylorswift', '', 'empreendedora', '/images/pfp/user/68bf9369566b6_1757385577.jpg', NULL, '/images/covers/user/68e1d502d48eb_1759630594.jpg', '2025-09-09 02:37:39', '2025-10-08 02:29:21'),
(12, 'tanisha', 'tanisha', 'tany@gmail.com', '$2y$10$SJdqICxXTG0Xo47kCVCwFOONvVAHUnx3NRcnHgTet10K0kg2PWf2.', 0, '11987564789', 'oiiiiiiiiiiiiiii', NULL, NULL, 'empreendedora', '/placeholder.svg?height=40&width=40', NULL, NULL, '2025-10-01 22:02:41', '2025-10-01 22:02:41'),
(13, 'Gabriela Garcia', 'gabis_garcia', 'meganmarklesimmer@gmail.com', '$2y$10$3C2nUgUXfdKNoaR64KW9I.SY/WvJd9ECnKPuXq/fHuXIpo8IFPkH.', 1, '11954828364', 'Sou uma garota divertida', '', '', 'empreendedora', '/images/pfp/user/68e20e26d6ca7_1759645222.png', NULL, '/images/covers/user/68e20dec21299_1759645164.jpeg', '2025-10-05 06:16:59', '2025-10-05 06:20:27'),
(14, 'Aurora Verdadeira', 'Auroraamaismais', 'auroraaenterprises@gmail.com', '$2y$10$Mz7tD25y503qm/DJ9OXKWuZ983gue2hj5hr2Md3nkWMhq62mf1H2O', 0, '11959092718', '', NULL, NULL, 'empreendedora', '/placeholder.svg?height=40&width=40', NULL, NULL, '2025-10-05 10:59:15', '2025-10-05 10:59:15'),
(15, 'Mariana Nascimento', 'marinasciiii', 'mariaans.lobo@gmail.com', '$2y$10$E5BLgH0upXfRBMQy.AQ26.UlX7gglR6PaUbDtbpRlKLc.G97CryIa', 1, '11994614611', '🐚', '', 'são paulo', 'empreendedora', '/images/pfp/user/68e257365b98f_1759663926.jpeg', NULL, '/images/covers/user/68e2571adffc8_1759663898.jpeg', '2025-10-05 11:28:50', '2025-10-08 02:33:31'),
(16, 'Leticia Nascimento de Almeida', 'le_almeidan', 'leticia.almeidaaa2008@gmail.com', '$2y$10$iFInJxZ4WxJAQCH8JEUEuuTtMzPdzbhe2G9JGL7Ckd4tvTIbhT7Y.', 0, '55119171686', 'cuid.ai : Auxilio aos idosos com IA', NULL, NULL, 'empreendedora', '/placeholder.svg?height=40&width=40', NULL, NULL, '2025-10-05 11:47:59', '2025-10-05 11:47:59'),
(17, 'Ryllary Victória Barroso', 'Ryll', 'victoriaryllary103@gmail.com', '$2y$10$7OXlAEUPdFcjRYJwyFu76.yOpDTaZ3jru.iiC7MeTIzfOyoVAShsS', 0, '11950899096', 'Sou uma pequena artista que faz comissões a mais de três anos.', '', '', 'empreendedora', '/images/pfp/user/68e53119ead3a_1759850777.jpeg', NULL, '/images/covers/user/68e530f8341c4_1759850744.jpeg', '2025-10-05 11:56:05', '2025-10-07 15:26:22'),
(18, 'Laura Jordão Campos', 'larry', 'laurajordao28@gmail.com', '$2y$10$jJ/Z9IbQkbX2lqsZYDXt3emxCpM57Z4WXNC39Yvs5hDgbU1dZwWWy', 1, '11950874906', '', NULL, NULL, 'empreendedora', '/images/pfp/user/68e262968483c_1759666838.jpeg', NULL, NULL, '2025-10-05 12:17:26', '2025-10-05 12:20:38'),
(19, 'Luana Garcia Mathias', 'luana_gaarcia', 'luanagm04@gmail.com', '$2y$10$MR6kaxvgMLh9M74oiKs7rOogNA5PicCBpYkdFo6h614GZ1N0ysDWy', 0, '62984146179', 'Blogueira', NULL, NULL, 'empreendedora', '/placeholder.svg?height=40&width=40', NULL, NULL, '2025-10-05 13:09:01', '2025-10-05 13:09:01'),
(20, 'Luane Perez Silva', 'luane', 'perezsilvaluane@gmail.com', '$2y$10$ZimUPnIL6WDMSNSdhV1ui.06.N7J/GJocrk1UbaM818/HbDUwi38m', 0, '11954740926', '', NULL, NULL, 'empreendedora', '/placeholder.svg?height=40&width=40', NULL, NULL, '2025-10-05 13:10:03', '2025-10-05 13:10:03'),
(21, 'Fernanda Gonçalves', 'fefegoncalves02', 'rack.araujopereira@gmail.com', '$2y$10$9q6Eck07665Z6h66NwZngeiwyxyp3lOHJ07gtUm.Uj8p4L6H87JyO', 1, '11976559087', 'Sou uma cabeleleira', '', 'Mauá, SP', 'empreendedora', '/images/pfp/user/68e5310534223_1759850757.png', NULL, '/images/covers/user/68e5313c4190e_1759850812.jpg', '2025-10-06 15:01:45', '2025-10-07 15:26:52'),
(22, 'Raquel Araujo', 'gh0stchild_', 'detonator834@gmail.com', '$2y$10$Y6.Xj92vz2523li.DU/qm.56v7bMH3m6MQmnfzOtIsjwe4mw8aV/m', 1, '11957894502', 'Faço desenhos digitais (as vezes)', '', 'Mauá, SP', 'empreendedora', '/images/pfp/user/68e591bf162d9_1759875519.jpg', NULL, '/images/covers/user/68e5926bd9840_1759875691.png', '2025-10-06 15:23:18', '2025-10-07 22:21:31'),
(23, 'Priscila Novaes', 'pitty', 'infernal.nasat@gmail.com', '$2y$10$P3.GY1n5TfKX2AJWIGjsteEc/5lEdJ5GzuQHS/9s8/E1Dc/x63uam', 1, '71984562390', '✨ Cabeleireira e Empreendedora\n✂️ Especialista em cortes, coloração e cuidados capilares\n🏡 Atendimento no meu salão próprio\n📍 Salvador, Bahia', '', 'Salvador, Bahia', 'empreendedora', '/images/pfp/user/68e531cd37cc1_1759850957.png', NULL, '/images/covers/user/68e5331026a50_1759851280.jpg', '2025-10-06 15:30:58', '2025-10-07 15:34:40'),
(24, 'Aline Dantas de Lima', 'Ariana', 'alinedantasdl@gmail.com', '$2y$10$K8YpUXAI.OBEgYEk99odGOg5mdWLX/Zo0S/PFEZwVidEjdKk.yKZ.', 1, '11953044381', 'Sou diva', 'https://marketplace.empowerup.com.br/store/tatoo-pra-elas', 'São Paulo', 'empreendedora', '/images/pfp/user/68e52ecff3790_1759850191.jpeg', NULL, '/images/covers/user/68e52f875967c_1759850375.jpg', '2025-10-07 15:10:20', '2025-10-07 15:19:35'),
(25, 'Lee Chae ryeong', 'ITZYChaeryeong', 'ipbolado70@gmail.com', '$2y$10$vV2ok.k3nr7elveYjdyCoO6ziMEhyN6T3RgLDJushUR5Z7t7ygIOO', 1, '11997237935', 'Trabalho desde o ano de 2019 com vendas online de produtos de informática.', 'https://youtu.be/1KhOhW_O8-k?si=1E4_8qg-Sd4_qkvb', 'Gangdong-gu, Seul', 'empreendedora', '/images/pfp/user/68e5aa50a639c_1759881808.jpg', NULL, '/images/covers/user/68e5ab59c96d2_1759882073.png', '2025-10-07 23:58:18', '2025-10-08 00:30:26');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `ad_campaigns`
--
ALTER TABLE `ad_campaigns`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_campaign_user` (`user_id`),
  ADD KEY `idx_campaign_status` (`status`),
  ADD KEY `fk_campaigns_plan` (`plan_id`);

--
-- Índices de tabela `ad_campaign_posts`
--
ALTER TABLE `ad_campaign_posts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_campaign_post` (`campaign_id`,`post_id`),
  ADD KEY `fk_campaign_posts_post` (`post_id`);

--
-- Índices de tabela `ad_metrics_daily`
--
ALTER TABLE `ad_metrics_daily`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_campaign_day` (`campaign_id`,`post_id`,`data`),
  ADD KEY `fk_metrics_post` (`post_id`);

--
-- Índices de tabela `conversas`
--
ALTER TABLE `conversas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_conversas_tipo` (`tipo`),
  ADD KEY `idx_conversas_privacidade` (`privacidade`),
  ADD KEY `idx_conversas_ultima_mensagem` (`ultima_mensagem_em`),
  ADD KEY `fk_conversas_criador` (`criador_id`),
  ADD KEY `fk_conversas_ultima_mensagem` (`ultima_mensagem_id`),
  ADD KEY `idx_conversas_ultima` (`ultima_mensagem_em`);

--
-- Índices de tabela `conversa_convites`
--
ALTER TABLE `conversa_convites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_convite_token` (`token`),
  ADD KEY `idx_convites_conversa` (`conversa_id`),
  ADD KEY `idx_convites_convidado` (`convidado_id`),
  ADD KEY `fk_convites_remetente` (`remetente_id`);

--
-- Índices de tabela `conversa_mensagens_fixadas`
--
ALTER TABLE `conversa_mensagens_fixadas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_conversa_mensagem_fixada` (`conversa_id`,`mensagem_id`),
  ADD KEY `fk_fixadas_mensagem` (`mensagem_id`),
  ADD KEY `fk_fixadas_usuario` (`fixado_por`);

--
-- Índices de tabela `conversa_participantes`
--
ALTER TABLE `conversa_participantes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_conversa_usuario` (`conversa_id`,`usuario_id`),
  ADD KEY `conversa_id` (`conversa_id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `idx_conversa_participantes_status` (`status`),
  ADD KEY `idx_conversa_participantes_conversa` (`conversa_id`),
  ADD KEY `idx_conversa_participantes_usuario` (`usuario_id`);

--
-- Índices de tabela `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_courses_categoria` (`categoria_id`),
  ADD KEY `idx_courses_publicado` (`publicado`),
  ADD KEY `fk_courses_usuario` (`criado_por`);

--
-- Índices de tabela `course_categories`
--
ALTER TABLE `course_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Índices de tabela `course_enrollments`
--
ALTER TABLE `course_enrollments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_enrollment_user_course` (`course_id`,`user_id`),
  ADD KEY `fk_enrollments_user` (`user_id`),
  ADD KEY `fk_enrollments_subscription` (`subscription_id`);

--
-- Índices de tabela `course_lessons`
--
ALTER TABLE `course_lessons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_lessons_module_ordem` (`module_id`,`ordem`);

--
-- Índices de tabela `course_modules`
--
ALTER TABLE `course_modules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_modules_course_ordem` (`course_id`,`ordem`);

--
-- Índices de tabela `course_progress`
--
ALTER TABLE `course_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_progress_lesson` (`enrollment_id`,`lesson_id`),
  ADD KEY `fk_progress_lesson` (`lesson_id`);

--
-- Índices de tabela `course_resources`
--
ALTER TABLE `course_resources`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_resources_course` (`course_id`);

--
-- Índices de tabela `course_reviews`
--
ALTER TABLE `course_reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_review_course_user` (`course_id`,`user_id`),
  ADD KEY `fk_reviews_user` (`user_id`);

--
-- Índices de tabela `denuncias`
--
ALTER TABLE `denuncias`
  ADD PRIMARY KEY (`id`),
  ADD KEY `denunciante_id` (`denunciante_id`),
  ADD KEY `denunciado_id` (`denunciado_id`);

--
-- Índices de tabela `eventos`
--
ALTER TABLE `eventos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `criado_por` (`criado_por`),
  ADD KEY `idx_eventos_data` (`data_evento`),
  ADD KEY `idx_eventos_tipo` (`tipo`),
  ADD KEY `idx_eventos_status` (`status`);

--
-- Índices de tabela `evento_categorias`
--
ALTER TABLE `evento_categorias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nome` (`nome`);

--
-- Índices de tabela `evento_inscricoes`
--
ALTER TABLE `evento_inscricoes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_inscricao` (`evento_id`,`user_id`),
  ADD KEY `idx_inscricoes_evento` (`evento_id`),
  ADD KEY `idx_inscricoes_user` (`user_id`),
  ADD KEY `idx_inscricoes_status` (`status`);

--
-- Índices de tabela `grupos`
--
ALTER TABLE `grupos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_grupos_slug` (`slug`),
  ADD KEY `idx_criador_id` (`criador_id`),
  ADD KEY `idx_grupos_privacidade` (`privacidade`);

--
-- Índices de tabela `grupo_convites`
--
ALTER TABLE `grupo_convites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_grupo_token` (`grupo_id`,`token`),
  ADD KEY `idx_convites_grupo` (`grupo_id`),
  ADD KEY `idx_convites_convidado` (`convidado_id`),
  ADD KEY `fk_convites_convidante` (`convidante_id`);

--
-- Índices de tabela `grupo_membros`
--
ALTER TABLE `grupo_membros`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_grupo_usuario` (`grupo_id`,`usuario_id`),
  ADD KEY `idx_grupo_status` (`grupo_id`,`status`),
  ADD KEY `fk_grupo_membros_usuario` (`usuario_id`);

--
-- Índices de tabela `grupo_posts`
--
ALTER TABLE `grupo_posts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_grupo_post` (`grupo_id`,`post_id`),
  ADD KEY `idx_grupo_posts_grupo` (`grupo_id`),
  ADD KEY `idx_grupo_posts_post` (`post_id`),
  ADD KEY `idx_grupo_posts_created` (`created_at`);

--
-- Índices de tabela `grupo_solicitacoes`
--
ALTER TABLE `grupo_solicitacoes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_grupo_solicitacao` (`grupo_id`,`usuario_id`),
  ADD KEY `fk_solicitacoes_usuario` (`usuario_id`),
  ADD KEY `fk_solicitacoes_moderador` (`analisado_por`);

--
-- Índices de tabela `grupo_topicos`
--
ALTER TABLE `grupo_topicos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_grupo_topico_slug` (`grupo_id`,`slug`);

--
-- Índices de tabela `mensagem_reacoes`
--
ALTER TABLE `mensagem_reacoes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_reacao_usuario` (`mensagem_id`,`usuario_id`,`reacao`),
  ADD KEY `idx_reacao_mensagem` (`mensagem_id`),
  ADD KEY `fk_reacoes_usuario` (`usuario_id`);

--
-- Índices de tabela `mensagens`
--
ALTER TABLE `mensagens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `conversa_id` (`conversa_id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `idx_mensagens_conversa` (`conversa_id`,`enviada_em`),
  ADD KEY `idx_mensagens_reply` (`reply_to_id`),
  ADD KEY `idx_mensagens_usuario` (`usuario_id`);

--
-- Índices de tabela `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `from_user_id` (`from_user_id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `comment_id` (`comment_id`),
  ADD KEY `idx_user_notifications` (`user_id`,`created_at`),
  ADD KEY `idx_user_unread` (`user_id`,`is_read`),
  ADD KEY `idx_notifications_categoria` (`categoria`),
  ADD KEY `idx_notifications_created` (`created_at`),
  ADD KEY `fk_notifications_contexto` (`contexto_id`),
  ADD KEY `idx_notifications_status` (`status`);

--
-- Índices de tabela `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_posts_user_id` (`user_id`),
  ADD KEY `idx_posts_created_at` (`created_at`),
  ADD KEY `idx_media_type` (`media_type`),
  ADD KEY `idx_media_size` (`media_size`),
  ADD KEY `idx_posts_grupo` (`grupo_id`),
  ADD KEY `idx_posts_visibilidade` (`escopo_visibilidade`),
  ADD KEY `idx_posts_promovido` (`is_promovido`,`promocao_status`),
  ADD KEY `fk_posts_campaign` (`ad_campaign_id`);

--
-- Índices de tabela `post_comentarios`
--
ALTER TABLE `post_comentarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_post_id` (`post_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_parent_id` (`parent_id`);

--
-- Índices de tabela `post_compartilhamentos`
--
ALTER TABLE `post_compartilhamentos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_share` (`post_id`,`user_id`),
  ADD KEY `idx_post_id` (`post_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Índices de tabela `post_likes`
--
ALTER TABLE `post_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_like` (`post_id`,`user_id`),
  ADD KEY `idx_post_id` (`post_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Índices de tabela `post_media`
--
ALTER TABLE `post_media`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_post_id` (`post_id`),
  ADD KEY `idx_media_type` (`media_type`),
  ADD KEY `idx_media_order` (`media_order`),
  ADD KEY `idx_post_media_post_id` (`post_id`);

--
-- Índices de tabela `post_saves`
--
ALTER TABLE `post_saves`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_save` (`post_id`,`user_id`),
  ADD KEY `idx_post_saves_user_id` (`user_id`),
  ADD KEY `idx_post_saves_post_id` (`post_id`);

--
-- Índices de tabela `schema_migrations`
--
ALTER TABLE `schema_migrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `migration` (`migration`);

--
-- Índices de tabela `subscription_plans`
--
ALTER TABLE `subscription_plans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Índices de tabela `subscription_transactions`
--
ALTER TABLE `subscription_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_transactions_subscription` (`subscription_id`),
  ADD KEY `fk_transactions_plan` (`plan_id`),
  ADD KEY `fk_transactions_user` (`user_id`);

--
-- Índices de tabela `user_follows`
--
ALTER TABLE `user_follows`
  ADD PRIMARY KEY (`follower_id`,`followed_id`),
  ADD KEY `followed_id` (`followed_id`);

--
-- Índices de tabela `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_plan` (`user_id`,`plan_id`),
  ADD KEY `idx_subscription_status` (`status`),
  ADD KEY `fk_subscriptions_plan` (`plan_id`);

--
-- Índices de tabela `user_tokens`
--
ALTER TABLE `user_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_token` (`token`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `ux_usuarios_email` (`email`(191)),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `ux_usuarios_username` (`username`),
  ADD KEY `idx_usuarios_username` (`username`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_usuarios_capa` (`capa_url`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `ad_campaigns`
--
ALTER TABLE `ad_campaigns`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de tabela `ad_campaign_posts`
--
ALTER TABLE `ad_campaign_posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `ad_metrics_daily`
--
ALTER TABLE `ad_metrics_daily`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `conversas`
--
ALTER TABLE `conversas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de tabela `conversa_convites`
--
ALTER TABLE `conversa_convites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `conversa_mensagens_fixadas`
--
ALTER TABLE `conversa_mensagens_fixadas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `conversa_participantes`
--
ALTER TABLE `conversa_participantes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT de tabela `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `course_categories`
--
ALTER TABLE `course_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `course_enrollments`
--
ALTER TABLE `course_enrollments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `course_lessons`
--
ALTER TABLE `course_lessons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de tabela `course_modules`
--
ALTER TABLE `course_modules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `course_progress`
--
ALTER TABLE `course_progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `course_resources`
--
ALTER TABLE `course_resources`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `course_reviews`
--
ALTER TABLE `course_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `denuncias`
--
ALTER TABLE `denuncias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `eventos`
--
ALTER TABLE `eventos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `evento_categorias`
--
ALTER TABLE `evento_categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `evento_inscricoes`
--
ALTER TABLE `evento_inscricoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `grupos`
--
ALTER TABLE `grupos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `grupo_convites`
--
ALTER TABLE `grupo_convites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `grupo_membros`
--
ALTER TABLE `grupo_membros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `grupo_posts`
--
ALTER TABLE `grupo_posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `grupo_solicitacoes`
--
ALTER TABLE `grupo_solicitacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `grupo_topicos`
--
ALTER TABLE `grupo_topicos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `mensagem_reacoes`
--
ALTER TABLE `mensagem_reacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `mensagens`
--
ALTER TABLE `mensagens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

--
-- AUTO_INCREMENT de tabela `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=221;

--
-- AUTO_INCREMENT de tabela `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT de tabela `post_comentarios`
--
ALTER TABLE `post_comentarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT de tabela `post_compartilhamentos`
--
ALTER TABLE `post_compartilhamentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `post_likes`
--
ALTER TABLE `post_likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=117;

--
-- AUTO_INCREMENT de tabela `post_media`
--
ALTER TABLE `post_media`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `post_saves`
--
ALTER TABLE `post_saves`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de tabela `schema_migrations`
--
ALTER TABLE `schema_migrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de tabela `subscription_plans`
--
ALTER TABLE `subscription_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `subscription_transactions`
--
ALTER TABLE `subscription_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `user_tokens`
--
ALTER TABLE `user_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=98;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `ad_campaigns`
--
ALTER TABLE `ad_campaigns`
  ADD CONSTRAINT `fk_campaigns_plan` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_campaigns_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `ad_campaign_posts`
--
ALTER TABLE `ad_campaign_posts`
  ADD CONSTRAINT `fk_campaign_posts_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `ad_campaigns` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_campaign_posts_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `ad_metrics_daily`
--
ALTER TABLE `ad_metrics_daily`
  ADD CONSTRAINT `fk_metrics_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `ad_campaigns` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_metrics_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `conversas`
--
ALTER TABLE `conversas`
  ADD CONSTRAINT `fk_conversas_criador` FOREIGN KEY (`criador_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_conversas_ultima_mensagem` FOREIGN KEY (`ultima_mensagem_id`) REFERENCES `mensagens` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `conversa_convites`
--
ALTER TABLE `conversa_convites`
  ADD CONSTRAINT `fk_convites_conversa` FOREIGN KEY (`conversa_id`) REFERENCES `conversas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_convites_convidado` FOREIGN KEY (`convidado_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_convites_remetente` FOREIGN KEY (`remetente_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `conversa_mensagens_fixadas`
--
ALTER TABLE `conversa_mensagens_fixadas`
  ADD CONSTRAINT `fk_fixadas_conversa` FOREIGN KEY (`conversa_id`) REFERENCES `conversas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fixadas_mensagem` FOREIGN KEY (`mensagem_id`) REFERENCES `mensagens` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fixadas_usuario` FOREIGN KEY (`fixado_por`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `conversa_participantes`
--
ALTER TABLE `conversa_participantes`
  ADD CONSTRAINT `conversa_participantes_ibfk_1` FOREIGN KEY (`conversa_id`) REFERENCES `conversas` (`id`),
  ADD CONSTRAINT `conversa_participantes_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Restrições para tabelas `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `fk_courses_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `course_categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_courses_usuario` FOREIGN KEY (`criado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `course_enrollments`
--
ALTER TABLE `course_enrollments`
  ADD CONSTRAINT `fk_enrollments_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_enrollments_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `user_subscriptions` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_enrollments_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `course_lessons`
--
ALTER TABLE `course_lessons`
  ADD CONSTRAINT `fk_lessons_module` FOREIGN KEY (`module_id`) REFERENCES `course_modules` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `course_modules`
--
ALTER TABLE `course_modules`
  ADD CONSTRAINT `fk_modules_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `course_progress`
--
ALTER TABLE `course_progress`
  ADD CONSTRAINT `fk_progress_enrollment` FOREIGN KEY (`enrollment_id`) REFERENCES `course_enrollments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_progress_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `course_lessons` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `course_resources`
--
ALTER TABLE `course_resources`
  ADD CONSTRAINT `fk_resources_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `course_reviews`
--
ALTER TABLE `course_reviews`
  ADD CONSTRAINT `fk_reviews_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `denuncias`
--
ALTER TABLE `denuncias`
  ADD CONSTRAINT `denuncias_ibfk_1` FOREIGN KEY (`denunciante_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `denuncias_ibfk_2` FOREIGN KEY (`denunciado_id`) REFERENCES `usuarios` (`id`);

--
-- Restrições para tabelas `eventos`
--
ALTER TABLE `eventos`
  ADD CONSTRAINT `eventos_ibfk_1` FOREIGN KEY (`criado_por`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `evento_inscricoes`
--
ALTER TABLE `evento_inscricoes`
  ADD CONSTRAINT `evento_inscricoes_ibfk_1` FOREIGN KEY (`evento_id`) REFERENCES `eventos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `evento_inscricoes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `grupos`
--
ALTER TABLE `grupos`
  ADD CONSTRAINT `fk_grupos_criador` FOREIGN KEY (`criador_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `grupo_convites`
--
ALTER TABLE `grupo_convites`
  ADD CONSTRAINT `fk_convites_convidante` FOREIGN KEY (`convidante_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_convites_grupo` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `grupo_membros`
--
ALTER TABLE `grupo_membros`
  ADD CONSTRAINT `fk_grupo_membros_grupo` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_grupo_membros_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `grupo_posts`
--
ALTER TABLE `grupo_posts`
  ADD CONSTRAINT `grupo_posts_ibfk_1` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `grupo_posts_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `grupo_solicitacoes`
--
ALTER TABLE `grupo_solicitacoes`
  ADD CONSTRAINT `fk_solicitacoes_grupo` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_solicitacoes_moderador` FOREIGN KEY (`analisado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_solicitacoes_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `grupo_topicos`
--
ALTER TABLE `grupo_topicos`
  ADD CONSTRAINT `fk_topicos_grupo` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `mensagem_reacoes`
--
ALTER TABLE `mensagem_reacoes`
  ADD CONSTRAINT `fk_reacoes_mensagem` FOREIGN KEY (`mensagem_id`) REFERENCES `mensagens` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reacoes_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `mensagens`
--
ALTER TABLE `mensagens`
  ADD CONSTRAINT `fk_mensagens_reply` FOREIGN KEY (`reply_to_id`) REFERENCES `mensagens` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `mensagens_ibfk_1` FOREIGN KEY (`conversa_id`) REFERENCES `conversas` (`id`),
  ADD CONSTRAINT `mensagens_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Restrições para tabelas `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_comment` FOREIGN KEY (`comment_id`) REFERENCES `post_comentarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notifications_contexto` FOREIGN KEY (`contexto_id`) REFERENCES `conversas` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_notifications_from_user` FOREIGN KEY (`from_user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notifications_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`from_user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_4` FOREIGN KEY (`comment_id`) REFERENCES `post_comentarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `fk_posts_campaign` FOREIGN KEY (`ad_campaign_id`) REFERENCES `ad_campaigns` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_posts_grupo` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_posts_user_id` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `post_comentarios`
--
ALTER TABLE `post_comentarios`
  ADD CONSTRAINT `post_comentarios_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_comentarios_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_comentarios_ibfk_3` FOREIGN KEY (`parent_id`) REFERENCES `post_comentarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `post_compartilhamentos`
--
ALTER TABLE `post_compartilhamentos`
  ADD CONSTRAINT `post_compartilhamentos_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_compartilhamentos_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `post_likes`
--
ALTER TABLE `post_likes`
  ADD CONSTRAINT `post_likes_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `post_media`
--
ALTER TABLE `post_media`
  ADD CONSTRAINT `post_media_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `post_saves`
--
ALTER TABLE `post_saves`
  ADD CONSTRAINT `post_saves_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_saves_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `subscription_transactions`
--
ALTER TABLE `subscription_transactions`
  ADD CONSTRAINT `fk_transactions_plan` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_transactions_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `user_subscriptions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_transactions_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `user_follows`
--
ALTER TABLE `user_follows`
  ADD CONSTRAINT `user_follows_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_follows_ibfk_2` FOREIGN KEY (`followed_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  ADD CONSTRAINT `fk_subscriptions_plan` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_subscriptions_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `user_tokens`
--
ALTER TABLE `user_tokens`
  ADD CONSTRAINT `fk_user_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
