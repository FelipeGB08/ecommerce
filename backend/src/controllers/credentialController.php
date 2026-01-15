<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../models/credentialModel.php';

class CredentialController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    function signupController() {
        $req = json_decode(file_get_contents("php://input"), true);
        $body = $req["body"] ?? null;

        $email = $body["email"] ?? "";
        $password = $body["password"] ?? "";
        $role = $body["seller"] ?? "customer";

        if (!$email || !$password) {
            return ["ok" => false, "msg" => "Dados incompletos"];
        }

        $CredentialModel = new CredentialModel($this->db);
        $id = $CredentialModel->signupModel($email, $password, $role);

        if (!$id) {
            return ["ok" => false, "msg" => "Este email já está registrado"];
        }

        return [
            "ok" => true,
            "msg" => "Usuário criado com sucesso",
            "id" => (string)$id
        ];
    }

    function loginController() {
        $req = json_decode(file_get_contents("php://input"), true);
        $body = $req["body"] ?? null;

        $email = $body["email"] ?? "";
        $password = $body["password"] ?? "";
        $role = $body["role"] ?? "";

        if (!$email || !$password) {
            return ["ok" => false, "msg" => "Dados incompletos"];
        }

        $CredentialModel = new CredentialModel($this->db);
        $ok = $CredentialModel->loginModel($email, $password, $role);

        if ($ok) {
            return ["ok" => true, "msg" => "Login realizado com sucesso"];
        }

        return ["ok" => false, "msg" => "Email ou senha incorretos"];
    }

    function getUserInfoController() {
        if (!isset($_SESSION["userId"])) {
            return ["ok" => false, "msg" => "Usuário não logado"];
        }

        $userId = $_SESSION["userId"];
        $role = $_SESSION["role"] ?? "customer";
        $email = $_SESSION["email"] ?? "";

        // Buscar email do usuário no banco se não estiver na sessão
        if (!$email) {
            try {
                $user = $this->db->users->findOne(["_id" => new MongoDB\BSON\ObjectId($userId)]);
                if ($user) {
                    $email = $user["email"] ?? "";
                    $_SESSION["email"] = $email;
                }
            } catch (Exception $e) {
                // Ignora erro
            }
        }

        return [
            "ok" => true,
            "userId" => $userId,
            "role" => $role,
            "email" => $email
        ];
    }
}
?>