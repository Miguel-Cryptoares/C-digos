<?php
header("Cache-Control: no-cache, no-store, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: 0");

session_start();
header('Content-Type: application/json; charset=utf-8');

include_once("Conexão.php");

try {
    $sql = "SELECT id, nome_evento, categoria, local, data, horario_inicio, horario_termino, publico_alvo, turmas_participantes, descricao FROM eventos ORDER BY data DESC";
    $stmt = $pdo->query($sql);
    $eventos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $resultadoFinal = [];

    foreach ($eventos as $row) {
        $eventoId = intval($row['id']);

        $horarioInicio = !empty($row['horario_inicio']) ? date('H:i', strtotime($row['horario_inicio'])) : '';
        $horarioTermino = !empty($row['horario_termino']) ? date('H:i', strtotime($row['horario_termino'])) : '';
        
        $row['horario'] = trim($horarioInicio . ($horarioTermino ? ' - ' . $horarioTermino : ''));
        $row['titulo'] = $row['nome_evento'];

        // BUSCA OS COMENTÁRIOS JUNTANDO O NOME E A FOTO DA TABELA PROFESSOR
        $sqlComentarios = "SELECT c.id, c.comentario AS texto, c.data_criacao, 
                                   u.nome AS nome_usuario, u.foto AS foto_usuario 
                            FROM comentarios c
                            LEFT JOIN professor u ON c.usuario_id = u.id
                            WHERE c.evento_id = :evento_id
                            ORDER BY c.data_criacao ASC";
                            
        $stmtComentarios = $pdo->prepare($sqlComentarios);
        $stmtComentarios->bindValue(':evento_id', $eventoId, PDO::PARAM_INT);
        $stmtComentarios->execute();
        $comentariosEvento = $stmtComentarios->fetchAll(PDO::FETCH_ASSOC);

        foreach ($comentariosEvento as &$c) {
            $c['nome'] = $c['nome_usuario'] ?? 'Professor';
            $c['tempo'] = $c['data_criacao'] ?? '';
            
            // Atribui a foto do usuário ou uma imagem padrão caso esteja nula
            if (!empty($c['foto_usuario'])) {
                $c['foto'] = $c['foto_usuario'];
            } else {
                $c['foto'] = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150';
            }
        }

        $row['comentarios'] = $comentariosEvento;
        $resultadoFinal[] = $row;
    }

    echo json_encode($resultadoFinal);

} catch (Exception $e) {
    echo json_encode(["erro_sql" => $e->getMessage()]);
}
?>