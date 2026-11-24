<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

if (file_exists('./Conexão.php')) {
    require_once './Conexão.php';
} elseif (file_exists('../API/Conexão.php')) {
    require_once '../API/Conexão.php';
} else {
    require_once 'Conexão.php';
}

$evento_id = $_GET['evento_id'] ?? null;

if (!$evento_id) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'ID do evento não informado.']);
    exit;
}

try {
    $comentarios = [];

    // Faz o LEFT JOIN com a tabela professor e traz explicitamente a coluna comentario
    $sql = "SELECT c.*, 
                   COALESCE(p.nome, 'Professor') AS nome_usuario, 
                   p.foto 
            FROM comentarios c 
            LEFT JOIN professor p ON c.usuario_id = p.id 
            WHERE c.evento_id = ? 
            ORDER BY c.data_criacao DESC";

    if (isset($pdo) && $pdo instanceof PDO) {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$evento_id]);
        $comentarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } elseif (isset($conn) && $conn instanceof mysqli) {
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $evento_id);
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $comentarios[] = $row;
        }
    }

    echo json_encode(['sucesso' => true, 'comentarios' => $comentarios]);

} catch (Exception $e) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro: ' . $e->getMessage()]);
}
?>