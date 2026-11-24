<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

try {
    if (!isset($_SESSION['usuario_id'])) {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Sessão inválida ou expirada. Faça login novamente.']);
        exit;
    }

    $host = '10.0.11.225';
    $db   = 'Gerenciamento de Eventos'; 
    $user = 'aluno';
    $pass = 'ceep@1234';

    $conn = new mysqli($host, $user, $pass, $db);
    if ($conn->connect_error) {
        throw new Exception('Erro na conexão com o banco de dados: ' . $conn->connect_error);
    }
    $conn->set_charset("utf8mb4");

    $id = $_SESSION['usuario_id'];
    $nome = $_POST['nome'] ?? '';
    $fotoCaminho = null;

    // Processamento do upload da foto
    if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
        // Como o script está na pasta API/, a pasta uploads fica um nível acima (raiz do projeto)
        $diretorioUploads = __DIR__ . '/../uploads/';
        
        if (!is_dir($diretorioUploads)) {
            mkdir($diretorioUploads, 0777, true);
        }

        $extensao = strtolower(pathinfo($_FILES['foto']['name'], PATHINFO_EXTENSION));
        $permitidas = ['jpg', 'jpeg', 'png', 'webp'];

        if (!in_array($extensao, $permitidas)) {
            throw new Exception('Formato de imagem não permitido. Use JPG, PNG ou WEBP.');
        }

        $novoNomeFoto = 'user_' . $id . '_' . time() . '.' . $extensao;
        $caminhoCompleto = $diretorioUploads . $novoNomeFoto;

        if (move_uploaded_file($_FILES['foto']['tmp_name'], $caminhoCompleto)) {
            // Caminho relativo armazenado na base de dados
            $fotoCaminho = 'uploads/' . $novoNomeFoto;
        } else {
            throw new Exception('Falha ao mover o ficheiro de imagem carregado.');
        }
    }

    // Identifica se o usuário é coordenador ou professor com base na sessão
    $tabela = $_SESSION['tipo'] ?? 'coordenador';
    // Garante que a tabela é válida para evitar SQL Injection
    $tabela = ($tabela === 'professor') ? 'professor' : 'coordenador';

    if ($fotoCaminho) {
        $stmt = $conn->prepare("UPDATE {$tabela} SET nome = ?, foto = ? WHERE id = ?");
        $stmt->bind_param("ssi", $nome, $fotoCaminho, $id);
    } else {
        $stmt = $conn->prepare("UPDATE {$tabela} SET nome = ? WHERE id = ?");
        $stmt->bind_param("si", $nome, $id);
    }

    if ($stmt->execute()) {
        $_SESSION['usuario_nome'] = $nome;
        if ($fotoCaminho) {
            $_SESSION['usuario_foto'] = $fotoCaminho;
        }

        echo json_encode(['sucesso' => true, 'mensagem' => 'Perfil atualizado com sucesso!']);
    } else {
        throw new Exception('Erro ao atualizar no banco de dados: ' . $stmt->error);
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    echo json_encode(['sucesso' => false, 'mensagem' => $e->getMessage()]);
}
?>