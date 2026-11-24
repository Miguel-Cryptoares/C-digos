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

$usuarioLogado = $_SESSION['id'] ?? $_SESSION['usuario_id'] ?? $_SESSION['id_usuario'] ?? null;

if (!$usuarioLogado) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Acesso não autorizado.']);
    exit;
}

$dados = json_decode(file_get_contents('php://input'), true);
$idComentario = $dados['id'] ?? null;
$resposta = trim($dados['resposta'] ?? '');

if (!$idComentario) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'ID do comentário não informado.']);
    exit;
}

try {
    $sucesso = false;

    if (isset($pdo) && $pdo instanceof PDO) {
        $stmt = $pdo->prepare("UPDATE comentarios SET resposta_coordenacao = :resposta WHERE id = :id");
        $stmt->execute([':resposta' => $resposta, ':id' => $idComentario]);
        $sucesso = true; // Mesmo se o texto for igual, considera sucesso
    } 
    elseif (isset($conn) && $conn instanceof mysqli) {
        $stmt = $conn->prepare("UPDATE comentarios SET resposta_coordenacao = ? WHERE id = ?");
        $stmt->bind_param("si", $resposta, $idComentario);
        $stmt->execute();
        $sucesso = true;
    } else {
        throw new Exception("Conexão com o banco não encontrada.");
    }

    echo json_encode(['sucesso' => true]);

} catch (Exception $e) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>