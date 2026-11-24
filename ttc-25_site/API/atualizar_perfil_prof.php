<?php
// Desativa a exibição direta de erros HTML para nunca corromper o JSON
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');

try {
    // Procura o arquivo de conexão lidando com variações de acentuação
    $encontrouConexao = false;
    $caminhosPossiveis = ['../Conexão.php', '../conexao.php', 'Conexão.php', 'conexao.php'];
    
    foreach ($caminhosPossiveis as $caminho) {
        if (file_exists($caminho)) {
            require_once $caminho;
            $encontrouConexao = true;
            break;
        }
    }

    if (!$encontrouConexao) {
        throw new Exception("Arquivo de conexão não encontrado.");
    }

    if (!isset($pdo)) {
        throw new Exception("A variável \$pdo não foi definida.");
    }

    session_start();

    $idUsuario = $_SESSION['id'] ?? null;
    if (!$idUsuario) {
        throw new Exception("Sessão expirada. Faça login novamente.");
    }

    $nome = trim($_POST['nome'] ?? '');
    if (empty($nome)) {
        throw new Exception("O nome não pode ficar vazio.");
    }

    $caminhoFoto = null;

    // Processamento do upload da foto
    if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
        $pastaDestinoFisica = __DIR__ . '/../uploads/';
        
        if (!is_dir($pastaDestinoFisica)) {
            mkdir($pastaDestinoFisica, 0777, true);
        }

        $extensao = strtolower(pathinfo($_FILES['foto']['name'], PATHINFO_EXTENSION));
        $extensoesPermitidas = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

        if (!in_array($extensao, $extensoesPermitidas)) {
            throw new Exception("Formato de imagem inválido.");
        }

        $novoNomeArquivo = 'perfil_' . $idUsuario . '_' . time() . '.' . $extensao;
        $destinoCompleto = $pastaDestinoFisica . $novoNomeArquivo;

        if (move_uploaded_file($_FILES['foto']['tmp_name'], $destinoCompleto)) {
            $caminhoFoto = './uploads/' . $novoNomeArquivo;
        } else {
            throw new Exception("Falha ao mover o arquivo de upload.");
        }
    }

    // Atualiza os dados na tabela 'professor'
    if ($caminhoFoto) {
        $stmt = $pdo->prepare("UPDATE professor SET nome = :nome, foto = :foto WHERE id = :id");
        $stmt->bindParam(':foto', $caminhoFoto);
    } else {
        $stmt = $pdo->prepare("UPDATE professor SET nome = :nome WHERE id = :id");
    }

    $stmt->bindParam(':nome', $nome);
    $stmt->bindParam(':id', $idUsuario, PDO::PARAM_INT);
    $stmt->execute();

    // Atualiza imediatamente as variáveis da sessão
    $_SESSION['nome'] = $nome;
    if ($caminhoFoto) {
        $_SESSION['foto'] = $caminhoFoto;
    }

    echo json_encode(['sucesso' => true]);

} catch (Exception $e) {
    echo json_encode(['sucesso' => false, 'mensagem' => $e->getMessage()]);
}
?>