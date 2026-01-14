import { useState } from "react";
import { Link } from "react-router-dom";
import { AddProductCartConnection } from "../../connections/productConnection";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useToast } from "../../contexts/toastContext";
import { useCart } from "../../contexts/cartContext";

export function StoreProductComponent(
  { id, name, price, coverImage, promotionPercentage, promotionStartDate, promotionEndDate }: { 
    id: string; 
    name: string; 
    price: number; 
    coverImage?: string;
    promotionPercentage?: number;
    promotionStartDate?: string | Date;
    promotionEndDate?: string | Date;
  }
) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { showToast } = useToast();
  const { refreshCart } = useCart();

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    
    try {
      const res = await AddProductCartConnection({ body: { productId: id } });
      if (res && res.ok) {
        showToast("Produto adicionado ao carrinho com sucesso!", "success");
        refreshCart(); // Atualizar quantidade do carrinho
      } else {
        showToast("Erro ao adicionar produto ao carrinho.", "error");
      }
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      showToast("Erro ao adicionar produto ao carrinho.", "error");
    } finally {
      setIsAdding(false);
    }
  }

  function handleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  }

  // Verificar se a promoção está ativa
  function isPromotionActive(): boolean {
    if (!promotionPercentage || promotionPercentage <= 0) return false;
    if (!promotionStartDate || !promotionEndDate) return false;

    try {
      const now = new Date();
      let start: Date;
      let end: Date;
      
      // Converter datas que podem vir em diferentes formatos
      if (typeof promotionStartDate === 'string') {
        // Se vier como "Y-m-d H:i:s", converter para formato ISO
        start = new Date(promotionStartDate.replace(' ', 'T'));
      } else {
        start = new Date(promotionStartDate);
      }
      
      if (typeof promotionEndDate === 'string') {
        end = new Date(promotionEndDate.replace(' ', 'T'));
      } else {
        end = new Date(promotionEndDate);
      }
      
      // Verificar se as datas são válidas
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.error("Datas de promoção inválidas:", promotionStartDate, promotionEndDate);
        return false;
      }
      
      return now >= start && now <= end;
    } catch (e) {
      console.error("Erro ao verificar promoção:", e);
      return false;
    }
  }

  // Calcular preço com desconto
  function getPromotionPrice(): number {
    if (!isPromotionActive() || !promotionPercentage) return price;
    return price * (1 - promotionPercentage / 100);
  }

  const activePromotion = isPromotionActive();
  const finalPrice = activePromotion ? getPromotionPrice() : price;
  const discountPercentage = activePromotion ? promotionPercentage : 0;

  // Usar imagem de capa se disponível, senão usar placeholder
  const imageUrl = coverImage || `https://via.placeholder.com/300x300?text=${encodeURIComponent(name.substring(0, 10))}`;

  return (
    <Link to={`/products/${id}`} className="group">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
        {/* Imagem do Produto */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badge de Promoção */}
          {activePromotion && discountPercentage && (
            <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-md font-bold text-sm z-10">
              {Math.round(discountPercentage)}% OFF
            </div>
          )}
          
          {/* Badge de Favorito */}
          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors z-10"
            aria-label="Adicionar aos favoritos"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? "fill-blue-600 text-blue-600" : "text-gray-400"
              }`}
            />
          </button>
        </div>

        {/* Informações do Produto */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {name}
          </h3>
          
          <p className="text-sm text-gray-500 mb-3 line-clamp-2 flex-1">
            Produto de qualidade premium
          </p>

          {/* Avaliação (placeholder) */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="w-4 h-4 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-1">(0)</span>
          </div>

          {/* Preço e Botão */}
          <div className="mt-auto">
            {activePromotion && (
              <p className="text-xs text-gray-400 line-through mb-1">
                {Number(price).toLocaleString('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                })}
              </p>
            )}
            <div className="flex items-center justify-between gap-2">
              <p className="text-xl font-bold text-gray-900">
                {Number(finalPrice).toLocaleString('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                })}
              </p>
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                aria-label="Adicionar ao carrinho"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm font-medium">Adicionar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
