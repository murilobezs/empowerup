-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 09/09/2025 às 06:10
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
-- Estrutura para tabela `conversas`
--

CREATE TABLE `conversas` (
  `id` int(11) NOT NULL,
  `tipo` enum('privada','grupo') NOT NULL,
  `nome` varchar(255) DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `conversa_participantes`
--

CREATE TABLE `conversa_participantes` (
  `id` int(11) NOT NULL,
  `conversa_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `status` enum('ativo','bloqueado') DEFAULT 'ativo'
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

-- --------------------------------------------------------

--
-- Estrutura para tabela `grupos`
--

CREATE TABLE `grupos` (
  `id` int(11) NOT NULL,
  `criador_id` int(11) DEFAULT NULL,
  `nome` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `categoria` varchar(100) DEFAULT NULL,
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

INSERT INTO `grupos` (`id`, `criador_id`, `nome`, `descricao`, `categoria`, `membros`, `imagem`, `imagem_capa`, `ativo`, `ultima_atividade`, `created_at`) VALUES
(1, NULL, 'Artesãs de alma', 'Para nós divas artesãs', 'Artesanato', 0, '/placeholder.svg?height=100&width=100', NULL, 1, '2025-06-24 02:52:08', '2025-06-24 02:52:08'),
(2, NULL, 'Artesãs de alma', 'Para nós divas artesãs', 'Artesanato', 0, '/placeholder.svg?height=100&width=100', NULL, 1, '2025-06-24 02:52:08', '2025-06-24 02:52:08');

-- --------------------------------------------------------

--
-- Estrutura para tabela `mensagens`
--

CREATE TABLE `mensagens` (
  `id` int(11) NOT NULL,
  `conversa_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `conteudo` text DEFAULT NULL,
  `anexo` varchar(255) DEFAULT NULL,
  `lida` tinyint(1) DEFAULT 0,
  `enviada_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `from_user_id` int(11) DEFAULT NULL,
  `type` enum('like','comment','follow','save','mention') NOT NULL,
  `post_id` int(11) DEFAULT NULL,
  `comment_id` int(11) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `post_id`, `comment_id`, `message`, `is_read`, `created_at`) VALUES
(1, 7, 9, 'like', 28, NULL, NULL, 0, '2025-09-08 20:43:54'),
(2, 7, 9, 'follow', NULL, NULL, NULL, 0, '2025-09-08 20:23:11'),
(3, 7, 9, 'follow', NULL, NULL, NULL, 0, '2025-09-08 20:23:29'),
(4, 6, 9, 'like', 23, NULL, NULL, 0, '2025-09-08 20:23:32'),
(5, 6, 9, 'like', 24, NULL, NULL, 0, '2025-09-08 20:23:46'),
(6, 6, 9, 'save', 24, NULL, NULL, 0, '2025-09-08 20:23:39'),
(7, 6, 9, 'like', 25, NULL, NULL, 0, '2025-09-08 20:24:04'),
(8, 6, 9, 'comment', 25, 5, NULL, 0, '2025-09-08 20:24:11'),
(9, 6, 9, 'save', 25, NULL, NULL, 0, '2025-09-08 20:24:17'),
(10, 5, 9, 'comment', 20, 6, NULL, 0, '2025-09-08 20:24:31'),
(11, 5, 9, 'save', 20, NULL, NULL, 0, '2025-09-08 20:24:33'),
(12, 5, 9, 'like', 20, NULL, NULL, 0, '2025-09-08 20:24:35'),
(13, 5, 9, 'follow', NULL, NULL, NULL, 0, '2025-09-08 20:24:41'),
(14, 7, 9, 'save', 28, NULL, NULL, 0, '2025-09-08 20:43:51'),
(15, 6, 9, 'like', 27, NULL, NULL, 0, '2025-09-08 21:06:36'),
(16, 6, 9, 'like', 26, NULL, NULL, 0, '2025-09-08 21:06:47'),
(17, 6, 9, 'save', 26, NULL, NULL, 0, '2025-09-08 21:06:50'),
(18, 9, 10, 'follow', NULL, NULL, NULL, 0, '2025-09-09 01:32:40'),
(19, 6, 10, 'follow', NULL, NULL, NULL, 0, '2025-09-09 01:33:08'),
(20, 9, 10, 'save', 30, NULL, NULL, 0, '2025-09-09 01:36:35'),
(21, 9, 10, 'save', 29, NULL, NULL, 0, '2025-09-09 01:36:36'),
(22, 9, 10, 'like', 30, NULL, NULL, 0, '2025-09-09 01:36:52'),
(23, 9, 10, 'like', 29, NULL, NULL, 0, '2025-09-09 01:37:07'),
(24, 9, 10, 'follow', NULL, NULL, NULL, 0, '2025-09-09 01:53:32'),
(25, 9, 10, 'follow', NULL, NULL, NULL, 0, '2025-09-09 01:53:46'),
(26, 6, 10, 'follow', NULL, NULL, NULL, 0, '2025-09-09 01:54:03'),
(27, 9, 10, 'follow', NULL, NULL, NULL, 0, '2025-09-09 01:54:31'),
(28, 10, 11, 'follow', NULL, NULL, NULL, 0, '2025-09-09 02:38:23'),
(29, 10, 11, 'like', 31, NULL, NULL, 0, '2025-09-09 02:38:23'),
(30, 9, 11, 'follow', NULL, NULL, NULL, 0, '2025-09-09 02:38:30'),
(31, 10, 11, 'save', 31, NULL, NULL, 0, '2025-09-09 02:40:11');

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

INSERT INTO `posts` (`id`, `user_id`, `autor`, `username`, `avatar`, `conteudo`, `imagem`, `categoria`, `tags`, `likes`, `comentarios`, `compartilhamentos`, `created_at`, `imagem_url`, `video_url`, `gif_url`, `tipo_midia`, `media_data`, `media_type`, `media_filename`, `media_size`) VALUES
(2, 1, 'Você', '@voce', '/placeholder.svg?height=40&width=40', 'oii', NULL, 'Geral', '[]', 0, 0, 0, '2025-06-24 02:04:30', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(3, 1, 'Você', '@voce', '/placeholder.svg?height=40&width=40', 'ola gostaria', NULL, 'Geral', '[]', 0, 0, 0, '2025-06-24 02:14:32', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(5, 1, 'Você', '@voce', '/placeholder.svg?height=40&width=40', 'teste 22/06', NULL, 'Geral', '[]', 0, 1, 0, '2025-06-24 02:17:06', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(6, 1, 'Você', '@voce', '/placeholder.svg?height=40&width=40', 'teste (foto nn esta funcionando!) rever API', NULL, 'Geral', '[]', 0, 0, 0, '2025-06-24 02:17:27', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(7, 1, 'Você', '@voce', '/placeholder.svg?height=40&width=40', 'Bem-vinda à empower up!', NULL, 'Geral', '[]', 0, 0, 0, '2025-06-24 02:17:53', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(8, 1, 'Você', '@voce', '/placeholder.svg?height=40&width=40', 'oi', NULL, 'Geral', '[]', 0, 0, 0, '2025-06-24 02:39:19', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(9, 1, 'Você', '@voce', '/placeholder.svg?height=40&width=40', 'oi', NULL, 'Geral', '[]', 0, 0, 0, '2025-06-24 02:39:19', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(10, 1, 'Você', '@voce', '/placeholder.svg?height=40&width=40', 'oi', NULL, 'Geral', '[]', 0, 0, 0, '2025-06-24 02:39:20', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(11, 1, 'Você', '@voce', '/placeholder.svg?height=40&width=40', 'ola', NULL, 'Geral', '[]', 0, 0, 0, '2025-06-24 03:21:19', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(12, 1, 'Você', '@voce', '/placeholder.svg?height=40&width=40', 'oiii', NULL, 'Geral', '[]', 0, 0, 0, '2025-07-14 23:59:40', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(13, 4, 'dui', '@', '/placeholder.svg?height=40&width=40', 'olá!', NULL, 'Dicas', '[\"amor\",\"pets\"]', 0, 0, 0, '2025-07-15 01:55:44', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(14, 4, 'dui', '@dui', '/images/pfp/user/68840f7b84a6b_1753485179.jpg', 'oiiie', NULL, 'Geral', '[]', 0, 0, 0, '2025-07-26 02:05:57', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(15, 4, 'dui', '@dui', '/images/pfp/user/68840f7b84a6b_1753485179.jpg', 'hello girls', NULL, 'Beleza', '[\"#moda #beleza\"]', 0, 0, 0, '2025-07-26 02:06:50', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(16, 4, 'dui', '@dui', '/images/pfp/user/68840f7b84a6b_1753485179.jpg', 'oii', NULL, 'Beleza', '[\"#amo\"]', 0, 2, 0, '2025-08-01 19:55:00', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(17, 4, 'dui', '@dui', '/images/pfp/user/68840f7b84a6b_1753485179.jpg', 'amei esa foto fchação', NULL, 'Inspiração', '[\"#gata\"]', 0, 0, 0, '2025-08-01 19:57:14', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(18, 1, 'murilo', 'murilo', '/images/pfp/user/68759965eae9b_1752537445.jpg', 'oii', NULL, 'Geral', '[]', 0, 0, 0, '2025-08-06 01:47:34', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(19, 5, 'more', 'more', '/placeholder.svg?height=40&width=40', 'oiii', NULL, 'Geral', '[]', 0, 0, 0, '2025-08-20 00:27:55', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(20, 5, 'more', 'more', '/placeholder.svg?height=40&width=40', 'cjhcjhvjhvjgij', NULL, 'Geral', '[]', 0, 1, 0, '2025-08-20 01:39:03', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(21, 5, 'more', 'more', '/placeholder.svg?height=40&width=40', 'teste', NULL, 'Geral', '[]', 0, 0, 0, '2025-09-01 22:47:24', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(22, 5, 'more', 'more', '/placeholder.svg?height=40&width=40', 'eu amo', NULL, 'Educação', '[]', 0, 0, 0, '2025-09-02 00:24:38', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(23, 6, 'Marise Rezende Barbosa Jusevicius', 'mariserezendebarbosajusevicius', '/placeholder.svg?height=40&width=40', 'yjuiikuyki', NULL, 'Geral', '[]', 0, 0, 0, '2025-09-02 22:22:37', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(24, 6, 'Marise Rezende Barbosa Jusevicius', 'mariserezendebarbosajusevicius', '/placeholder.svg?height=40&width=40', 'oiiiiiiiiiiiii', NULL, 'Geral', '[]', 0, 0, 0, '2025-09-02 22:22:49', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(25, 6, 'Marise Rezende Barbosa Jusevicius', 'mariserezendebarbosajusevicius', '/placeholder.svg?height=40&width=40', 'amei!', NULL, 'Geral', '[]', 0, 1, 0, '2025-09-02 22:23:01', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(26, 6, 'Marise Rezende Barbosa Jusevicius', 'mariserezendebarbosajusevicius', '/placeholder.svg?height=40&width=40', 'oii', NULL, 'Geral', '[]', 1, 0, 0, '2025-09-02 22:27:53', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(27, 6, 'Marise Rezende Barbosa Jusevicius', 'mariserezendebarbosajusevicius', '/placeholder.svg?height=40&width=40', 'oii', NULL, 'Geral', '[]', 0, 0, 0, '2025-09-02 22:28:16', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(28, 7, 'Matheus Miranda', 'matheusmiranda', '/placeholder.svg?height=40&width=40', 'huahhahahaha', NULL, 'Geral', '[]', 0, 1, 0, '2025-09-03 01:29:05', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(29, 9, 'Giovanna Salles Arruda', 'giovannasallesarruda', '/placeholder.svg?height=40&width=40', 'gente que divonico!!!', NULL, 'Negócios', '[]', 2, 0, 0, '2025-09-07 23:24:45', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(30, 9, 'Giovanna Salles Arruda', 'giovannasallesarruda', '/images/pfp/user/68be2b6f974fd_1757293423.jpg', 'gente oiii', NULL, 'Geral', '[]', 2, 0, 0, '2025-09-08 20:25:25', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(31, 10, 'Mariana Lobo Nascimento', 'marianalobonascimento', '/placeholder.svg?height=40&width=40', 'sou nova aqui!', NULL, 'Geral', '[]', 2, 2, 0, '2025-09-09 01:30:32', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(33, 11, 'Taylor Alison Swift', 'taylorswift13', '/placeholder.svg?height=40&width=40', 'Welcome to New York!', NULL, 'Negócios', '[]', 1, 0, 0, '2025-09-09 02:38:07', NULL, NULL, NULL, 'none', NULL, NULL, NULL, NULL),
(34, 11, 'Taylor Alison Swift', 'taylorswift13', '/images/pfp/user/68bf9369566b6_1757385577.jpg', 'teste', NULL, 'Geral', '[]', 0, 1, 0, '2025-09-09 03:04:52', '/images/posts/68bf9954b363a_1757387092.jpg', NULL, NULL, 'imagem', NULL, NULL, NULL, NULL);

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
(9, 34, 11, 'arrasou miga', NULL, '2025-09-09 03:06:27', '2025-09-09 03:06:27');

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
(41, 31, 11, '2025-09-09 02:38:20');

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
(12, 31, 11, '2025-09-08 23:40:11');

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
(5, '005_create_post_saves.php', '2025-09-08 20:21:09');

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
(9, 5, '2025-09-08 17:24:41'),
(9, 6, '2025-09-08 16:45:54'),
(9, 7, '2025-09-08 17:23:29'),
(10, 6, '2025-09-08 22:54:03'),
(10, 9, '2025-09-08 22:54:31'),
(11, 9, '2025-09-08 23:38:30'),
(11, 10, '2025-09-08 23:38:22');

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
(22, 11, '506f74fa58683df271fbb4b4bbebacedaaec7df054c4ac9ba94ecbf07d35c386', 'refresh', '2025-10-08 23:37:48', 0, '2025-09-09 02:37:48');

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `nome`, `username`, `email`, `senha`, `verified`, `telefone`, `bio`, `website`, `localizacao`, `tipo`, `avatar_url`, `created_at`, `updated_at`) VALUES
(1, 'murilo', 'murilo', 'murisud15@gmail.com', '$2y$10$tuxfPcY/dcR1H5ybuoUi0e2mrCn4lAXfs2YAkGIavGgUTNvHZbTyS', 0, '11930850009', 'sou aluno', NULL, NULL, 'empreendedora', '/images/pfp/user/68759965eae9b_1752537445.jpg', '2025-06-24 03:19:32', '2025-07-14 23:57:30'),
(4, 'dui', 'dui', 'giovanna@gmail.com', '$2y$10$zX7vJcaNy4OaJRsJftruuuTrMFZG/erAZtiMqyWySdjtnjl2Nsuo.', 0, '1191234567', 'hii', NULL, NULL, 'empreendedora', '/images/pfp/user/68840f7b84a6b_1753485179.jpg', '2025-07-15 01:54:31', '2025-07-25 23:12:59'),
(5, 'more', 'more', 'vivi@gmail.com', '$2y$10$87YSeobQCWXYol03cEQgX.RrAJ5GRTQKV/rNPdZQxxzc3N7gBHMVm', 0, '(11) 98283-3435', 'kgykiugtt', NULL, NULL, 'empreendedora', '/images/pfp/user/68b6426dd2aa2_1756775021.jpg', '2025-08-20 00:05:04', '2025-09-02 01:04:33'),
(6, 'Marise Rezende Barbosa Jusevicius', 'mariserezendebarbosajusevicius', 'gaga@gmail.com', '$2y$10$78s1o9Pl927o0ifXfM5X9eOJenycKXPw/WD60c9F/stHxsC6T77qK', 0, '11982833435', 'dhdtjyjyk', NULL, NULL, 'empreendedora', '/images/pfp/user/68b77034e5974_1756852276.jpg', '2025-09-02 22:20:53', '2025-09-02 22:31:17'),
(7, 'Matheus Miranda', 'matheusmiranda', 'matheusmiranda02@gmail.com', '$2y$10$lgYsSLQjT8p0CHPSua.Ki.Gs1XCt79WA6CUttBVKH4I7U2yU8jmLu', 0, '11902289225', 'Não gosto', NULL, NULL, 'empreendedora', '/placeholder.svg?height=40&width=40', '2025-09-02 23:47:42', '2025-09-02 23:47:42'),
(8, 'Gabruel Araujo', 'gabruelaraujo', 'gabsaraujo@gmail.com', '$2y$10$7INugAf.lF9VGjd16jl9iOwGD8/sdFwzVZju8qZBBDptgNWkPA1G.', 0, '11988965098', 'ulalala', NULL, NULL, 'empreendedora', '/placeholder.svg?height=40&width=40', '2025-09-03 01:32:04', '2025-09-03 01:32:04'),
(9, 'Giovanna Salles Arruda', 'giovannasallesarruda', 'gigi_salles@gmail.com', '$2y$10$9fwoUUYNW8nNWVvZOXn.9uLLO1hLepmFV5BytEOhXS3F/YOEGGiZ6', 0, '11940314316', 'As vezes curto assitir a algumas séries', NULL, NULL, 'empreendedora', '/images/pfp/user/68be2b6f974fd_1757293423.jpg', '2025-09-07 23:23:56', '2025-09-08 01:03:44'),
(10, 'Mariana Lobo Nascimento', 'marianalobonascimento', 'mari.lobao@etec.sp.gov.br', '$2y$10$nAHW4TZ02R6F3zABOYA.pORg30.6wy0Kj0xzmiWVw7taXFTDU05yC', 0, '11950710210', 'sou fa da Lana e gosto de gato', '', '', 'empreendedora', '/images/pfp/user/68bf8470d7616_1757381744.jpg', '2025-09-08 22:57:55', '2025-09-09 01:53:06'),
(11, 'Taylor Alison Swift', 'taylorswift13', 'taylor@gmail.com', '$2y$10$yuTJeHYtDLAXzer6Elj9weuJQqZy93dQ89CkDKtF9Wf6HdKB6Q72m', 0, '11987562560', 'Sou cantora e artista multipremiada', '', '', 'empreendedora', '/images/pfp/user/68bf9369566b6_1757385577.jpg', '2025-09-09 02:37:39', '2025-09-09 02:39:41');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `conversas`
--
ALTER TABLE `conversas`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `conversa_participantes`
--
ALTER TABLE `conversa_participantes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `conversa_id` (`conversa_id`),
  ADD KEY `usuario_id` (`usuario_id`);

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
  ADD KEY `idx_criador_id` (`criador_id`);

--
-- Índices de tabela `mensagens`
--
ALTER TABLE `mensagens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `conversa_id` (`conversa_id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Índices de tabela `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `from_user_id` (`from_user_id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `comment_id` (`comment_id`),
  ADD KEY `idx_user_notifications` (`user_id`,`created_at`),
  ADD KEY `idx_user_unread` (`user_id`,`is_read`);

--
-- Índices de tabela `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_posts_user_id` (`user_id`),
  ADD KEY `idx_posts_created_at` (`created_at`),
  ADD KEY `idx_media_type` (`media_type`),
  ADD KEY `idx_media_size` (`media_size`);

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
-- Índices de tabela `user_follows`
--
ALTER TABLE `user_follows`
  ADD PRIMARY KEY (`follower_id`,`followed_id`),
  ADD KEY `followed_id` (`followed_id`);

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
  ADD KEY `idx_username` (`username`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `conversas`
--
ALTER TABLE `conversas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `conversa_participantes`
--
ALTER TABLE `conversa_participantes`
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `evento_categorias`
--
ALTER TABLE `evento_categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `evento_inscricoes`
--
ALTER TABLE `evento_inscricoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `grupos`
--
ALTER TABLE `grupos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `mensagens`
--
ALTER TABLE `mensagens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de tabela `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT de tabela `post_comentarios`
--
ALTER TABLE `post_comentarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de tabela `post_compartilhamentos`
--
ALTER TABLE `post_compartilhamentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `post_likes`
--
ALTER TABLE `post_likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT de tabela `post_media`
--
ALTER TABLE `post_media`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `post_saves`
--
ALTER TABLE `post_saves`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de tabela `schema_migrations`
--
ALTER TABLE `schema_migrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `user_tokens`
--
ALTER TABLE `user_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `conversa_participantes`
--
ALTER TABLE `conversa_participantes`
  ADD CONSTRAINT `conversa_participantes_ibfk_1` FOREIGN KEY (`conversa_id`) REFERENCES `conversas` (`id`),
  ADD CONSTRAINT `conversa_participantes_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

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
-- Restrições para tabelas `mensagens`
--
ALTER TABLE `mensagens`
  ADD CONSTRAINT `mensagens_ibfk_1` FOREIGN KEY (`conversa_id`) REFERENCES `conversas` (`id`),
  ADD CONSTRAINT `mensagens_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Restrições para tabelas `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`from_user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_4` FOREIGN KEY (`comment_id`) REFERENCES `post_comentarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `posts`
--
ALTER TABLE `posts`
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
-- Restrições para tabelas `user_follows`
--
ALTER TABLE `user_follows`
  ADD CONSTRAINT `user_follows_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_follows_ibfk_2` FOREIGN KEY (`followed_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `user_tokens`
--
ALTER TABLE `user_tokens`
  ADD CONSTRAINT `fk_user_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
