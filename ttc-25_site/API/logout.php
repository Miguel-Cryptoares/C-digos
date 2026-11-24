<?php
// FORÇA O NAVEGADOR A NUNCA GUARDAR ESTA RESPOSTA EM CACHE
header("Cache-Control: no-cache, no-store, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: 0");

session_start();

// Destrói todas as variáveis de sessão
$_SESSION = array();

// Se for preciso destruir o cookie de sessão, apaga-o também
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Finalmente, destrói a sessão
session_destroy();

// Redireciona o utilizador de volta para a página de login
header("Location: index.html");
exit;
?>