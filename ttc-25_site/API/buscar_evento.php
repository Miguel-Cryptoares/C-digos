<?php
header('Content-Type: application/json; charset=utf-8');
include 'Conexão.php';

try {
    // Alterado de tb_eventos para eventos
    $stmt = $pdo->query("SELECT * FROM eventos");
    $eventos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($eventos);
} catch (PDOException $e) {
    echo json_encode(['erro' => $e->getMessage()]);
}
?>