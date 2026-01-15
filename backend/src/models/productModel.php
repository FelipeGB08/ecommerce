<?php

class ProductModel {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    function createProductModel($name, $price, $sellerId = null, $coverImage = null, $description = null, $category = null, $images = null, $tags = []) {
    
    // Limpar preço: remover R$, espaços e converter vírgula para ponto
    $cleanPrice = str_replace(['R$', ' '], '', $price);
    // Substituir vírgula por ponto (se vier como "854,99")
    $cleanPrice = str_replace(',', '.', $cleanPrice);
    
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

    // Se houver todas as imagens, adiciona ao produto como array
    if ($images && is_array($images) && count($images) > 0) {
        $productData["images"] = $images;
    }

    // Se houver descrição, adiciona ao produto
    if ($description) {
        $productData["description"] = $description;
    }

    // Se houver categoria, adiciona ao produto
    if ($category) {
        $productData["category"] = $category;
    }

    // Se houver tags, adiciona ao produto
    if ($tags && is_array($tags) && count($tags) > 0) {
        $productData["tags"] = $tags;
    }

    $response = $this->db->products->insertOne($productData);
    
    return $response;
}

    function updateProductModel($productId, $name, $price) {
        try {
            $id = new MongoDB\BSON\ObjectId($productId);
            
            // Limpar preço: remover R$, espaços e converter vírgula para ponto
            $cleanPrice = str_replace(['R$', ' '], '', $price);
            // Substituir vírgula por ponto (se vier como "854,99")
            $cleanPrice = str_replace(',', '.', $cleanPrice);
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


    function addProductCartModel($userId, $productId, $quantity = 1){
        try {
            $objProductId = new MongoDB\BSON\ObjectId($productId);
        } catch (Exception $e) {
            return false;
        }

        // Garantir que quantity seja pelo menos 1
        $quantity = max(1, (int)$quantity);

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
                    $p['quantity'] = ($p['quantity'] ?? 1) + $quantity;
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
                // Se não achou, adiciona novo item com PREÇO, IMAGEM e QUANTIDADE informada
                $newItem = [
                    "productId" => $objProductId,
                    "name" => $product['name'],
                    "price" => $product['price'], // Salvando o preço
                    "coverImage" => $product['coverImage'] ?? null, // Salvando a imagem
                    "quantity" => $quantity
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
                        "coverImage" => $product['coverImage'] ?? null, // Salvando a imagem
                        "quantity" => $quantity
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
            '$or' => [
                ["name" => new MongoDB\BSON\Regex($searchedWord, 'i')],
                ["tags" => new MongoDB\BSON\Regex($searchedWord, 'i')]
            ]
        ]);
        return $products->toArray();
    }

    function sellerGetStoreSearchedProductsModel($searchedWord){
        $products = $this->db->products->find([
            '$or' => [
                ["name" => new MongoDB\BSON\Regex($searchedWord, 'i')],
                ["tags" => new MongoDB\BSON\Regex($searchedWord, 'i')]
            ]
        ]);
        return $products->toArray();
    }//pegar somente os produtos do vendedor

    function getSimilarProductsModel($category, $excludeProductId, $limit = 4) {
        try {
            $excludeId = new MongoDB\BSON\ObjectId($excludeProductId);
            
            $cursor = $this->db->products->find([
                "category" => $category,
                "_id" => ['$ne' => $excludeId]
            ], [
                "limit" => $limit
            ]);
            
            return $cursor->toArray();
        } catch (Exception $e) {
            return [];
        }
    }

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

