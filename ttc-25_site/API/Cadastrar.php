<?php
require_once 'Conexão.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = $_POST['nome'] ?? '';
    $tipo = $_POST['tipo'] ?? '';
    $cpf = $_POST['cpf'] ?? '';
    $senha = $_POST['senha'] ?? '';

    if (!empty($nome) && !empty($cpf) && !empty($senha) && !empty($tipo)) {

        $senha_criptografada = password_hash($senha, PASSWORD_DEFAULT);

        $tabela = ($tipo === 'coordenador') ? 'coordenador' : 'professor';

        try {
            $sql = "INSERT INTO $tabela (nome, cpf, senha) VALUES (:nome, :cpf, :senha)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':nome' => $nome,
                ':cpf' => $cpf,
                ':senha' => $senha_criptografada
            ]);

            echo json_encode([
                'sucesso' => true,
                'mensagem' => "Cadastro realizado com sucesso!"
            ]);
            exit;

        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                echo json_encode([
                    'sucesso' => false,
                    'mensagem' => "Erro: Este CPF já está cadastrado."
                ]);
            } else {
                echo json_encode([
                    'sucesso' => false,
                    'mensagem' => "Erro ao cadastrar: " . $e->getMessage()
                ]);
            }
            exit;
        }
    } else {
        echo json_encode([
            'sucesso' => false,
            'mensagem' => "Preencha todos os campos obrigatórios!"
        ]);
        exit;
    }
}
?>