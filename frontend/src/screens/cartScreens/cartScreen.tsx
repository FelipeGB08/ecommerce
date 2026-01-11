import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GetUserCartConnection, UpdateCartQuantityConnection, RemoveFromCartConnection } from "../../connections/productConnection";
import { CreatePaymentConnection } from "../../connections/productConnection";
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, ShoppingCart } from "lucide-react";

export default function CartScreen() {
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Função para recarregar o carrinho
    async function loadCart() {
        setLoading(true);
        const res = await GetUserCartConnection({ body: {} });
        if (res && res.ok) {
            setCartItems(res.msg || []);
        }
        setLoading(false);
    }

    useEffect(() => {
        loadCart();
    }, []);

    // Lógica para alterar quantidade
    async function handleQuantity(productId: string, currentQty: number, change: number) {
        const newQty = currentQty + change;
        if (newQty < 1) return; // Não deixa baixar de 1

        // Atualização Otimista (Muda na tela antes de ir pro banco pra parecer rápido)
        const updatedItems = cartItems.map(item => {
            const itemId = item.productId?.$oid ? String(item.productId.$oid) : String(item.productId);
            return itemId === productId ? { ...item, quantity: newQty } : item;
        });
        setCartItems(updatedItems);

        // Chama o backend
        await UpdateCartQuantityConnection({ 
            body: { productId: productId, quantity: newQty } 
        });
    }

    // Lógica para remover item
    async function handleRemove(productId: string) {
        if(!confirm("Tem certeza que deseja remover este item do carrinho?")) return;

        // Remove da tela imediatamente
        setCartItems(prev => prev.filter(item => {
            const itemId = item.productId?.$oid ? String(item.productId.$oid) : String(item.productId);
            return itemId !== productId;
        }));

        // Chama o backend
        await RemoveFromCartConnection({ 
            body: { productId: productId } 
        });
    }

    async function handleCheckout() {
        if (cartItems.length === 0) return;

        setLoading(true);
        
        // 1. Pede pro PHP criar o pedido
        const res = await CreatePaymentConnection({ body: {} });

        // 2. Se o PHP devolver o link...
        if (res && res.ok && res.paymentUrl) {
            // ✅ CORRETO: "Tchau site, olá AbacatePay"
            // Isso faz o navegador sair da sua página e abrir a cobrança
            window.location.href = res.paymentUrl; 
        } else {
            alert("Erro: " + (res?.msg || "Tente novamente"));
        }
        
        setLoading(false);
    }

    // Calcula o total do carrinho
    const cartTotal = cartItems.reduce((acc, item) => {
        return acc + ((item.price || 0) * (item.quantity || 1));
    }, 0);

    // Função auxiliar para obter o ID do produto
    function getProductId(item: any): string {
        if (item.productId?.$oid) return String(item.productId.$oid);
        return String(item.productId || "");
    }

    // Função para gerar imagem placeholder
    function getProductImage(name: string): string {
        return `https://via.placeholder.com/150x150?text=${encodeURIComponent((name || "Produto").substring(0, 10))}`;
    }

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/store" className="flex items-center gap-3">
                            <ShoppingBag className="w-8 h-8 text-blue-600" />
                            <h1 className="text-2xl font-bold text-gray-900">Ecommerce</h1>
                        </Link>

                        {/* Botão Voltar */}
                        <Link 
                            to="/store" 
                            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:block text-sm font-medium">Continuar Comprando</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Breadcrumbs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <nav className="text-sm text-gray-600">
                        <Link to="/store" className="hover:text-blue-600">Início</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900">Carrinho</span>
                    </nav>
                </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Carrinho</h1>
                <p className="text-gray-600 mb-8">
                    {cartItems.length > 0 
                        ? `${cartItems.length} ${cartItems.length === 1 ? 'item' : 'itens'} no carrinho`
                        : 'Seu carrinho está vazio'}
                </p>

                {loading ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <p className="text-gray-500">Carregando itens...</p>
                    </div>
                ) : cartItems.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Lista de Itens */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item, index) => {
                                const pId = getProductId(item);
                                const itemTotal = (item.price || 0) * (item.quantity || 1);
                                
                                return (
                                    <div 
                                        key={index} 
                                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                                    >
                                        <div className="flex gap-4">
                                            {/* Imagem do Produto */}
                                            <Link to={`/products/${pId}`} className="flex-shrink-0">
                                                <img
                                                    src={getProductImage(item.name)}
                                                    alt={item.name || "Produto"}
                                                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                                />
                                            </Link>

                                            {/* Informações do Produto */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <Link to={`/products/${pId}`}>
                                                            <h3 className="font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors">
                                                                {item.name || "Produto sem nome"}
                                                            </h3>
                                                        </Link>
                                                        <p className="text-lg font-bold text-gray-900 mb-4">
                                                            {Number(item.price || 0).toLocaleString('pt-BR', { 
                                                                style: 'currency', 
                                                                currency: 'BRL' 
                                                            })}
                                                        </p>

                                                        {/* Controles de Quantidade */}
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <span className="text-sm text-gray-600">Quantidade:</span>
                                                            <div className="flex items-center border border-gray-300 rounded-lg">
                                                                <button
                                                    onClick={() => handleQuantity(pId, item.quantity || 1, -1)}
                                                    disabled={loading}
                                                    className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    aria-label="Diminuir quantidade"
                                                                >
                                                                    <Minus className="w-4 h-4 text-gray-600" />
                                                                </button>
                                                                <span className="px-4 py-2 font-semibold text-gray-900 min-w-[3rem] text-center">
                                                                    {item.quantity || 1}
                                                                </span>
                                                                <button
                                                    onClick={() => handleQuantity(pId, item.quantity || 1, 1)}
                                                    disabled={loading}
                                                    className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    aria-label="Aumentar quantidade"
                                                                >
                                                                    <Plus className="w-4 h-4 text-gray-600" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Subtotal */}
                                                        <p className="text-sm text-gray-600">
                                                            Subtotal: <span className="font-semibold text-gray-900">
                                                                {Number(itemTotal).toLocaleString('pt-BR', { 
                                                                    style: 'currency', 
                                                                    currency: 'BRL' 
                                                                })}
                                                            </span>
                                                        </p>
                                                    </div>

                                                    {/* Botão Remover */}
                                                    <button
                                                        onClick={() => handleRemove(pId)}
                                                        disabled={loading}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        aria-label="Remover item"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Resumo do Pedido */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Resumo do Pedido</h2>
                                
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'})</span>
                                        <span>{Number(cartTotal).toLocaleString('pt-BR', { 
                                            style: 'currency', 
                                            currency: 'BRL' 
                                        })}</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold text-gray-900">Total</span>
                                            <span className="text-2xl font-bold text-gray-900">
                                                {Number(cartTotal).toLocaleString('pt-BR', { 
                                                    style: 'currency', 
                                                    currency: 'BRL' 
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={loading || cartItems.length === 0}
                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    {loading ? "Processando..." : "Finalizar Compra"}
                                </button>

                                <Link 
                                    to="/store"
                                    className="block mt-4 text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Continuar comprando
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Seu carrinho está vazio</h2>
                        <p className="text-gray-600 mb-6">Adicione produtos ao carrinho para continuar.</p>
                        <Link 
                            to="/store"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Voltar para a loja
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}