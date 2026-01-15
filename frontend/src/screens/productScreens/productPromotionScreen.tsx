import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ShowProductDetailsConnection } from "../../connections/productConnection";
import { AddProductPromotion } from "../../connections/storeConnection";
import { Calendar, Eye, X, Tag } from "lucide-react";
import { useToast } from "../../contexts/toastContext";
import Navbar from "../../components/Navbar";

export default function ProductPromotionScreen() {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
    const [discountValue, setDiscountValue] = useState("");
    const [startDate, setStartDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endDate, setEndDate] = useState("");
    const [endTime, setEndTime] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        async function loadProduct() {
            if (!productId) return;
            setLoading(true);
            try {
                const res = await ShowProductDetailsConnection({ body: { productId } });
                if (res && res.ok) {
                    setProduct(res.msg);
                    // Definir data inicial como hoje
                    const today = new Date().toISOString().split('T')[0];
                    const now = new Date().toTimeString().slice(0, 5);
                    setStartDate(today);
                    setStartTime(now);
                    
                    // Definir data final como 7 dias depois
                    const nextWeek = new Date();
                    nextWeek.setDate(nextWeek.getDate() + 7);
                    const nextWeekDate = nextWeek.toISOString().split('T')[0];
                    setEndDate(nextWeekDate);
                    setEndTime("23:59");
                }
            } catch (error) {
                console.error("Erro ao carregar produto:", error);
            } finally {
                setLoading(false);
            }
        }
        loadProduct();
    }, [productId]);

    function calculateNewPrice(): number {
        if (!product || !discountValue) return product?.price || 0;
        const value = parseFloat(discountValue.replace(",", ".")) || 0;
        const originalPrice = product.price || 0;
        
        if (discountType === "percentage") {
            return originalPrice * (1 - value / 100);
        } else {
            return Math.max(0, originalPrice - value);
        }
    }

    function calculateDiscountAmount(): number {
        if (!product || !discountValue) return 0;
        const value = parseFloat(discountValue.replace(",", ".")) || 0;
        const originalPrice = product.price || 0;
        
        if (discountType === "percentage") {
            return originalPrice * (value / 100);
        } else {
            return value;
        }
    }

    function formatDateForDisplay(date: string, time: string): string {
        if (!date || !time) return "";
        const d = new Date(`${date}T${time}`);
        return d.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function calculateDuration(): string {
        if (!startDate || !startTime || !endDate || !endTime) return "";
        const start = new Date(`${startDate}T${startTime}`);
        const end = new Date(`${endDate}T${endTime}`);
        const diff = end.getTime() - start.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return `${days} dias, ${hours} horas`;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!productId || !discountValue || !startDate || !startTime || !endDate || !endTime) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        setIsSubmitting(true);
        try {
            const discount = parseFloat(discountValue.replace(",", ".")) || 0;
            const percentage = discountType === "percentage" ? discount : (discount / (product.price || 1)) * 100;
            
            // Calcular o preço final com desconto aplicado
            const finalPrice = product.price * (1 - (percentage / 100));
            
            // Combinar data e hora
            const startDateTime = `${startDate} ${startTime}:00`;
            const endDateTime = `${endDate} ${endTime}:00`;
            
            const res = await AddProductPromotion({
                body: {
                    productId: productId,
                    promotionalPrice: Math.round(finalPrice * 100) / 100,
                    startDate: startDateTime,
                    endDate: endDateTime
                }
            });

            if (res && res.ok) {
                showToast("Promoção publicada com sucesso! 🎉", "success");
                // Aguardar um pouco para o usuário ver a mensagem antes de redirecionar
                setTimeout(() => {
                    navigate("/products/my-products");
                }, 1500);
            } else {
                showToast("Erro ao criar promoção: " + (res?.msg || "Tente novamente."), "error");
            }
        } catch (error) {
            console.error("Erro:", error);
            showToast("Erro ao criar promoção. Tente novamente.", "error");
        } finally {
            setIsSubmitting(false);
        }
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

    if (!product) {
        return (
            <main className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <p className="text-gray-500 mb-4">Produto não encontrado</p>
                        <Link to="/products/my-products" className="text-blue-600 hover:text-blue-700">
                            Voltar para Meus Produtos
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    const newPrice = calculateNewPrice();
    const discountAmount = calculateDiscountAmount();
    const duration = calculateDuration();
    const productImage = product.coverImage || `https://via.placeholder.com/400x400?text=${encodeURIComponent((product.name || "Produto").substring(0, 20))}`;

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Breadcrumbs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <nav className="text-sm text-gray-600">
                        <Link to="/store" className="hover:text-blue-600">Início</Link>
                        <span className="mx-2">/</span>
                        <Link to="/products/my-products" className="hover:text-blue-600">Meus Produtos</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900">Criar Promoção</span>
                    </nav>
                </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Formulário */}
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Nova Promoção</h1>
                            <p className="text-gray-600">Configure uma oferta por tempo limitado para seus produtos</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Seção 1: Selecionar Produto */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold">1</span>
                                    <h2 className="text-lg font-semibold text-gray-900">Selecionar Produto</h2>
                                </div>
                                {product && (
                                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                                    <img src={productImage} alt={product.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{product.name}</p>
                                                    <p className="text-sm text-gray-500">Preço atual: {Number(product.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Seção 2: Definir Desconto */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold">2</span>
                                    <h2 className="text-lg font-semibold text-gray-900">Definir Desconto</h2>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Desconto</label>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setDiscountType("percentage")}
                                                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors font-medium ${
                                                    discountType === "percentage"
                                                        ? "border-blue-600 bg-blue-50 text-blue-600"
                                                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                                                }`}
                                            >
                                                Percentual (%)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDiscountType("fixed")}
                                                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors font-medium ${
                                                    discountType === "fixed"
                                                        ? "border-blue-600 bg-blue-50 text-blue-600"
                                                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                                                }`}
                                            >
                                                Valor Fixo (R$)
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={discountValue}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^\d,]/g, "");
                                                    setDiscountValue(value);
                                                }}
                                                placeholder={discountType === "percentage" ? "20" : "50,00"}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-12"
                                                required
                                            />
                                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                                {discountType === "percentage" ? "%" : "R$"}
                                            </span>
                                        </div>
                                        {discountValue && (
                                            <p className="mt-2 text-sm text-green-600 font-medium">
                                                Novo preço será {Number(newPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Seção 3: Duração */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold">3</span>
                                    <h2 className="text-lg font-semibold text-gray-900">Duração</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Data e Hora de Início</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                required
                                            />
                                            <input
                                                type="time"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Data e Hora de Término</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                required
                                            />
                                            <input
                                                type="time"
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                {duration && (
                                    <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                                        <Calendar className="w-4 h-4" />
                                        <span>A promoção terá duração de {duration}</span>
                                    </div>
                                )}
                            </div>

                            {/* Botões de Ação */}
                            <div className="flex items-center justify-end gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => navigate("/products/my-products")}
                                    className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !discountValue}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                >
                                    {isSubmitting ? "Publicando..." : "Publicar Promoção"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Preview */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
                            <div className="flex items-center gap-2 mb-4">
                                <Eye className="w-5 h-5 text-gray-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
                            </div>
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="relative">
                                    {discountValue && (
                                        <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded text-sm font-bold z-10">
                                            {discountType === "percentage" ? `${discountValue}% OFF` : `R$ ${discountValue} OFF`}
                                        </div>
                                    )}
                                    <img
                                        src={productImage}
                                        alt={product.name}
                                        className="w-full aspect-square object-cover"
                                    />
                                </div>
                                <div className="p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">{product.name}</h4>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex text-yellow-400">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span key={star}>★</span>
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-500">(4.8)</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-2xl font-bold text-blue-600">
                                            {Number(newPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </span>
                                        {discountValue && (
                                            <span className="text-lg text-gray-400 line-through">
                                                {Number(product.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                        )}
                                    </div>
                                    {discountValue && (
                                        <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
                                            <div className="flex justify-between text-gray-600">
                                                <span>Preço Original:</span>
                                                <span>{Number(product.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-600">
                                                <span>Desconto ({discountType === "percentage" ? `${discountValue}%` : `R$ ${discountValue}`}):</span>
                                                <span className="text-red-600">-{Number(discountAmount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                                                <span>Preço Final:</span>
                                                <span className="text-blue-600">{Number(newPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {startDate && endDate && (
                                <div className="mt-4 text-xs text-gray-500 text-center">
                                    Os clientes verão este preço de {formatDateForDisplay(startDate, startTime)} até {formatDateForDisplay(endDate, endTime)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
