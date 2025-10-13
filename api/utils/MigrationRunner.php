<?php
/**
 * Lightweight migration runner used during API bootstrap.
 */

class MigrationRunner
{
    private const LOCK_FILE = __DIR__ . '/../cache/migrations.lock';
    private static bool $hasRun = false;

    public static function runPendingMigrations(): void
    {
        if (self::$hasRun) {
            return;
        }
        self::$hasRun = true;

        if (!defined('RUN_AUTO_MIGRATIONS') || !RUN_AUTO_MIGRATIONS) {
            return;
        }

        // CLI already handles migrations; avoid double execution
        if (php_sapi_name() === 'cli') {
            return;
        }

        $lockHandle = self::acquireLock();
        if ($lockHandle === null) {
            return;
        }

        try {
            self::execute();
        } catch (Throwable $e) {
            if (class_exists('Helper')) {
                Helper::logError('Auto-migration failed: ' . $e->getMessage());
            }
        } finally {
            self::releaseLock($lockHandle);
        }
    }

    private static function execute(): void
    {
        $db = Database::getInstance();
        $pdo = $db->getConnection();

        $pdo->exec("CREATE TABLE IF NOT EXISTS schema_migrations (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            migration VARCHAR(255) NOT NULL UNIQUE,
            run_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        $migrationsDir = __DIR__ . '/../migrations';
        if (!is_dir($migrationsDir)) {
            return;
        }

        $files = array_values(array_filter(scandir($migrationsDir), function ($file) {
            return preg_match('/^\d+_.*\.php$/', $file);
        }));
        sort($files, SORT_NATURAL);

        foreach ($files as $file) {
            $migrationName = $file;

            if (self::alreadyRan($pdo, $migrationName)) {
                continue;
            }

            $callable = require $migrationsDir . '/' . $file;
            if (!is_callable($callable)) {
                throw new RuntimeException("Migration {$migrationName} does not return a callable");
            }

            self::runMigration($pdo, $callable, $migrationName);
        }
    }

    private static function alreadyRan(PDO $pdo, string $migration): bool
    {
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM schema_migrations WHERE migration = ?');
        $stmt->execute([$migration]);
        return (int) $stmt->fetchColumn() > 0;
    }

    private static function runMigration(PDO $pdo, callable $migration, string $name): void
    {
        try {
            $migration($pdo);
            $stmt = $pdo->prepare('INSERT INTO schema_migrations (migration) VALUES (?)');
            $stmt->execute([$name]);
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                try {
                    $pdo->rollBack();
                } catch (Throwable $_) {
                }
            }
            throw $e;
        }
    }

    private static function acquireLock()
    {
        $lockFile = self::LOCK_FILE;
        $lockDir = dirname($lockFile);
        if (!is_dir($lockDir)) {
            if (!@mkdir($lockDir, 0755, true) && !is_dir($lockDir)) {
                return null;
            }
        }

        $handle = @fopen($lockFile, 'c');
        if (!$handle) {
            return null;
        }

        if (!@flock($handle, LOCK_EX | LOCK_NB)) {
            fclose($handle);
            return null;
        }

        ftruncate($handle, 0);
        fwrite($handle, (string) time());
        fflush($handle);

        return $handle;
    }

    private static function releaseLock($handle): void
    {
        if (is_resource($handle)) {
            @flock($handle, LOCK_UN);
            @fclose($handle);
        }
    }
}
