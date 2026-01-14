<?php
session_start();
require_once __DIR__ . '/../models/storeModel.php';

class StoreController {
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

    //como se trata de um get, não tem valores, no corpo
    function showStoreProductsController() {
        $storeModel = new StoreModel($this->db);
        $products = $storeModel->showStoreProductsModel();

        // Converter datas UTCDateTime para formato legível
        $processedProducts = [];
        foreach ($products as $product) {
            $processedProduct = $product;
            
            // Converter _id para string se necessário
            if (isset($product['_id']) && is_object($product['_id'])) {
                $processedProduct['_id'] = (string)$product['_id'];
            }
            
            // Converter promotionStartDate
            if (isset($product['promotionStartDate']) && $product['promotionStartDate'] instanceof MongoDB\BSON\UTCDateTime) {
                $processedProduct['promotionStartDate'] = $product['promotionStartDate']->toDateTime()->format('Y-m-d H:i:s');
            }
            
            // Converter promotionEndDate
            if (isset($product['promotionEndDate']) && $product['promotionEndDate'] instanceof MongoDB\BSON\UTCDateTime) {
                $processedProduct['promotionEndDate'] = $product['promotionEndDate']->toDateTime()->format('Y-m-d H:i:s');
            }
            
            $processedProducts[] = $processedProduct;
        }

        return [
            "ok" => true,
            "msg" => $processedProducts,
        ];
    }

    function sellerShowStoreProductsController() {
        $this->requireSeller();
        $storeModel = new StoreModel($this->db);
        $products = $storeModel->sellerShowStoreProductsModel();

        // Converter datas UTCDateTime para formato legível
        $processedProducts = [];
        foreach ($products as $product) {
            $processedProduct = $product;
            
            // Converter _id para string se necessário
            if (isset($product['_id']) && is_object($product['_id'])) {
                $processedProduct['_id'] = (string)$product['_id'];
            }
            
            // Converter promotionStartDate
            if (isset($product['promotionStartDate']) && $product['promotionStartDate'] instanceof MongoDB\BSON\UTCDateTime) {
                $processedProduct['promotionStartDate'] = $product['promotionStartDate']->toDateTime()->format('Y-m-d H:i:s');
            }
            
            // Converter promotionEndDate
            if (isset($product['promotionEndDate']) && $product['promotionEndDate'] instanceof MongoDB\BSON\UTCDateTime) {
                $processedProduct['promotionEndDate'] = $product['promotionEndDate']->toDateTime()->format('Y-m-d H:i:s');
            }
            
            $processedProducts[] = $processedProduct;
        }

        return [
            "ok" => true,
            "msg" => $processedProducts,
        ];
    }

    function addProductPromotionController() {
        $this->requireSeller();
        $req = json_decode(file_get_contents("php://input"), true);
        $body = $req["body"] ?? null;

        $productId = $body["productId"] ?? "";
        $percentagePromotion = $body["percentagePromotion"] ?? "";
        $startDate = $body["startDate"] ?? "";
        $endDate = $body["endDate"] ?? "";

        if (!$productId || !$percentagePromotion || !$startDate || !$endDate) {
            return [
                "ok" => false,
                "msg" => "Dados incompletos"
            ];
        }

        // Verificar se o produto pertence ao vendedor
        try {
            $id = new MongoDB\BSON\ObjectId($productId);
            $product = $this->db->products->findOne(["_id" => $id]);
            
            if (!$product) {
                return ["ok" => false, "msg" => "Produto não encontrado"];
            }

            $sellerId = $_SESSION["userId"] ?? null;
            $productSellerId = $product["sellerId"] ?? null;
            if ($productSellerId !== null && $productSellerId !== $sellerId) {
                return ["ok" => false, "msg" => "Você não tem permissão para criar promoção neste produto"];
            }
        } catch (Exception $e) {
            return ["ok" => false, "msg" => "ID do produto inválido"];
        }

        $storeModel = new StoreModel($this->db);
        $success = $storeModel->addProductPromotionModel($productId, $percentagePromotion, $startDate, $endDate);

        if ($success) {
        return [
            "ok" => true,
            "msg" => "Promoção adicionada com sucesso",
            ];
        }

        return [
            "ok" => false,
            "msg" => "Erro ao adicionar promoção",
        ];
    }

    function removeProductPromotionController() {
        $this->requireSeller();
        $req = json_decode(file_get_contents("php://input"), true);
        $body = $req["body"] ?? null;

        $productId = $body["productId"] ?? "";

        $storeModel = new StoreModel($this->db);
        $products = $storeModel->removeProductPromotionModel($productId);

        return [
            "ok" => true,
            "msg" => "Promoção removida com sucesso",
        ];
    }
    
}
?>