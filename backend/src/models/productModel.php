<?php

class ProductModel {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    function createProductModel($name, $price) {
    
    $cleanPrice = str_replace(['R$', ' ', '.', ','], ['', '', '', '.'], $price);
    
    if (!is_numeric($cleanPrice)) {
        throw new InvalidArgumentException("O preço deve ser um valor numérico.");
    }

    $floatPrice = (float) $cleanPrice;

    $response = $this->db->products->insertOne([
        "name" => $name,
        "price" => $floatPrice 
    ]);
    
    return $response;
}


    function addProductCartModel($userId, $productId){
        try {
            $objProductId = new MongoDB\BSON\ObjectId($productId);
        } catch (Exception $e) {
            return false;
        }

        // 1. Busca o produto para pegar o PREÇO
        $product = $this->db->products->findOne(["_id"=> $objProductId]);
        if (!$product) return false;

        $userCart = $this->db->cart->findOne(["userId"=> $userId]);

        if ($userCart) {
            // Se o usuário já tem carrinho, verificamos se o produto já está lá
            $products = (array)$userCart['products'];
            $found = false;

            // Percorre os produtos para ver se encontra o mesmo ID
            foreach ($products as &$p) {
                if ($p['productId'] == $objProductId) {
                    // Se achou, aumenta a quantidade
                    $p['quantity'] = ($p['quantity'] ?? 1) + 1;
                    $found = true;
                    break;
                }
            }

            if ($found) {
                // Atualiza o array inteiro com a nova quantidade
                $this->db->cart->updateOne(
                    ["userId" => $userId],
                    ['$set' => ['products' => $products]]
                );
                return true;
            } else {
                // Se não achou, adiciona novo item com PREÇO e QUANTIDADE 1
                $newItem = [
                    "productId" => $objProductId,
                    "name" => $product['name'],
                    "price" => $product['price'], // Salvando o preço
                    "quantity" => 1
                ];
                $this->db->cart->updateOne(
                    ["userId" => $userId],
                    ['$push' => ['products' => $newItem]]
                );
                return true;
            }
        } else {
            // Cria carrinho novo se não existir
            $result = $this->db->cart->insertOne([
                "userId"=> $userId,
                "products" => [
                    [
                        "productId" => $objProductId, 
                        "name" => $product['name'],
                        "price" => $product['price'], 
                        "quantity" => 1
                    ]
                ]
            ]);
            return $result->getInsertedCount() > 0;
        }
    }

    // Atualiza a quantidade de um produto específico
    function updateCartQuantityModel($userId, $productId, $quantity) {
        try {
            $objProductId = new MongoDB\BSON\ObjectId($productId);
            
            // Impede quantidade menor que 1
            if ($quantity < 1) return false;

            $result = $this->db->cart->updateOne(
                ["userId" => $userId, "products.productId" => $objProductId],
                ['$set' => ["products.$.quantity" => $quantity]]
            );
            
            return $result->getModifiedCount() > 0;
        } catch (Exception $e) {
            return false;
        }
    }

    // Remove um produto do carrinho
    function removeFromCartModel($userId, $productId) {
        try {
            $objProductId = new MongoDB\BSON\ObjectId($productId);

            $result = $this->db->cart->updateOne(
                ["userId" => $userId],
                ['$pull' => ["products" => ["productId" => $objProductId]]]
            );
            
            return $result->getModifiedCount() > 0;
        } catch (Exception $e) {
            return false;
        }
    }

    function getProductDetailsModel($productId) {
        try {
            //converte a string do $productId em uma instância de ObjectId compatível com o MongoDB
            $id = new MongoDB\BSON\ObjectId($productId);
            
            return $this->db->products->findOne([
                "_id" => $id
            ]);
        } catch (Exception $e) {
            return null;
        }
    }

    function publicProductRateModel($userId, $productId, $comment) {
        try {
            $id = new MongoDB\BSON\ObjectId($productId);
            
            return $this->db->reviews->insertOne([
                "userId" => $userId,
                "productId" => $id,
                "comment" => $comment
            ]);
        } catch (Exception $e) {
            return null;
        }
    }

    function getProductCommentsModel($productId) {
    try {
        $id = new MongoDB\BSON\ObjectId($productId);
        
        $cursor = $this->db->reviews->find([
            "productId" => $id
        ]);

        return $cursor->toArray(); 

    } catch (Exception $e) {
        return [];
    }
}

    function getStoreSearchedProductsModel($searchedWord){
        $products = $this->db->products->find([
            "name" => new MongoDB\BSON\Regex($searchedWord, 'i')
        ]);
        return $products->toArray();
    }

    function sellerGetStoreSearchedProductsModel($searchedWord){
        $products = $this->db->products->find([
            "name" => new MongoDB\BSON\Regex($searchedWord, 'i')
        ]);
        return $products->toArray();
    }//pegar somente os produtos do vendedor

    function getUserCartModel($userId) {
        try {
            // Busca o documento do carrinho
            $cart = $this->db->cart->findOne(["userId" => $userId]);
            
            // Se existir o carrinho e a lista de produtos, retorna a lista
            if ($cart && isset($cart['products'])) {
                return (array)$cart['products'];
            }
            
            return []; 
        } catch (Exception $e) {
            return [];
        }
    }
    // Busca os produtos do carrinho de um usuário específico
}
?>

