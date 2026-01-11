import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GetSellerProductsConnection, UpdateProductConnection, DeleteProductConnection } from "../../connections/productConnection";
import { ShoppingBag, Plus, Edit2, Trash2, ArrowLeft, CheckCircle2, AlertCircle, X } from "lucide-react";

export default function MyProductsScreen() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editPrice, setEditPrice] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    // Carregar produtos do vendedor
    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        setLoading(true);
        try {
            const res = await GetSellerProductsConnection({ body: {} });
            if (res && res.ok) {
                setProducts(res.msg || []);
            }
        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
        } finally {
            setLoading(false);
        }
    }

    // Iniciar edição
    function startEdit(product: any) {
        const productId = product._id?.$oid || product._id;
        setEditingProduct(productId);
        setEditName(product.name || "");
        setEditPrice(product.price?.toString().replace(".", ",") || "");
    }

    // Cancelar edição
    function cancelEdit() {
        setEditingProduct(null);
        setEditName("");
        setEditPrice("");
    }

    // Salvar edição
    async function saveEdit(productId: string) {
        if (!editName.trim() || !editPrice.trim()) {
            setMessage("Nome e preço são obrigatórios.");
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
            return;
        }

        try {
            const res = await UpdateProductConnection({
                body: {
                    productId: productId,
                    name: editName,
                    price: editPrice
                }
            });

            if (res && res.ok) {
                setMessage("Produto atualizado com sucesso!");
                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                    cancelEdit();
                    loadProducts();
                }, 2000);
            } else {
                setMessage(res?.msg || "Erro ao atualizar produto.");
                setShowError(true);
                setTimeout(() => setShowError(false), 3000);
            }
        } catch (error) {
            setMessage("Erro ao atualizar produto.");
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
        }
    }

    // Excluir produto
    async function handleDelete(productId: string, productName: string) {
        if (!confirm(`Tem certeza que deseja excluir o produto "${productName}"? Esta ação não pode ser desfeita.`)) {
            return;
        }

        try {
            const res = await DeleteProductConnection({
                body: { productId }
            });

            if (res && res.ok) {
                setMessage("Produto excluído com sucesso!");
                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                    loadProducts();
                }, 2000);
            } else {
                setMessage(res?.msg || "Erro ao excluir produto.");
                setShowError(true);
                setTimeout(() => setShowError(false), 3000);
            }
        } catch (error) {
            setMessage("Erro ao excluir produto.");
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
        }
    }

    // Função auxiliar para obter o ID do produto
    function getProductId(product: any): string {
        if (product._id?.$oid) return String(product._id.$oid);
        return String(product._id || "");
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

                        {/* Botões de Ação */}
                        <div className="flex items-center gap-4">
                            <Link
                                to="/products/create"
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Adicionar Produto</span>
                            </Link>
                            <Link
                                to="/store"
                                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="hidden sm:block text-sm font-medium">Voltar</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Breadcrumbs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <nav className="text-sm text-gray-600">
                        <Link to="/store" className="hover:text-blue-600">Início</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900">Meus Produtos</span>
                    </nav>
                </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Produtos</h1>
                        <p className="text-gray-600">Gerencie seus produtos cadastrados</p>
                    </div>
                </div>

                {/* Mensagens de Status */}
                {showSuccess && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <p className="text-green-800 font-medium flex-1">{message}</p>
                        <button onClick={() => setShowSuccess(false)} className="text-green-600 hover:text-green-800">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {showError && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <p className="text-red-800 font-medium flex-1">{message}</p>
                        <button onClick={() => setShowError(false)} className="text-red-600 hover:text-red-800">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Lista de Produtos */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <p className="text-gray-500">Carregando produtos...</p>
                    </div>
                ) : products.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Produto
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Preço
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.map((product, index) => {
                                        const productId = getProductId(product);
                                        const isEditing = editingProduct === productId;

                                        return (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={editName}
                                                            onChange={(e) => setEditName(e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                            placeholder="Nome do produto"
                                                        />
                                                    ) : (
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {product.name || "Produto sem nome"}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {isEditing ? (
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                                                            <input
                                                                type="text"
                                                                value={editPrice}
                                                                onChange={(e) => {
                                                                    const value = e.target.value.replace(/[^\d,]/g, "");
                                                                    setEditPrice(value);
                                                                }}
                                                                className="w-32 pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                placeholder="0,00"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-gray-900">
                                                            {Number(product.price || 0).toLocaleString('pt-BR', {
                                                                style: 'currency',
                                                                currency: 'BRL'
                                                            })}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {isEditing ? (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => saveEdit(productId)}
                                                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                                            >
                                                                Salvar
                                                            </button>
                                                            <button
                                                                onClick={cancelEdit}
                                                                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                                                            >
                                                                Cancelar
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => startEdit(product)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Editar produto"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(productId, product.name || "Produto")}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Excluir produto"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Nenhum produto cadastrado</h2>
                        <p className="text-gray-600 mb-6">Comece adicionando seu primeiro produto.</p>
                        <Link
                            to="/products/create"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Adicionar Produto
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
