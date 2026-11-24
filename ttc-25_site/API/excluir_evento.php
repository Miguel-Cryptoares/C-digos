<?php
header('Content-Type: application/json; charset=utf-8');

include 'Conexão.php';

$dados = json_decode(file_get_contents('php://input'), true);
$id = $dados['id'] ?? null;

if (!$id) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'ID não informado.']);
    exit;
}

try {
    // Aponta explicitamente para a tabela "eventos"
    $stmt = $pdo->prepare("DELETE FROM eventos WHERE id = ?");
    $stmt->execute([$id]);
    
    echo json_encode(['sucesso' => true, 'mensagem' => 'Evento excluído com sucesso!']);
} catch (PDOException $e) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao excluir: ' . $e->getMessage()]);
}
?>