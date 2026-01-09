<?php
// webhook.php - VERSÃO DE PRODUÇÃO (LIMPA)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

try {
    require_once __DIR__ . '/vendor/autoload.php';
    require_once __DIR__ . '/src/models/productModel.php';

    $client = new MongoDB\Client("mongodb://localhost:27017");
    $db = $client->ecommerce; 

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (isset($data['event']) && $data['event'] === 'billing.paid') {
        
        // Caminho correto que descobrimos juntos
        $billingId = $data['data']['billing']['id']; 

        $productModel = new ProductModel($db);
        
        if ($productModel->approveOrderModel($billingId)) {
            http_response_code(200);
            echo json_encode(["status" => "success"]);
        } else {
            // Pedido não encontrado, mas respondemos 200 para o webhook não reenviar
            http_response_code(200); 
        }
    } else {
        http_response_code(200);
    }
} catch (Throwable $e) {
    http_response_code(500);
}
?>