<?php
/**
 * Simple Mailer - dev-friendly. By default writes to logs/mail.log.
 * To enable real SMTP, configure SMTP_* constants in config.php and implement PHPMailer.
 */

class Mailer {
    public static function send($toEmail, $subject, $body, $options = []) {
        $logDir = __DIR__ . '/../logs';
        if (!is_dir($logDir)) mkdir($logDir, 0755, true);
        $logFile = $logDir . '/mail.log';

        $message = [
            'to' => $toEmail,
            'subject' => $subject,
            'body' => $body,
            'options' => $options,
            'timestamp' => date('c')
        ];

        // If SMTP is configured and enabled, try to send via SMTP
        if (defined('SMTP_ENABLED') && SMTP_ENABLED && defined('SMTP_HOST') && SMTP_HOST) {
            try {
                return self::sendSmtp($toEmail, $subject, $body);
            } catch (Exception $e) {
                // Log SMTP failure and fallback to file
                file_put_contents($logFile, json_encode(['error' => $e->getMessage(), 'timestamp' => date('c')]) . PHP_EOL, FILE_APPEND | LOCK_EX);
            }
        }

        // Fallback: write to file
        file_put_contents($logFile, json_encode($message, JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND | LOCK_EX);
        return true;
    }

    private static function sendSmtp($toEmail, $subject, $body) {
        $host = SMTP_HOST;
        $port = SMTP_PORT;
        $encryption = SMTP_ENCRYPTION; // none | tls | ssl
        $username = SMTP_USERNAME;
        $password = SMTP_PASSWORD;

        $from = MAIL_FROM ?? $username;
        $fromName = MAIL_FROM_NAME ?? $from;

        $remote = ($encryption === 'ssl') ? 'ssl://' . $host : $host;
        $context = stream_context_create([]);
        $flags = STREAM_CLIENT_CONNECT;

        $fp = stream_socket_client($remote . ':' . $port, $errno, $errstr, 30, $flags, $context);
        if (!$fp) {
            throw new Exception('SMTP connection failed: ' . $errstr);
        }

        $getResponse = function() use ($fp) {
            $data = '';
            while ($str = fgets($fp, 515)) {
                $data .= $str;
                if (substr($str, 3, 1) == ' ') break;
            }
            return $data;
        };

        $res = $getResponse();

        $send = function($cmd) use ($fp, $getResponse) {
            fwrite($fp, $cmd . "\r\n");
            return $getResponse();
        };

        // EHLO
        $hostname = gethostname() ?: 'localhost';
        $res = $send('EHLO ' . $hostname);

        // STARTTLS if requested
        if ($encryption === 'tls') {
            $res = $send('STARTTLS');
            // enable crypto
            if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new Exception('Failed to enable TLS');
            }
            // EHLO again after TLS
            $res = $send('EHLO ' . $hostname);
        }

        // AUTH LOGIN
        $res = $send('AUTH LOGIN');
        $res = $send(base64_encode($username));
        $res = $send(base64_encode($password));

        // MAIL FROM
        $res = $send('MAIL FROM: <' . $from . '>');
        // RCPT TO
        $res = $send('RCPT TO: <' . $toEmail . '>');
        // DATA
        $res = $send('DATA');

        $headers = [];
        $headers[] = 'From: ' . $fromName . ' <' . $from . '>';
        $headers[] = 'To: ' . $toEmail;
        $headers[] = 'Subject: ' . $subject;
        $headers[] = 'MIME-Version: 1.0';
        
        // Detectar se é HTML ou texto simples
        $isHtml = stripos($body, '<html') !== false || stripos($body, '<!DOCTYPE') !== false;
        if ($isHtml) {
            $headers[] = 'Content-Type: text/html; charset=UTF-8';
        } else {
            $headers[] = 'Content-Type: text/plain; charset=UTF-8';
        }

        $data = implode("\r\n", $headers) . "\r\n\r\n" . $body . "\r\n.";

        $res = $send($data);

        // QUIT
        $res = $send('QUIT');
        fclose($fp);
        return true;
    }
}
