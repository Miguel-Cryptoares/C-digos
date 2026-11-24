<?php
header('Content-Type: application/json; charset=utf-8');
session_start();
include_once("Conexão.php"); // ajuste para o nome do seu arquivo de conexão com o banco

$evento_id = isset($_GET['evento_id']) ? intval($_GET['evento_id']) : 0;

if ($evento_id <= 0) {
    echo json_encode(["sucesso" => false, "mensagem" => "ID do evento inválido."]);
    exit;
}

try {
    // Consulta unindo a tabela de comentários com os dados do usuário/professor
    // Ajuste o nome da tabela de usuários se necessário (ex: 'professor' ou 'usuarios')
    $sql = "SELECT c.id, c.comentario AS texto, c.data_criacao, 
                   u.nome AS nome_usuario, u.foto 
            FROM comentarios c
            LEFT JOIN professor u ON c.usuario_id = u.id
            WHERE c.evento_id = :evento_id
            ORDER BY c.data_criacao ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':evento_id', $evento_id, PDO::PARAM_INT);
    $stmt->execute();
    $comentarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["sucesso" => true, "comentarios" => $comentarios]);

} catch (Exception $e) {
    echo json_encode(["sucesso" => false, "mensagem" => $e->getMessage()]);
}
?>