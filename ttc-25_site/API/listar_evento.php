<?php
header('Content-Type: application/json; charset=utf-8');
include 'Conexão.php';

try {
    // Busca todos os eventos ordenados por data
    $stmt = $pdo->query("SELECT * FROM eventos ORDER BY data ASC, horario_inicio ASC");
    $eventos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($eventos ? $eventos : []);
} catch (PDOException $e) {
    echo json_encode(['erro' => $e->getMessage()]);
}
?>