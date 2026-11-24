<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Cache-Control: no-cache, no-store, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: 0");

session_start();
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['logado' => false]);
    exit;
}

$host = '10.0.11.225';
$db   = 'Gerenciamento de Eventos';
$user = 'aluno';
$pass = 'ceep@1234';

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    echo json_encode(['logado' => false, 'erro' => 'Conexao falhou']);
    exit;
}

$id = $_SESSION['usuario_id'];
$tabela = (isset($_SESSION['tipo']) && $_SESSION['tipo'] === 'professor') ? 'professor' : 'coordenador';

// ADICIONADO 'foto' NA CONSULTA SQL PARA BUSCAR A IMAGEM DO BANCO
$sql = "SELECT nome, foto FROM $tabela WHERE id = ?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(['logado' => false, 'erro' => 'Erro na query']);
    exit;
}

$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    // Se o usuário tiver uma foto salva no banco, usa ela; caso contrário, usa a padrão
    $fotoPerfil = !empty($row['foto']) 
        ? $row['foto'] . '?t=' . time() 
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150';

    echo json_encode([
        'logado' => true,
        'nome' => $row['nome'] ?? 'Usuário',
        'tipo' => $_SESSION['tipo'] ?? 'coordenador',
        'foto' => $fotoPerfil
    ]);
} else {
    echo json_encode(['logado' => false]);
}

$stmt->close();
$conn->close();
?>