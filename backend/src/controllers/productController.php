<?php
session_start();
require_once __DIR__ . '/../models/productModel.php';

class ProductController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    private function requireSeller() {
    if (!isset($_SESSION["role"]) || $_SESSION["role"] !== "seller") {
        echo json_encode([
            "ok" => false, 
            "msg" => "incorrectUserType"
        ]);
        exit;
    }
}

    function createProductController() {
        $this->requireSeller();
        $req = json_decode(file_get_contents("php://input"), true);
        $body = $req["body"] ?? null;

        $name = $body["name"] ?? "";
        $price = $body["price"] ?? "";

        if (!$name || !$price) {
            return ["ok" => false, "msg" => "Dados incompletos"];
        }

        $productModel = new ProductModel($this->db);
        $productModel->createProductModel($name, $price);

        return [
            "ok" => true,
            "msg" => "Produto cadastrado com sucesso",
        ];
    }

    function addProductCartController() {
        $req = json_decode(file_get_contents("php://input"), true);
        $body = $req["body"] ?? null;

        $userId = $_SESSION["userId"] ?? null; 
        
        if (!$userId) {
            return ["ok" => false, "msg" => "Usuário não logado"];
        }

        $productId = $body["productId"] ?? "";

        $productModel = new ProductModel($this->db);
        $ok = $productModel->addProductCartModel($userId, $productId);
        
        if ($ok) {
            return [
                "ok" => true,
                "msg" => "Produto adicionado ao carrinho",
            ];
        }
        return [
            "ok" => false,
            "msg" => "Falha ao adicionar produto ao carrinho",
        ];
    }

    function updateCartQuantityController() {
        $req = json_decode(file_get_contents("php://input"), true);
        $body = $req["body"] ?? null;
        $userId = $_SESSION["userId"] ?? null;

        if (!$userId) return ["ok" => false, "msg" => "Usuário não logado"];

        $productId = $body["productId"] ?? null;
        $quantity = $body["quantity"] ?? null;

        $productModel = new ProductModel($this->db);
        $ok = $productModel->updateCartQuantityModel($userId, $productId, $quantity);

        return ["ok" => $ok];
    }

    function removeFromCartController() {
        $req = json_decode(file_get_contents("php://input"), true);
        $body = $req["body"] ?? null;
        $userId = $_SESSION["userId"] ?? null;

        if (!$userId) return ["ok" => false, "msg" => "Usuário não logado"];

        $productId = $body["productId"] ?? null;

        $productModel = new ProductModel($this->db);
        $ok = $productModel->removeFromCartModel($userId, $productId);

        return ["ok" => $ok];
    }
    
    function getProductDetailsController(){
        $req = json_decode(file_get_contents("php://input"), true);
        $body = $req["body"] ?? null;

        $productId = $body["productId"] ?? "";

        $productModel = new ProductModel($this->db);
        $productDetails = $productModel->getProductDetailsModel($productId);
        
        if ($productDetails) {
            return [
                "ok" => true,
                "msg" => [
                    "name" => $productDetails["name"],
                    "price" => $productDetails["price"] ?? 0
                ]
            ];
        }

        return ["ok" => false, "msg" => "Produto não encontrado"];
    }

    function getProductCommentsController(){
        $req = json_decode(file_get_contents("php://input"), true);
        $body = $req["body"] ?? null;

        $productId = $body["productId"] ?? "";

        $productModel = new ProductModel($this->db);
        
        $commentsList = $productModel->getProductCommentsModel($productId);
        
        return [
            "ok" => true,
            "msg" => $commentsList
        ];
    }

    function getStoreSearchedProductsController(){
        $req = json_decode(file_get_contents("php://input"), true);
        $body = $req["body"] ?? null;

        $searchedWord = $body["searchedWord"] ?? "";

        $productModel = new ProductModel($this->db);
        
        $products = $productModel->getStoreSearchedProductsModel($searchedWord);
        
        return [
            "ok" => true,
            "msg" => $products
        ];
    }

    function sellerGetStoreSearchedProductsController(){
        $this->requireSeller();
        $req = json_decode(file_get_contents("php://input"), true);
        $body = $req["body"] ?? null;

        $searchedWord = $body["searchedWord"] ?? "";

        $productModel = new ProductModel($this->db);
        
        $products = $productModel->sellerGetStoreSearchedProductsModel($searchedWord);
        
        return [
            "ok" => true,
            "msg" => $products
        ];
    }

    function publicProductRateController(){
        $req = json_decode(file_get_contents("php://input"), true);
        $body = $req["body"] ?? null;

        $productId = $body["productId"] ?? "";
        $comment = $body["comment"] ?? "";
        $userId = $_SESSION["userId"] ?? null; 

        $productModel = new ProductModel($this->db);
        $ok = $productModel->publicProductRateModel($userId, $productId, $comment);
        
        if ($ok) {
            return [
                "ok" => true,
                "msg" => "Produto cadastrado com sucesso"
            ];
        }

        return ["ok" => false, "msg" => "Produto não encontrado"];
    }
    // Dentro da classe ProductController
       
  // Mantendo seu padrão sem a palavra "public"
    public function getUserCartController() {
        // Em vez de ler do JSON enviado pelo React, lemos da Sessão do PHP
        // Isso garante que pegamos o ID de quem está realmente logado
        $userId = $_SESSION["userId"] ?? null;

        // Se não houver sessão ativa, retornamos erro
        if (!$userId) {
            return ["ok" => false, "msg" => "Usuário não está logado"];
        }

        $productModel = new ProductModel($this->db);
        
        // A busca no banco continua igual
        $cart = $productModel->getUserCartModel($userId);
        
        return ["ok" => true, "msg" => $cart];
    }

}
?>