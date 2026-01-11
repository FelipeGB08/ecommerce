import { useState } from "react";
import { Link } from "react-router-dom";
import { AddProductCartConnection } from "../../connections/productConnection";
import { Heart, ShoppingCart, Star } from "lucide-react";

export function StoreProductComponent(
  { id, name, price }: { id: string; name: string; price: number }
) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    
    try {
      const res = await AddProductCartConnection({ body: { productId: id } });
      if (res && res.ok) {
        // Feedback visual pode ser adicionado aqui
      }
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
    } finally {
      setIsAdding(false);
    }
  }

  function handleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  }

  // Geração de imagem placeholder baseada no nome
  const imageUrl = `https://via.placeholder.com/300x300?text=${encodeURIComponent(name.substring(0, 10))}`;

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
          
          {/* Badge de Favorito */}
          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
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
          <div className="flex items-center justify-between mt-auto">
            <div>
              <p className="text-xl font-bold text-gray-900">
                {Number(price).toLocaleString('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                })}
              </p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Adicionar ao carrinho"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm font-medium">Adicionar</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}