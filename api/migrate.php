<?php
/**
 * Migration runner
 * Usage: php migrate.php
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/utils/Helper.php';

echo "Starting migrations...\n";

try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();

    // Ensure migrations table exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS schema_migrations (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        migration VARCHAR(255) NOT NULL UNIQUE,
        run_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    $migrationsDir = __DIR__ . '/migrations';
    if (!is_dir($migrationsDir)) {
        echo "No migrations directory found.\n";
        exit(0);
    }

    $files = array_values(array_filter(scandir($migrationsDir), function($f) {
        return preg_match('/^\d+_.*\.php$/', $f);
    }));

    sort($files);

    foreach ($files as $file) {
        $name = $file;
        // Check if already run
        $stmt = $pdo->prepare('SELECT COUNT(*) as cnt FROM schema_migrations WHERE migration = ?');
        $stmt->execute([$name]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row && (int)$row['cnt'] > 0) {
            echo "Skipping {$name} (already applied)\n";
            continue;
        }

        echo "Applying {$name}...\n";
        $path = $migrationsDir . '/' . $file;
        $migration = require $path; // should return a callable
        if (!is_callable($migration)) {
            throw new Exception("Migration {$name} does not return a callable");
        }

        // Run migration. Avoid forcing transaction rollback: many DDL statements autocommit on MySQL.
        try {
            $migration($pdo);
            $stmt = $pdo->prepare('INSERT INTO schema_migrations (migration) VALUES (?)');
            $stmt->execute([$name]);
            echo "Applied {$name}\n";
        } catch (Exception $e) {
            if ($pdo->inTransaction()) {
                try { $pdo->rollBack(); } catch (Exception $_) {}
            }
            throw $e;
        }
    }

    echo "Migrations finished.\n";

} catch (Exception $e) {
    echo "Migration error: " . $e->getMessage() . "\n";
    Helper::logError('Migration error: ' . $e->getMessage());
    exit(1);
}
