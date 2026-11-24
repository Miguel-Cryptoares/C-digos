<?php
session_start();

// Supondo que $usuario seja o array vindo do seu PDO ($stmt->fetch(PDO::FETCH_ASSOC))
if ($usuario) {
    // Salva o nome do banco na sessão
    $_SESSION['usuario_nome'] = $usuario['nome']; 

    header("Location: principal.php");
    exit();
}