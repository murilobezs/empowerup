<?php
/**
 * Classe de conexão com banco de dados usando PDO
 */

class Database {
    private $host = 'localhost';
    private $db_name = 'empowerup';
    private $username = 'root';
    private $password = '';
    private $charset = 'utf8mb4';
    private $pdo;
    private static $instance = null;

    /**
     * Singleton pattern para conexão única
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->connect();
    }

    /**
     * Conectar ao banco de dados
     */
    private function connect() {
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset={$this->charset}";

            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES {$this->charset}",
                PDO::ATTR_PERSISTENT => true
            ];

            $this->pdo = new PDO($dsn, $this->username, $this->password, $options);
            
        } catch (PDOException $e) {
            $this->logError('Database connection failed: ' . $e->getMessage());
            throw new Exception('Erro de conexão com o banco de dados');
        }
    }

    /**
     * Obter conexão PDO
     */
    public function getConnection() {
        return $this->pdo;
    }

    /**
     * Executar query preparada
     */
    public function query($sql, $params = []) {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            $this->logError('Query failed: ' . $e->getMessage() . ' SQL: ' . $sql);
            throw new Exception('Erro na consulta ao banco de dados');
        }
    }

    /**
     * Buscar múltiplos registros
     */
    public function fetchAll($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetchAll();
    }

    /**
     * Buscar um registro
     */
    public function fetch($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetch();
    }

    /**
     * Executar query e retornar ID inserido
     */
    public function insert($sql, $params = []) {
        $this->query($sql, $params);
        return $this->pdo->lastInsertId();
    }

    /**
     * Executar query e retornar número de linhas afetadas
     */
    public function execute($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->rowCount();
    }

    /**
     * Iniciar transação
     */
    public function beginTransaction() {
        return $this->pdo->beginTransaction();
    }

    /**
     * Confirmar transação
     */
    public function commit() {
        return $this->pdo->commit();
    }

    /**
     * Reverter transação
     */
    public function rollback() {
        return $this->pdo->rollback();
    }

    /**
     * Verificar se está em transação
     */
    public function inTransaction() {
        return $this->pdo->inTransaction();
    }

    /**
     * Log de erros
     */
    private function logError($message) {
        $logFile = __DIR__ . '/../logs/database_errors.log';
        $logDir = dirname($logFile);
        
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[{$timestamp}] {$message}" . PHP_EOL;
        file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
    }

    /**
     * Prevenir clonagem
     */
    private function __clone() {}

    /**
     * Prevenir deserialização
     */
    public function __wakeup() {
        throw new Exception("Cannot unserialize");
    }
}
