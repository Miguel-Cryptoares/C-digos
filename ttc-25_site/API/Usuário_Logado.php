<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

// Se não estiver logado, avisa o JavaScript
if (!isset($_SESSION['cpf'])) {
    echo json_encode(['sucesso' => false, 'nome' => 'Visitante', 'tipo' => '']);
    exit;
}

require_once 'Conexão.php'; // Altere o nome aqui se o seu arquivo de conexão for diferente

$cpf = $_SESSION['cpf'];
$tabela = $_SESSION['tipo']; // 'professor' ou 'coordenador'

try {
    $sql = "SELECT nome FROM $tabela WHERE cpf = :cpf LIMIT 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':cpf' => $cpf]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($usuario && !empty($usuario['nome'])) {
        $cargo = ($tabela === 'professor') ? 'Professor(a)' : 'Coordenação Pedagógica';
        echo json_encode([
            'sucesso' => true,
            'nome' => $usuario['nome'],
            'tipo' => $cargo
        ]);
        exit;
    }
} catch (PDOException $e) {
    // Tratamento de erro silencioso
}

echo json_encode(['sucesso' => false, 'nome' => 'Usuário', 'tipo' => '']);
?>