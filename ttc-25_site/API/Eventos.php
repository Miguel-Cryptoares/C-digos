<?php
// API do calendário SGEE: consulta, cadastra, edita e exclui eventos.
// Este arquivo deve ficar na mesma pasta de conexao.php e do calendário.
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/Conexão.php';

if (!isset($conexao) || !($conexao instanceof mysqli)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'A conexão não foi encontrada. Confira se conexao.php cria a variável $conexao.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$conexao->set_charset('utf8mb4');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$raw = file_get_contents('php://input');
$input = json_decode($raw, true);
if (!is_array($input)) $input = [];

function resposta($success, $message = '', $extra = [], $status = 200) {
    http_response_code($status);
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra), JSON_UNESCAPED_UNICODE);
    exit;
}

function campo($dados, $chave) {
    return isset($dados[$chave]) ? trim((string)$dados[$chave]) : '';
}

try {
    if ($method === 'GET') {
        $sql = "SELECT id, titulo, categoria, local_evento, DATE_FORMAT(data_evento, '%Y-%m-%d') AS data_evento,
                       TIME_FORMAT(hora_inicio, '%H:%i') AS hora_inicio,
                       TIME_FORMAT(hora_fim, '%H:%i') AS hora_fim,
                       publico_alvo, turmas, descricao
                FROM eventos ORDER BY data_evento, hora_inicio, titulo";
        $resultado = $conexao->query($sql);
        $eventos = [];
        while ($linha = $resultado->fetch_assoc()) {
            $eventos[] = [
                'id' => (int)$linha['id'],
                'title' => $linha['titulo'],
                'category' => $linha['categoria'],
                'location' => $linha['local_evento'],
                'date' => $linha['data_evento'],
                'start' => $linha['hora_inicio'],
                'end' => $linha['hora_fim'],
                'targetType' => $linha['publico_alvo'],
                'classes' => $linha['turmas'] ?? '',
                'description' => $linha['descricao'] ?? ''
            ];
        }
        resposta(true, '', ['events' => $eventos]);
    }

    if ($method === 'POST' || $method === 'PUT') {
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        $titulo = campo($input, 'title');
        $categoria = campo($input, 'category');
        $local = campo($input, 'location');
        $data = campo($input, 'date');
        $inicio = campo($input, 'start');
        $fim = campo($input, 'end');
        $publico = campo($input, 'targetType');
        $turmas = campo($input, 'classes');
        $descricao = campo($input, 'description');

        if ($titulo === '' || $categoria === '' || $local === '' || $data === '' || $inicio === '' || $fim === '' || $publico === '') {
            resposta(false, 'Preencha todos os campos obrigatórios.', [], 400);
        }
        if (!in_array($publico, ['Toda a Escola', 'Turmas Específicas'], true)) {
            resposta(false, 'O público-alvo informado não é válido.', [], 400);
        }
        if ($publico === 'Turmas Específicas' && $turmas === '') {
            resposta(false, 'Informe as turmas participantes.', [], 400);
        }
        if ($fim <= $inicio) {
            resposta(false, 'O horário de término deve ser depois do início.', [], 400);
        }
        if ($publico === 'Toda a Escola') $turmas = '';

        if ($method === 'POST') {
            $sql = 'INSERT INTO eventos (titulo, categoria, local_evento, data_evento, hora_inicio, hora_fim, publico_alvo, turmas, descricao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
            $stmt = $conexao->prepare($sql);
            $stmt->bind_param('sssssssss', $titulo, $categoria, $local, $data, $inicio, $fim, $publico, $turmas, $descricao);
            $stmt->execute();
            resposta(true, 'Evento cadastrado.', ['id' => $stmt->insert_id], 201);
        }

        if ($id <= 0) resposta(false, 'ID do evento inválido para edição.', [], 400);
        $sql = 'UPDATE eventos SET titulo=?, categoria=?, local_evento=?, data_evento=?, hora_inicio=?, hora_fim=?, publico_alvo=?, turmas=?, descricao=? WHERE id=?';
        $stmt = $conexao->prepare($sql);
        $stmt->bind_param('sssssssssi', $titulo, $categoria, $local, $data, $inicio, $fim, $publico, $turmas, $descricao, $id);
        $stmt->execute();
        if ($stmt->affected_rows === 0) {
            $check = $conexao->prepare('SELECT id FROM eventos WHERE id=?');
            $check->bind_param('i', $id);
            $check->execute();
            $check->store_result();
            if ($check->num_rows === 0) resposta(false, 'Evento não encontrado.', [], 404);
        }
        resposta(true, 'Evento atualizado.');
    }

    if ($method === 'DELETE') {
        $id = isset($input['id']) ? (int)$input['id'] : (int)($_GET['id'] ?? 0);
        if ($id <= 0) resposta(false, 'ID do evento inválido para exclusão.', [], 400);
        $stmt = $conexao->prepare('DELETE FROM eventos WHERE id=?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        if ($stmt->affected_rows === 0) resposta(false, 'Evento não encontrado.', [], 404);
        resposta(true, 'Evento excluído.');
    }

    header('Allow: GET, POST, PUT, DELETE');
    resposta(false, 'Método não permitido.', [], 405);
} catch (Throwable $erro) {
    error_log('SGEE eventos_api.php: ' . $erro->getMessage());
    resposta(false, 'Ocorreu um erro ao acessar o banco. Confira a tabela eventos e o log do Apache/PHP.', [], 500);
}
?>
