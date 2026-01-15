import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ShowProductDetailsConnection, AddProductCartConnection, PublicProductRateConnection, GetSimilarProductsConnection } from "../../connections/productConnection";
import { GetProductComments } from "../../containers/productContainers/commentsContainer";
import { ShoppingCart, Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { StoreProductsContainer } from "../../containers/storeContainers/storeProductsContainer";
import { useToast } from "../../contexts/toastContext";
import { useCart } from "../../contexts/cartContext";
import Navbar from "../../components/Navbar";

export default function ProductDatailsScreen() {
  const { productId } = useParams<{ productId: string }>();
  const [details, setDetails] = useState<any>({});
  const [comment, setComment] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { showToast } = useToast();
  const { refreshCart } = useCart();

  useEffect(() => {
    async function loadProductDetails() {
      setLoading(true);
      const res = await ShowProductDetailsConnection({ body: {"productId": productId} });

      if (res && res.ok) {
        setDetails(res.msg);
        
        // Carregar produtos similares se houver categoria
        if (res.msg.category) {
          const similarRes = await GetSimilarProductsConnection({
            body: { productId: productId, category: res.msg.category }
          });
          if (similarRes && similarRes.ok) {
            setSimilarProducts(similarRes.msg || []);
          }
        }
      }
      setLoading(false);
    }
    
    if (productId) {
      loadProductDetails();
    }
  }, [productId]);

  async function handleSendComment() {
    if (!comment.trim()) return;
    
    const res = await PublicProductRateConnection({
      body: { "productId": productId, "comment": comment }
    });
    
    if (res && res.ok) {
      setComment("");
      window.location.reload();
    } else {
      alert("Erro ao enviar comentário");
    }
  }

  async function handleAddToCart() {
    if (!productId) return;
    
    const res = await AddProductCartConnection({ 
      body: { 
        "productId": productId,
        "quantity": quantity
      } 
    });

    if (res && res.ok) {
      showToast("Produto adicionado ao carrinho com sucesso!", "success");
      refreshCart(); // Atualizar quantidade do carrinho
    } else {
      showToast("Erro ao adicionar produto ao carrinho.", "error");
    }
  }

  function handleDecreaseQuantity() {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  }

  function handleIncreaseQuantity() {
    setQuantity(quantity + 1);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">Carregando produto...</div>
        </div>
      </main>
    );
  }

  // Preparar array de imagens
  const allImages: string[] = [];
  if (details.images && Array.isArray(details.images) && details.images.length > 0) {
    allImages.push(...details.images);
  } else if (details.coverImage) {
    allImages.push(details.coverImage);
  }
  
  // Se não houver imagens, usar placeholder
  if (allImages.length === 0) {
    allImages.push(`https://via.placeholder.com/600x600?text=${encodeURIComponent((details.name || "Produto").substring(0, 20))}`);
  }

  const currentImage = allImages[selectedImageIndex] || allImages[0];

  function handlePreviousImage() {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  }

  function handleNextImage() {
    setSelectedImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="text-sm text-gray-600">
            <Link to="/store" className="hover:text-blue-600">Início</Link>
            {details.category && (
              <>
                <span className="mx-2">/</span>
                <span className="text-gray-600 capitalize">{details.category}</span>
              </>
            )}
            <span className="mx-2">/</span>
            <span className="text-gray-900">{details.name}</span>
          </nav>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Seção Principal do Produto */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Galeria de Imagens */}
            <div className="flex flex-col">
              {/* Imagem Principal */}
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 group">
                <img
                  src={currentImage}
                  alt={details.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Navegação entre imagens (se houver mais de uma) */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePreviousImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Imagem anterior"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Próxima imagem"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails (se houver múltiplas imagens) */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? "border-blue-600 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${details.name} - Imagem ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informações do Produto */}
            <div className="flex flex-col">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full mb-2">
                  Em Estoque
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {details.name || "Produto"}
              </h1>

              {/* Avaliação (placeholder) */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(0 avaliações)</span>
              </div>

              {/* Preço */}
              <div className="mb-6">
                {(() => {
                  // Verificar se há promoção ativa
                  const hasPromotion = details.promotionalPrice && details.promotionalPrice > 0;
                  let isPromotionActive = false;
                  let promotionPrice = details.price || 0;
                  let discountPercentage = 0;
                  
                  if (hasPromotion && details.promotionStartDate && details.promotionEndDate) {
                    try {
                      const now = new Date();
                      const start = new Date(details.promotionStartDate.replace(' ', 'T'));
                      const end = new Date(details.promotionEndDate.replace(' ', 'T'));
                      isPromotionActive = now >= start && now <= end;
                      
                      if (isPromotionActive) {
                        promotionPrice = details.promotionalPrice;
                        discountPercentage = Math.round(((details.price - promotionPrice) / details.price) * 100);
                      }
                    } catch (e) {
                      console.error("Erro ao verificar promoção:", e);
                    }
                  }
                  
                  return (
                    <div>
                      {isPromotionActive ? (
                        <div className="flex items-center gap-3">
                          <p className="text-3xl font-bold text-red-600">
                            {Number(promotionPrice).toLocaleString('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL' 
                            })}
                          </p>
                          <p className="text-xl text-gray-400 line-through">
                            {Number(details.price).toLocaleString('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL' 
                            })}
                          </p>
                          <span className="px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-md">
                            {discountPercentage}% OFF
                          </span>
                        </div>
                      ) : (
                        <p className="text-3xl font-bold text-gray-900">
                          {details.price ? Number(details.price).toLocaleString('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }) : 'Preço não disponível'}
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Quantidade */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDecreaseQuantity}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    readOnly
                    className="w-20 text-center border border-gray-300 rounded-md py-2"
                  />
                  <button
                    onClick={handleIncreaseQuantity}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Adicionar ao Carrinho
                </button>
                <button
                  className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  aria-label="Adicionar aos favoritos"
                >
                  <Heart className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Garantias (placeholder) */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl mb-2">🚚</div>
                  <p className="text-sm text-gray-600">Frete Grátis</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">🛡️</div>
                  <p className="text-sm text-gray-600">Garantia</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">↩️</div>
                  <p className="text-sm text-gray-600">Devolução</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Descrição Detalhada */}
        {details.description && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Descrição do Produto</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {details.description}
              </p>
            </div>
          </div>
        )}

        {/* Seção de Comentários */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Avaliações</h2>
          
          {/* Formulário de Comentário */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Adicionar Comentário</h3>
            <div className="space-y-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escreva seu comentário sobre este produto..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <button
                onClick={handleSendComment}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enviar Comentário
              </button>
            </div>
          </div>

          {/* Lista de Comentários */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Comentários</h3>
            <GetProductComments productId={productId || ""} />
          </div>
        </div>

        {/* Produtos Similares */}
        {similarProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Você também pode gostar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <StoreProductsContainer 
                searched={false}
                searchedWord=""
                products={similarProducts}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
