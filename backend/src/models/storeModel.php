<?php
class StoreModel {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    function showStoreProductsModel() {
        $response = $this->db->products->find();
        return $response->toArray();
    }

    function sellerShowStoreProductsModel() {
        $response = $this->db->products->find();
        return $response->toArray();
    }//pegar somente os produtos que sejam desse vendedor

    function addProductPromotionModel($productId, $percentagePromotion, $startDate, $endDate){
        try {
            $id = new MongoDB\BSON\ObjectId($productId);
            
            // Converter string de data para timestamp
            // Formato esperado: "YYYY-MM-DD HH:MM:SS"
            $startTimestamp = strtotime($startDate);
            $endTimestamp = strtotime($endDate);
            
            if ($startTimestamp === false || $endTimestamp === false) {
                error_log("Erro ao converter datas: startDate=$startDate, endDate=$endDate");
                return false;
            }
            
            // Criar UTCDateTime a partir do timestamp (em milissegundos)
            $updateData = [
                'percentagePromotion' => (float)$percentagePromotion,
                'promotionStartDate' => new MongoDB\BSON\UTCDateTime($startTimestamp * 1000),
                'promotionEndDate' => new MongoDB\BSON\UTCDateTime($endTimestamp * 1000)
            ];
            
            $result = $this->db->products->updateOne(
                ["_id" => $id],
                ['$set' => $updateData]
            );
            
            if ($result->getModifiedCount() > 0 || $result->getMatchedCount() > 0) {
                error_log("Promoção adicionada com sucesso para produto $productId");
                return true;
            } else {
                error_log("Nenhum documento foi modificado para produto $productId");
                return false;
            }
        } catch (Exception $e) {
            error_log("Erro ao adicionar promoção: " . $e->getMessage());
            return false;
        }
    }

    function removeProductPromotionModel($productId){
        try {
            $id = new MongoDB\BSON\ObjectId($productId);
            
            $result = $this->db->products->updateOne(
                ["_id" => $id],
                ['$set' => [
                    "percentagePromotion" => 0,
                    "promotionStartDate" => null,
                    "promotionEndDate" => null
                ]]
            );
            
            return $result->getModifiedCount() > 0;
        } catch (Exception $e) {
            return false;
        }
    }

    function isPromotionActive($product) {
        if (!isset($product['percentagePromotion']) || $product['percentagePromotion'] <= 0) {
            return false;
        }

        $now = new MongoDB\BSON\UTCDateTime();
        $startDate = $product['promotionStartDate'] ?? null;
        $endDate = $product['promotionEndDate'] ?? null;

        if (!$startDate || !$endDate) {
            return false;
        }

        return ($now >= $startDate && $now <= $endDate);
    }

    function calculatePromotionPrice($product) {
        if (!$this->isPromotionActive($product)) {
            return $product['price'] ?? 0;
        }

        $price = $product['price'] ?? 0;
        $percentage = $product['percentagePromotion'] ?? 0;
        
        return $price * (1 - $percentage / 100);
    }
}
?>