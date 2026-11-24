<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

// Inclui o arquivo de conexão
if (file_exists('./Conexão.php')) {
    require_once './Conexão.php';
} elseif (file_exists('../API/Conexão.php')) {
    require_once '../API/Conexão.php';
} else {
    require_once 'Conexão.php';
}

// Verifica se o usuário está logado aceitando diferentes nomes de variáveis de sessão comuns
$usuarioLogado = $_SESSION['id'] ?? $_SESSION['usuario_id'] ?? $_SESSION['id_usuario'] ?? null;

if (!$usuarioLogado) {
    echo json_encode([
        'sucesso' => false, 
        'mensagem' => 'Acesso não autorizado. Sessão não encontrada ou expirada. (ID de sessão vazio)'
    ]);
    exit;
}

$dados = json_decode(file_get_contents('php://input'), true);
$idComentario = $dados['id'] ?? null;

if (!$idComentario) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'ID do comentário não informado.']);
    exit;
}

try {
    $sucesso = false;

    // Tenta usar PDO ($pdo)
    if (isset($pdo) && $pdo instanceof PDO) {
        $stmt = $pdo->prepare("DELETE FROM comentarios WHERE id = :id");
        $stmt->execute([':id' => $idComentario]);
        $sucesso = ($stmt->rowCount() > 0);
    } 
    // Tenta usar MySQLi ($conn)
    elseif (isset($conn) && $conn instanceof mysqli) {
        $stmt = $conn->prepare("DELETE FROM comentarios WHERE id = ?");
        $stmt->bind_param("i", $idComentario);
        $stmt->execute();
        $sucesso = ($stmt->affected_rows > 0);
    } else {
        throw new Exception("Nenhuma conexão válida com o banco de dados foi encontrada.");
    }

    if ($sucesso) {
        echo json_encode(['sucesso' => true]);
    } else {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Comentário não encontrado ou já excluído.']);
    }

} catch (Exception $e) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>