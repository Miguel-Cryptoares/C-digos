<?php
header('Content-Type: application/json; charset=utf-8');
include 'Conexão.php';

$id = $_GET['id'] ?? null;

if (!$id) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'ID não informado.']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM eventos WHERE id = ?");
    $stmt->execute([$id]);
    $evento = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($evento) {
        echo json_encode(['sucesso' => true, 'evento' => $evento]);
    } else {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Evento não encontrado.']);
    }
} catch (PDOException $e) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro: ' . $e->getMessage()]);
}
?>