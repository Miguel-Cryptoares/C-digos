<?php
include 'Conexão.php';
// Aqui fica toda a regra de negócio (buscar, tratar, validar)
$stmt = $pdo->query("SELECT * FROM eventos ORDER BY data ASC");
$listaDeEventos = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>