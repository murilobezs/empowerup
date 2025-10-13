<?php
/**
 * Templates de Email para EmpowerUp
 */

class EmailTemplates {
    
    /**
     * Template base com header e footer
     */
    private static function getBaseTemplate($content) {
        $logoUrl = 'https://empowerup.com.br/logo-sem-fundo.png'; // Ajustar para URL real
        
        return '
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EmpowerUp</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: #f3f4f6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background: #ffffff;
            padding: 40px 20px;
            text-align: center;
            border-bottom: 3px solid #F68E8D;
        }
        .logo {
            max-width: 180px;
            height: auto;
        }
        .content {
            padding: 40px 30px;
            color: #374151;
            line-height: 1.6;
        }
        .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }
        .button {
            display: inline-block;
            padding: 14px 28px;
            background-color: #F68E8D;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            transition: background-color 0.3s;
        }
        .button:hover {
            background-color: #f47776;
        }
        .highlight-box {
            background-color: #fef3f2;
            border-left: 4px solid #F68E8D;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-grid {
            display: table;
            width: 100%;
            margin: 20px 0;
        }
        .info-row {
            display: table-row;
        }
        .info-label {
            display: table-cell;
            padding: 12px;
            font-weight: 600;
            color: #6b7280;
            width: 40%;
            background-color: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-value {
            display: table-cell;
            padding: 12px;
            color: #111827;
            border-bottom: 1px solid #e5e7eb;
        }
        h1 {
            color: #111827;
            font-size: 24px;
            margin: 0 0 20px 0;
        }
        h2 {
            color: #F68E8D;
            font-size: 20px;
            margin: 30px 0 15px 0;
        }
        p {
            margin: 0 0 15px 0;
        }
        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 30px 0;
        }
        @media only screen and (max-width: 600px) {
            .content {
                padding: 30px 20px;
            }
            .info-label, .info-value {
                display: block;
                width: 100%;
            }
            .info-label {
                border-bottom: none;
                padding-bottom: 5px;
            }
            .info-value {
                padding-top: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="' . $logoUrl . '" alt="EmpowerUp" class="logo">
        </div>
        <div class="content">
            ' . $content . '
        </div>
        <div class="footer">
            <p><strong>EmpowerUp</strong> - Empoderando Mulheres Empreendedoras</p>
            <p>Este é um e-mail automático. Por favor, não responda.</p>
            <p style="margin-top: 15px;">
                <a href="https://empowerup.com.br" style="color: #F68E8D; text-decoration: none;">Visite nosso site</a> | 
                <a href="https://empowerup.com.br/comunidade" style="color: #F68E8D; text-decoration: none;">Comunidade</a> | 
                <a href="https://empowerup.com.br/eventos" style="color: #F68E8D; text-decoration: none;">Eventos</a>
            </p>
            <p style="margin-top: 15px; color: #9ca3af; font-size: 11px;">
                © ' . date('Y') . ' EmpowerUp. Todos os direitos reservados.
            </p>
        </div>
    </div>
</body>
</html>';
    }
    
    /**
     * Email de confirmação de inscrição em evento
     */
    public static function eventSubscriptionConfirmation($data) {
        $userName = htmlspecialchars($data['user_name']);
        $eventTitle = htmlspecialchars($data['event_title']);
        $eventDate = htmlspecialchars($data['event_date']);
        $eventTime = htmlspecialchars($data['event_time']);
        $eventLocation = htmlspecialchars($data['event_location']);
        $eventType = htmlspecialchars($data['event_type'] ?? 'Evento');
        $isOnline = $data['is_online'] ?? false;
        $linkOnline = $data['link_online'] ?? '';
        $instrutor = $data['instrutor'] ?? '';
        $valor = $data['valor'] ?? 0;
        $ehGratuito = $data['eh_gratuito'] ?? true;
        $certificado = $data['certificado'] ?? false;
        $status = $data['status'] ?? 'confirmada';
        
        $statusMessage = $status === 'confirmada' 
            ? '<div class="highlight-box">
                <h2 style="margin-top: 0;">✓ Inscrição Confirmada!</h2>
                <p>Sua vaga está garantida! Aguardamos você no evento.</p>
               </div>'
            : '<div class="highlight-box">
                <h2 style="margin-top: 0;">⏳ Lista de Espera</h2>
                <p>O evento está lotado no momento, mas você foi adicionada à lista de espera. Avisaremos se uma vaga abrir!</p>
               </div>';
        
        $precoInfo = $ehGratuito 
            ? '<span style="color: #10b981; font-weight: 600;">Gratuito</span>' 
            : '<span style="font-weight: 600;">R$ ' . number_format($valor, 2, ',', '.') . '</span>';
        
        $linkButton = '';
        if ($isOnline && $linkOnline) {
            $linkButton = '<a href="' . htmlspecialchars($linkOnline) . '" class="button">🔗 Acessar Evento Online</a>';
        }
        
        $certificadoBadge = $certificado 
            ? '<p style="background-color: #d1fae5; color: #065f46; padding: 10px; border-radius: 6px; text-align: center; font-weight: 600;">
                🏆 Este evento oferece certificado de participação
               </p>' 
            : '';
        
        $instrutorInfo = '';
        if ($instrutor) {
            $instrutorInfo = '<div class="info-row">
                <div class="info-label">👨‍🏫 Instrutor(a)</div>
                <div class="info-value">' . htmlspecialchars($instrutor) . '</div>
            </div>';
        }
        
        $content = '
            <h1>Olá, ' . $userName . '! 👋</h1>
            
            ' . $statusMessage . '
            
            <p>Você se inscreveu no evento <strong>' . $eventTitle . '</strong>. Veja os detalhes abaixo:</p>
            
            <div class="info-grid">
                <div class="info-row">
                    <div class="info-label">📅 Data</div>
                    <div class="info-value">' . $eventDate . '</div>
                </div>
                <div class="info-row">
                    <div class="info-label">🕐 Horário</div>
                    <div class="info-value">' . $eventTime . '</div>
                </div>
                <div class="info-row">
                    <div class="info-label">📍 Local</div>
                    <div class="info-value">' . $eventLocation . '</div>
                </div>
                <div class="info-row">
                    <div class="info-label">🎯 Tipo</div>
                    <div class="info-value">' . $eventType . '</div>
                </div>
                ' . $instrutorInfo . '
                <div class="info-row">
                    <div class="info-label">💰 Investimento</div>
                    <div class="info-value">' . $precoInfo . '</div>
                </div>
            </div>
            
            ' . $certificadoBadge . '
            
            ' . $linkButton . '
            
            <div class="divider"></div>
            
            <h2>📝 Próximos Passos</h2>
            <ul style="color: #374151; line-height: 1.8;">
                <li>Anote o evento na sua agenda</li>
                <li>Prepare-se com antecedência</li>
                ' . ($isOnline ? '<li>Teste sua conexão de internet antes do evento</li>' : '<li>Planeje sua chegada com antecedência</li>') . '
                <li>Traga sua energia e vontade de aprender! ✨</li>
            </ul>
            
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0;"><strong>💡 Dica:</strong> Você pode acompanhar todos os seus eventos inscritos na sua área de eventos no EmpowerUp!</p>
            </div>
            
            <p style="margin-top: 30px;">Se tiver qualquer dúvida, não hesite em entrar em contato conosco.</p>
            
            <p style="margin-top: 20px; font-size: 16px;">
                Nos vemos em breve! 🚀<br>
                <strong style="color: #F68E8D;">Equipe EmpowerUp</strong>
            </p>
        ';
        
        return self::getBaseTemplate($content);
    }

    public static function courseEnrollment(array $data) {
        $userName = htmlspecialchars($data['user_name'] ?? 'Empreendedora');
        $courseTitle = htmlspecialchars($data['course_title'] ?? 'Seu novo curso');
        $courseLevel = $data['course_level'] ? htmlspecialchars($data['course_level']) : null;
        $courseDuration = $data['course_duration'] ?? null;
        $courseSlug = $data['course_slug'] ?? '';
        $courseUrlRaw = $data['course_url'] ?? Helper::buildCoursesUrl($courseSlug ? '/curso/' . $courseSlug : '');
        $courseUrl = htmlspecialchars($courseUrlRaw ?: Helper::buildCoursesUrl());
        $modules = is_array($data['modules'] ?? null) ? $data['modules'] : [];

        $moduleBlocks = '';
        if ($modules) {
            foreach ($modules as $index => $module) {
                $moduleTitle = htmlspecialchars($module['title'] ?? $module['titulo'] ?? ('Módulo ' . ($index + 1)));
                $lessons = is_array($module['lessons'] ?? null) ? $module['lessons'] : [];
                $lessonsHtml = '';
                if ($lessons) {
                    $lessonsHtml .= '<ul style="margin: 10px 0 0 18px; padding: 0; color: #374151;">';
                    foreach ($lessons as $lessonIndex => $lessonTitle) {
                        $lessonsHtml .= '<li style="margin-bottom: 6px;">' . htmlspecialchars($lessonTitle ?: ('Aula ' . ($lessonIndex + 1))) . '</li>';
                    }
                    $lessonsHtml .= '</ul>';
                }
                $moduleBlocks .= '<div style="margin-bottom: 18px; padding: 16px; border-radius: 10px; background-color: #f9fafb; border: 1px solid #e5e7eb;">'
                    . '<div style="font-weight: 600; color: #111827;">Módulo ' . ($index + 1) . ': ' . $moduleTitle . '</div>'
                    . ($lessons ? $lessonsHtml : '<p style="margin: 10px 0 0; color: #6b7280;">Atualize com as aulas deste módulo quando estiverem disponíveis.</p>')
                    . '</div>';
            }
        } else {
            $moduleBlocks = '<p style="margin-top: 10px; color: #6b7280;">Em breve você verá aqui a estrutura completa dos módulos e aulas.</p>';
        }

        $infoRows = '';
        if ($courseLevel) {
            $infoRows .= '<div class="info-row">'
                . '<div class="info-label">Nível</div>'
                . '<div class="info-value">' . $courseLevel . '</div>'
                . '</div>';
        }
        if ($courseDuration) {
            $infoRows .= '<div class="info-row">'
                . '<div class="info-label">Carga horária estimada</div>'
                . '<div class="info-value">' . htmlspecialchars($courseDuration . ' minutos') . '</div>'
                . '</div>';
        }

        $content = '
            <h1>Bem-vinda ao curso ' . $courseTitle . ', ' . $userName . '! 🎓</h1>

            <div class="highlight-box">
                <h2 style="margin-top: 0;">Inscrição confirmada!</h2>
                <p>Estamos empolgadas em acompanhar sua jornada no EmpowerUp Academy. Reserve um tempinho na agenda e mergulhe no conteúdo sempre que quiser.</p>
            </div>

            <p>Use o botão abaixo para acessar o curso e acompanhe seu progresso nas aulas.</p>

            <div style="text-align: center; margin: 25px 0;">
                <a href="' . $courseUrl . '" class="button" style="font-size: 16px; padding: 16px 32px;">Começar agora</a>
            </div>

            <div class="info-grid">
                ' . ($infoRows ?: '<div class="info-row"><div class="info-label">Status</div><div class="info-value">Inscrição ativa</div></div>') . '
                <div class="info-row">
                    <div class="info-label">Acesso</div>
                    <div class="info-value">Disponível 24h por dia para você aprender no seu ritmo</div>
                </div>
            </div>

            <h2>O que você vai encontrar:</h2>
            ' . $moduleBlocks . '

            <div class="divider"></div>

            <h2>Próximos passos</h2>
            <ul style="color: #374151; line-height: 1.8;">
                <li>Comece pela aula introdutória para alinhar expectativas.</li>
                <li>Marque as aulas concluídas para ver o seu progresso.</li>
                <li>Reserve um espaço para anotar ideias e insights.</li>
            </ul>

            <p style="margin-top: 25px;">Qualquer dúvida, conte com a nossa equipe pelo suporte EmpowerUp.</p>

            <p style="margin-top: 18px; font-size: 16px;">
                Boas aulas! 🚀<br>
                <strong style="color: #F68E8D;">Time EmpowerUp</strong>
            </p>
        ';

        return self::getBaseTemplate($content);
    }

    public static function courseCompletion(array $data) {
        $userName = htmlspecialchars($data['user_name'] ?? 'Empreendedora');
        $courseTitle = htmlspecialchars($data['course_title'] ?? 'seu curso EmpowerUp');
        $courseSlug = $data['course_slug'] ?? '';
        $courseUrlRaw = $data['course_url'] ?? Helper::buildCoursesUrl($courseSlug ? '/curso/' . $courseSlug : '');
        $courseUrl = htmlspecialchars($courseUrlRaw ?: Helper::buildCoursesUrl());
        $completedAt = $data['completed_at'] ?? null;
        $progress = isset($data['progress']) ? (float)$data['progress'] : 100;
        $certificateUrl = $data['certificate_url'] ?? null;

        $formattedDate = $completedAt ? date('d/m/Y', strtotime($completedAt)) : date('d/m/Y');

        $callToAction = $certificateUrl
            ? '<a href="' . htmlspecialchars($certificateUrl) . '" class="button" style="font-size: 16px; padding: 16px 32px;">Baixar certificado</a>'
            : '<a href="' . $courseUrl . '" class="button" style="font-size: 16px; padding: 16px 32px;">Revisitar o curso</a>';

        $content = '
            <h1>Parabéns, ' . $userName . '! 🎉</h1>

            <div class="highlight-box">
                <h2 style="margin-top: 0;">Você concluiu o curso ' . $courseTitle . '</h2>
                <p>Que conquista incrível! Celebramos sua dedicação e evolução na jornada empreendedora.</p>
            </div>

            <div class="info-grid">
                <div class="info-row">
                    <div class="info-label">Data de conclusão</div>
                    <div class="info-value">' . $formattedDate . '</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Progresso final</div>
                    <div class="info-value">' . number_format($progress, 0) . '%</div>
                </div>
            </div>

            <p>Aproveite este momento para revisar as anotações, compartilhar aprendizados com outras empreendedoras e aplicar o que aprendeu no seu negócio.</p>

            <div style="text-align: center; margin: 25px 0;">
                ' . $callToAction . '
            </div>

            <div class="divider"></div>

            <h2>Como continuar evoluindo</h2>
            <ul style="color: #374151; line-height: 1.8;">
                <li>Revise as aulas que mais gostou para fixar os pontos-chave.</li>
                <li>Compartilhe seu certificado com a comunidade EmpowerUp.</li>
                <li>Confira outros cursos disponíveis e siga aprendendo.</li>
            </ul>

            <p style="margin-top: 25px;">Estamos muito felizes por fazer parte da sua jornada. Continue contando com a EmpowerUp para crescer e inspirar outras mulheres!</p>

            <p style="margin-top: 18px; font-size: 16px;">
                Com carinho 💜<br>
                <strong style="color: #F68E8D;">Time EmpowerUp</strong>
            </p>
        ';

        return self::getBaseTemplate($content);
    }
    
    /**
     * Email de boas-vindas e verificação de conta
     */
    public static function welcomeVerification($data) {
        $userName = htmlspecialchars($data['user_name']);
        $verifyUrl = htmlspecialchars($data['verify_url']);
        
        $content = '
            <h1>Bem-vinda ao EmpowerUp, ' . $userName . '! 🎉</h1>
            
            <div class="highlight-box">
                <h2 style="margin-top: 0;">💜 Que alegria ter você aqui!</h2>
                <p>Você acaba de dar o primeiro passo para impulsionar seu empreendimento e conectar-se com outras mulheres empreendedoras incríveis.</p>
            </div>
            
            <p>Para começar sua jornada, precisamos apenas confirmar seu email. É rápido e fácil!</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="' . $verifyUrl . '" class="button" style="font-size: 16px; padding: 16px 32px;">
                    ✓ Verificar Meu Email
                </a>
            </div>
            
            <div style="background-color: #fef3f2; border-left: 4px solid #F68E8D; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0; color: #991b1b;"><strong>⏰ Atenção:</strong> Este link é válido por 24 horas.</p>
            </div>
            
            <div class="divider"></div>
            
            <h2>🌟 O que você vai encontrar no EmpowerUp:</h2>
            <ul style="color: #374151; line-height: 1.8;">
                <li><strong>Comunidade:</strong> Conecte-se com outras empreendedoras e compartilhe experiências</li>
                <li><strong>Eventos:</strong> Participe de workshops, palestras e networking</li>
                <li><strong>Cursos:</strong> Aprenda com especialistas e desenvolva novas habilidades</li>
                <li><strong>Grupos:</strong> Junte-se a comunidades específicas do seu nicho</li>
                <li><strong>Marketplace:</strong> Divulgue seus produtos e serviços</li>
            </ul>
            
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0;"><strong>💡 Dica:</strong> Complete seu perfil após verificar o email para aproveitar ao máximo a plataforma!</p>
            </div>
            
            <p style="margin-top: 30px;">Se você não criou esta conta, pode ignorar este email tranquilamente.</p>
            
            <p style="margin-top: 20px; font-size: 16px;">
                Estamos ansiosas para tê-la conosco! 🚀<br>
                <strong style="color: #F68E8D;">Equipe EmpowerUp</strong>
            </p>
        ';
        
        return self::getBaseTemplate($content);
    }
    
    /**
     * Email de recuperação de senha
     */
    public static function passwordReset($data) {
        $userName = htmlspecialchars($data['user_name']);
        $resetUrl = htmlspecialchars($data['reset_url']);
        
        $content = '
            <h1>Olá, ' . $userName . '! 🔐</h1>
            
            <p>Recebemos uma solicitação para redefinir a senha da sua conta EmpowerUp.</p>
            
            <div class="highlight-box">
                <h2 style="margin-top: 0;">🔑 Redefinir Senha</h2>
                <p>Clique no botão abaixo para criar uma nova senha segura para sua conta.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="' . $resetUrl . '" class="button" style="font-size: 16px; padding: 16px 32px;">
                    🔐 Criar Nova Senha
                </a>
            </div>
            
            <div class="info-grid" style="margin: 30px 0;">
                <div class="info-row">
                    <div class="info-label">⏰ Validade</div>
                    <div class="info-value">1 hora</div>
                </div>
                <div class="info-row">
                    <div class="info-label">🔒 Segurança</div>
                    <div class="info-value">Link de uso único</div>
                </div>
            </div>
            
            <div class="divider"></div>
            
            <h2>🛡️ Dicas de Segurança</h2>
            <ul style="color: #374151; line-height: 1.8;">
                <li>Use uma senha forte com letras, números e símbolos</li>
                <li>Não compartilhe sua senha com ninguém</li>
                <li>Evite senhas óbvias como datas de nascimento</li>
                <li>Considere usar um gerenciador de senhas</li>
            </ul>
            
            <div style="background-color: #fef3f2; border-left: 4px solid #dc2626; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0; color: #991b1b;">
                    <strong>⚠️ Não solicitou esta alteração?</strong><br>
                    Se você não pediu para redefinir sua senha, ignore este email com segurança. Sua conta permanece protegida.
                </p>
            </div>
            
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0;"><strong>💡 Precisa de ajuda?</strong> Entre em contato com nosso suporte se tiver qualquer dúvida sobre sua conta.</p>
            </div>
            
            <p style="margin-top: 20px; font-size: 16px;">
                Estamos aqui para ajudar! 💜<br>
                <strong style="color: #F68E8D;">Equipe EmpowerUp</strong>
            </p>
        ';
        
        return self::getBaseTemplate($content);
    }
    
    /**
     * Email de confirmação de assinatura de plano
     */
    public static function subscriptionConfirmation($data) {
        $userName = htmlspecialchars($data['user_name']);
        $planName = htmlspecialchars($data['plan_name']);
        $planPrice = htmlspecialchars($data['plan_price']);
        $startDate = htmlspecialchars($data['start_date']);
        $endDate = htmlspecialchars($data['end_date']);
        $features = $data['features'] ?? [];
        
        $content = '
            <h1>Parabéns, ' . $userName . '! 🎉</h1>
            
            <div class="highlight-box">
                <h2 style="margin-top: 0;">✨ Sua assinatura está ativa!</h2>
                <p>Você acaba de dar um passo incrível para impulsionar seu empreendimento. Bem-vinda ao <strong>' . $planName . '</strong>!</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #F68E8D 0%, #FF9A9A 100%); border-radius: 12px; padding: 30px; margin: 30px 0; color: white; text-align: center;">
                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Plano Ativo</div>
                <div style="font-size: 32px; font-weight: bold; margin-bottom: 8px;">' . $planName . '</div>
                <div style="font-size: 24px; font-weight: 600;">' . $planPrice . '</div>
            </div>
            
            <div class="divider"></div>
            
            <h2>📋 Detalhes da Assinatura</h2>
            <div class="info-grid">
                <div class="info-row">
                    <div class="info-label">📅 Início</div>
                    <div class="info-value">' . $startDate . '</div>
                </div>
                <div class="info-row">
                    <div class="info-label">🔄 Renovação</div>
                    <div class="info-value">' . $endDate . '</div>
                </div>
                <div class="info-row">
                    <div class="info-label">💳 Status</div>
                    <div class="info-value"><span class="badge" style="background-color: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px;">Ativa</span></div>
                </div>
            </div>
            
            <div class="divider"></div>
            
            <h2>🎁 Benefícios Inclusos</h2>
            <ul style="color: #374151; line-height: 1.8;">';
        
        foreach ($features as $feature) {
            $content .= '<li style="margin-bottom: 8px;">✓ ' . htmlspecialchars($feature) . '</li>';
        }
        
        $content .= '
            </ul>
            
            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0; color: #166534;">
                    <strong>🎊 Aproveite ao máximo!</strong><br>
                    Sua assinatura já está ativa e todos os benefícios estão disponíveis agora mesmo. Comece a explorar!
                </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://empowerup.com.br/assinaturas" class="button" style="font-size: 16px; padding: 16px 32px;">
                    🚀 Acessar Minha Área de Assinante
                </a>
            </div>
            
            <div class="divider"></div>
            
            <h2>💡 Dicas para Aproveitar Melhor</h2>
            <ul style="color: #374151; line-height: 1.8;">
                <li>Explore todos os cursos exclusivos disponíveis para assinantes</li>
                <li>Participe dos eventos premium com networking qualificado</li>
                <li>Acesse materiais e templates que vão acelerar seu negócio</li>
                <li>Conecte-se com outras empreendedoras da comunidade premium</li>
            </ul>
            
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0;">
                    <strong>📌 Lembrete:</strong> Sua assinatura será renovada automaticamente em <strong>' . $endDate . '</strong>. 
                    Você pode gerenciar ou cancelar sua assinatura a qualquer momento na área de configurações.
                </p>
            </div>
            
            <div style="background-color: #fef3f2; border-left: 4px solid #F68E8D; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0;">
                    <strong>❓ Dúvidas sobre sua assinatura?</strong><br>
                    Nossa equipe está sempre disponível para ajudar! Entre em contato pelo email 
                    <a href="mailto:assinaturas@empowerup.com.br" style="color: #F68E8D; text-decoration: none;">assinaturas@empowerup.com.br</a>
                </p>
            </div>
            
            <p style="margin-top: 30px; font-size: 16px; text-align: center;">
                Obrigada por escolher o EmpowerUp! 💜<br>
                Estamos juntas nessa jornada de sucesso!<br><br>
                <strong style="color: #F68E8D;">Equipe EmpowerUp</strong>
            </p>
        ';
        
        return self::getBaseTemplate($content);
    }
}
