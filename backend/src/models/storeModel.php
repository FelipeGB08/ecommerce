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

    function addProductPromotionModel($productId, $promotionalPrice, $startDate, $endDate){
        try {
            $id = new MongoDB\BSON\ObjectId($productId);
            
            $result = $this->db->products->updateOne(
                ["_id" => $id],
                ['$set' => [
                    "promotionalPrice" => (float)$promotionalPrice,
                    "promotionStartDate" => new MongoDB\BSON\UTCDateTime(strtotime($startDate) * 1000),
                    "promotionEndDate" => new MongoDB\BSON\UTCDateTime(strtotime($endDate) * 1000)
                ]]
            );
            
            return $result->getModifiedCount() > 0 || $result->getMatchedCount() > 0;
        } catch (Exception $e) {
            return false;
        }
    }

    function removeProductPromotionModel($productId){
        try {
            $id = new MongoDB\BSON\ObjectId($productId);
            
            $result = $this->db->products->updateOne(
                ["_id" => $id],
                ['$unset' => [
                    "promotionalPrice" => "",
                    "promotionStartDate" => "",
                    "promotionEndDate" => ""
                ]]
            );
            
            return $result->getModifiedCount() > 0;
        } catch (Exception $e) {
            return false;
        }
    }

    function isPromotionActive($product) {
        return isset($product['percentagePromotion']) && $product['percentagePromotion'] > 0;
    }

    function calculatePromotionPrice($product) {
        if (!$this->isPromotionActive($product)) {
            return $product['price'] ?? 0;
        }

        return $product['price'] * (1 - ($product['percentagePromotion'] / 100));
    }
}
?>