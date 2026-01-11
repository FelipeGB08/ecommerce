<?php

class ProductModel {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    function createProductModel($name, $price, $sellerId = null, $coverImage = null) {
    
    $cleanPrice = str_replace(['R$', ' ', '.', ','], ['', '', '', '.'], $price);
    
    if (!is_numeric($cleanPrice)) {
        throw new InvalidArgumentException("O preço deve ser um valor numérico.");
    }

    $floatPrice = (float) $cleanPrice;

    $productData = [
        "name" => $name,
        "price" => $floatPrice 
    ];

    // Se houver sellerId, adiciona ao produto (salva como string)
    if ($sellerId) {
        $productData["sellerId"] = (string) $sellerId;
    }

    // Se houver imagem de capa, adiciona ao produto
    if ($coverImage) {
        $productData["coverImage"] = $coverImage;
    }

    $response = $this->db->products->insertOne($productData);
    
    return $response;
}

    function updateProductModel($productId, $name, $price) {
        try {
            $id = new MongoDB\BSON\ObjectId($productId);
            
            $cleanPrice = str_replace(['R$', ' ', '.', ','], ['', '', '', '.'], $price);
            if (!is_numeric($cleanPrice)) {
                return false;
            }
            $floatPrice = (float) $cleanPrice;

            $result = $this->db->products->updateOne(
                ["_id" => $id],
                ['$set' => [
                    "name" => $name,
                    "price" => $floatPrice
                ]]
            );
            
            return $result->getModifiedCount() > 0;
        } catch (Exception $e) {
            return false;
        }
    }

    function deleteProductModel($productId) {
        try {
            $id = new MongoDB\BSON\ObjectId($productId);
            
            $result = $this->db->products->deleteOne(["_id" => $id]);
            
            return $result->getDeletedCount() > 0;
        } catch (Exception $e) {
            return false;
        }
    }

    function getSellerProductsModel($sellerId) {
        try {
            $cursor = $this->db->products->find(["sellerId" => $sellerId]);
            return $cursor->toArray();
        } catch (Exception $e) {
            return [];
        }
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
    
    // Cria o pedido com status PENDENTE
    function createOrderModel($userId, $products, $totalPrice, $billingId) {
        try {
            $response = $this->db->orders->insertOne([
                "userId" => $userId,
                "products" => $products, // Salva a lista de itens
                "totalPrice" => $totalPrice,
                "status" => "PENDING", // Começa como pendente
                "abacateBillingId" => $billingId, // O ID que vem do AbacatePay
                "createdAt" => new MongoDB\BSON\UTCDateTime()
            ]);
            return $response->getInsertedCount() > 0;
        } catch (Exception $e) {
            return false;
        }
    }

    // Atualiza o pedido para PAGO
    function approveOrderModel($billingId) {
        try {
            $result = $this->db->orders->updateOne(
                ["abacateBillingId" => $billingId],
                ['$set' => ["status" => "PAID", "paidAt" => new MongoDB\BSON\UTCDateTime()]]
            );
            return $result->getModifiedCount() > 0;
        } catch (Exception $e) {
            return false;
        }
    }
}
?>

