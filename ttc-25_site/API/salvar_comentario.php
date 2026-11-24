<?php
header('Content-Type: application/json; charset=utf-8');
session_start();
include_once("Conexão.php");

$data = json_decode(file_get_contents("php://input"), true);

$evento_id = isset($data['evento_id']) ? intval($data['evento_id']) : 0;
$texto = isset($data['texto']) ? trim($data['texto']) : '';

// Obtém o ID do professor logado na sessão atual
$usuario_id = isset($_SESSION['professor_id']) ? intval($_SESSION['professor_id']) : (isset($_SESSION['usuario_id']) ? intval($_SESSION['usuario_id']) : 0);

if ($evento_id <= 0 || empty($texto)) {
    echo json_encode(["sucesso" => false, "mensagem" => "Dados incompletos."]);
    exit;
}

if ($usuario_id <= 0) {
    echo json_encode(["sucesso" => false, "mensagem" => "Usuário não autenticado ou sessão expirada."]);
    exit;
}

try {
    $sql = "INSERT INTO comentarios (evento_id, usuario_id, comentario, data_criacao) VALUES (:evento_id, :usuario_id, :comentario, NOW())";
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':evento_id', $evento_id, PDO::PARAM_INT);
    $stmt->bindValue(':usuario_id', $usuario_id, PDO::PARAM_INT);
    $stmt->bindValue(':comentario', $texto, PDO::PARAM_STR);
    $stmt->execute();

    echo json_encode(["sucesso" => true]);

} catch (Exception $e) {
    echo json_encode(["sucesso" => false, "mensagem" => $e->getMessage()]);
}
?>