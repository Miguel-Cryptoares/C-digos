<?php
// Inicia a sessão
session_start();

// Verifica se o usuário está logado (se não estiver, manda de volta para o login)
if (!isset($_SESSION['usuario_id'])) {
    header("Location: index.html");
    exit();
}

// Define as variáveis que serão usadas na tela
$nomeUsuario  = $_SESSION['usuario_nome'] ?? 'Usuário';
$cargoUsuario = $_SESSION['usuario_cargo'] ?? 'Coordenação';
?>