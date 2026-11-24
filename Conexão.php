<?php
$host = '10.0.11.225';
$db   = 'Gerenciamento de Eventos';
$user = 'aluno';
$pass = 'ceep@1234';

try {
    $pdo = new PDO("mysql:host=$host;dbname=Gerenciamento de Eventos;charset=utf8mb4", $user, $pass);
    
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch (PDOException $e) {
    die("Erro na conexão com o banco de dados: " . $e->getMessage());
}
?>