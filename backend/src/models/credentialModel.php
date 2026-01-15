<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

class CredentialModel {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    function signupModel($email, $password, $role) {
        // Verificar se email já existe
        $existingUser = $this->db->users->findOne(["email" => $email]);
        if ($existingUser) {
            return false; // Email já registrado
        }

        $hashed = password_hash($password, PASSWORD_DEFAULT);

        try {
            $response = $this->db->users->insertOne([
                "email"=> $email,
                "password"=> $hashed, 
                "role"=> $role,
            ]);
            return $response->getInsertedId();
        } catch (Exception $e) {
            // Se houver erro de índice único (email duplicado)
            return false;
        }
    }

    function loginModel($email, $password) {
    $user = $this->db->users->findOne(["email" => $email]);
    if (!$user) {
        return false;
    }

    if (password_verify($password, $user["password"])) {
        $_SESSION["userId"] = (string) $user["_id"];
        $_SESSION["role"] = (string) ($user["role"] ?? "customer");
        $_SESSION["email"] = (string) ($user["email"] ?? $email);
        
        return true;
    }

    return false;
}
}
?>