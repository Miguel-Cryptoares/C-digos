<?php
header('Content-Type: application/json; charset=utf-8');

include 'Conexão.php';

// Lê o JSON enviado pelo fetch
$dados = json_decode(file_get_contents('php://input'), true);

if (!$dados) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Nenhum dado recebido.']);
    exit;
}

$id = $dados['id'] ?? null;
$nome_evento = $dados['nome_evento'] ?? '';
$categoria = $dados['categoria'] ?? '';
$local = $dados['local'] ?? '';
$data = $dados['data'] ?? '';
$horario_inicio = !empty($dados['horario_inicio']) ? $dados['horario_inicio'] : null;
$horario_termino = !empty($dados['horario_termino']) ? $dados['horario_termino'] : null;
$publico_alvo = $dados['publico_alvo'] ?? '';
$turmas_participantes = $dados['turmas_participantes'] ?? '';
$descricao = $dados['descricao'] ?? '';

if (empty($nome_evento) || empty($data)) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'O nome do evento e a data são obrigatórios.']);
    exit;
}

try {
    if (!empty($id)) {
        // Atualizar evento existente na tabela eventos
        $sql = "UPDATE eventos SET nome_evento = ?, categoria = ?, local = ?, data = ?, horario_inicio = ?, horario_termino = ?, publico_alvo = ?, turmas_participantes = ?, descricao = ? WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$nome_evento, $categoria, $local, $data, $horario_inicio, $horario_termino, $publico_alvo, $turmas_participantes, $descricao, $id]);
        echo json_encode(['sucesso' => true, 'mensagem' => 'Evento atualizado com sucesso!']);
    } else {
        // Inserir novo evento na tabela eventos
        $sql = "INSERT INTO eventos (nome_evento, categoria, local, data, horario_inicio, horario_termino, publico_alvo, turmas_participantes, descricao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$nome_evento, $categoria, $local, $data, $horario_inicio, $horario_termino, $publico_alvo, $turmas_participantes, $descricao]);
        echo json_encode(['sucesso' => true, 'id' => $pdo->lastInsertId(), 'mensagem' => 'Evento criado com sucesso!']);
    }
} catch (PDOException $e) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro no banco de dados: ' . $e->getMessage()]);
}
?>