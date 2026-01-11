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

// Função para criar o pedido e gerar o pagamento
    function createPaymentController() {
        $userId = $_SESSION["userId"] ?? null;
        
        // Se quiser testar sem estar logado, descomente a linha abaixo (mas cuidado em produção!)
        // $userId = "ID_DO_USUARIO_NO_MONGO"; 

        if (!$userId) return ["ok" => false, "msg" => "Usuário não logado"];

        $productModel = new ProductModel($this->db);
        $cartItems = $productModel->getUserCartModel($userId); // Pega itens do banco
        
        if (empty($cartItems)) return ["ok" => false, "msg" => "Carrinho vazio"];

        // 1. Preparar produtos para o formato da AbacatePay
        $productsPayload = [];
        foreach ($cartItems as $item) {
            $productsPayload[] = [
                "externalId" => (string)$item['productId'], // ID do seu banco
                "name" => $item['name'],
                "quantity" => $item['quantity'] ?? 1,
                "price" => (int)($item['price'] * 100), // Converte R$ 10,00 para 1000 centavos
                "description" => "Produto da loja"
            ];
        }

        // 2. Configuração da Requisição
        $url = "https://api.abacatepay.com/v1/billing/create";
        
        // IMPORTANTE: Coloque sua chave de DESENVOLVIMENTO aqui
        $apiKey = "abc_dev_bKNW4EGuwkaqBTW1acYwMtJ6"; 

        $data = [
            "frequency" => "ONE_TIME",
            "methods" => ["PIX"],
            "products" => $productsPayload,
            "returnUrl" => "http://localhost:5173/cart",
            "completionUrl" => "http://localhost:5173/cart",
            
            // DADOS DO CLIENTE CORRIGIDOS
            "customer" => [
                "name" => "Cliente Teste", 
                "cellphone" => "11999999999", // Apenas números, sem parênteses ou traços
                "email" => "cliente@teste.com",
                "taxId" => "10102237980" // ESTE É UM CPF VÁLIDO (Gerado para teste)
            ]
        ];

        // 3. Envio via cURL (igual ao seu exemplo)
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer $apiKey",
            "Content-Type: application/json"
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $result = json_decode($response, true);

        // 4. Retorno para o Frontend
        if ($httpCode === 200 || $httpCode === 201) {
        
            $billingId = $result['data']['id']; // O ID da cobrança (ex: bill_123...)
            $paymentUrl = $result['data']['url'];

            // CALCULA O TOTAL DO PEDIDO (em reais)
            $totalPrice = 0;
            foreach ($cartItems as $item) {
                $totalPrice += ($item['price'] * ($item['quantity'] ?? 1));
            }

            // SALVA O PEDIDO NO BANCO COMO 'PENDENTE'
            $productModel->createOrderModel($userId, $cartItems, $totalPrice, $billingId);
            
            // (Opcional) Limpa o carrinho depois de criar o pedido
            // $productModel->clearCartModel($userId);

            return [
                "ok" => true, 
                "paymentUrl" => $paymentUrl
            ];
        }
    }
}
?>