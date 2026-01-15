import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GetSellerProductsConnection, UpdateProductConnection, DeleteProductConnection } from "../../connections/productConnection";
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, X, Tag, ShoppingBag, Upload, Trash } from "lucide-react";
import Navbar from "../../components/Navbar";

export default function MyProductsScreen() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editPrice, setEditPrice] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const [editTags, setEditTags] = useState("");
    const [editImages, setEditImages] = useState<string[]>([]);
    const [editCoverImage, setEditCoverImage] = useState("");
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
        setEditDescription(product.description || "");
        setEditCategory(product.category || "");
        setEditTags((product.tags || []).join(", "));
        setEditImages(product.images || []);
        setEditCoverImage(product.coverImage || "");
    }

    // Cancelar edição
    function cancelEdit() {
        setEditingProduct(null);
        setEditName("");
        setEditPrice("");
        setEditDescription("");
        setEditCategory("");
        setEditTags("");
        setEditImages([]);
        setEditCoverImage("");
    }

    // Handle upload de imagens
    function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                setEditImages(prev => [...prev, dataUrl]);
            };
            reader.readAsDataURL(file);
        });
    }

    // Remover imagem
    function removeImage(index: number) {
        setEditImages(prev => prev.filter((_, i) => i !== index));
    }

    // Salvar edição
    async function saveEdit(productId: string) {
        if (!editName.trim() || !editPrice.trim()) {
            setMessage("Nome e preço são obrigatórios.");
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
            return;
        }

        // Validar tags
        const tagsArray = editTags.trim() ? editTags.split(",").map(tag => tag.trim()).filter(tag => tag) : [];
        if (tagsArray.length < 3) {
            setMessage("Adicione pelo menos 3 tags separadas por vírgula.");
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
            return;
        }

        try {
            const res = await UpdateProductConnection({
                body: {
                    productId: productId,
                    name: editName,
                    price: editPrice,
                    description: editDescription,
                    category: editCategory,
                    tags: tagsArray,
                    images: editImages,
                    coverImage: editCoverImage
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

    function getProductImage(product: any): string {
        if (product.coverImage) return product.coverImage;
        return `https://via.placeholder.com/300x300?text=${encodeURIComponent((product.name || "Produto").substring(0, 20))}`;
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />

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

            {/* Modal de Edição */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Editar Produto</h2>
                            <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            {/* Nome */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Produto *</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="Nome do produto"
                                />
                            </div>

                            {/* Preço */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Preço *</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                                    <input
                                        type="text"
                                        value={editPrice}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^\d,]/g, "");
                                            setEditPrice(value);
                                        }}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="0,00"
                                    />
                                </div>
                            </div>

                            {/* Descrição */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="Descrição do produto"
                                    rows={3}
                                />
                            </div>

                            {/* Categoria */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                                <input
                                    type="text"
                                    value={editCategory}
                                    onChange={(e) => setEditCategory(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="Ex: Eletrônicos, Roupas, etc"
                                />
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tags * (mínimo 3, separadas por vírgula)</label>
                                <input
                                    type="text"
                                    value={editTags}
                                    onChange={(e) => setEditTags(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="Ex: eletrônico, qualidade, novo"
                                />
                                <p className="text-xs text-gray-500 mt-1">Separe cada tag com vírgula</p>
                            </div>

                            {/* Imagens */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Imagens do Produto</label>
                                
                                {/* Galeria de imagens existentes */}
                                {editImages.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-600 mb-2">Imagens atuais ({editImages.length})</p>
                                        <div className="grid grid-cols-4 gap-2">
                                            {editImages.map((image, index) => (
                                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group">
                                                    <img 
                                                        src={image} 
                                                        alt={`Imagem ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        onClick={() => removeImage(index)}
                                                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                    >
                                                        <Trash className="w-5 h-5 text-white" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Upload de novas imagens */}
                                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-gray-700">Clique ou arraste imagens aqui</p>
                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG ou GIF até 10MB</p>
                                </div>
                            </div>
                        </div>

                        {/* Botões */}
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
                            <button
                                onClick={cancelEdit}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => saveEdit(editingProduct)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

                {/* Lista de Produtos em Grid */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <p className="text-gray-500">Carregando produtos...</p>
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product, index) => {
                            const productId = getProductId(product);
                            const isEditing = editingProduct === productId;

                            return (
                                <div
                                    key={index}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                                >
                                    {/* Imagem do Produto */}
                                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                        <img
                                            src={getProductImage(product)}
                                            alt={product.name || "Produto"}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Informações do Produto */}
                                    <div className="p-4 flex flex-col flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                                            {product.name || "Produto sem nome"}
                                        </h3>
                                        {(() => {
                                            // Verificar se há promoção ativa
                                            const hasPromotion = product.promotionalPrice && product.promotionalPrice > 0;
                                            let isPromotionActive = false;
                                            let promotionPrice = product.price || 0;
                                            
                                            if (hasPromotion && product.promotionStartDate && product.promotionEndDate) {
                                                try {
                                                    const now = new Date();
                                                    const start = new Date(product.promotionStartDate.replace(' ', 'T'));
                                                    const end = new Date(product.promotionEndDate.replace(' ', 'T'));
                                                    isPromotionActive = now >= start && now <= end;
                                                    
                                                    if (isPromotionActive) {
                                                        promotionPrice = product.promotionalPrice;
                                                    }
                                                } catch (e) {
                                                    console.error("Erro ao verificar promoção:", e);
                                                }
                                            }
                                                    
                                                    return (
                                                        <div className="mb-4">
                                                            {isPromotionActive ? (
                                                                <div>
                                                                    <p className="text-xs text-gray-400 line-through mb-1">
                                                                        {Number(product.price || 0).toLocaleString('pt-BR', {
                                                                            style: 'currency',
                                                                            currency: 'BRL'
                                                                        })}
                                                                    </p>
                                                                    <p className="text-xl font-bold text-red-600">
                                                                        {Number(promotionPrice).toLocaleString('pt-BR', {
                                                                            style: 'currency',
                                                                            currency: 'BRL'
                                                                        })}
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <p className="text-xl font-bold text-gray-900">
                                                                    {Number(product.price || 0).toLocaleString('pt-BR', {
                                                                        style: 'currency',
                                                                        currency: 'BRL'
                                                                    })}
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                        <div className="flex gap-2 mt-auto">
                                            <button
                                                onClick={() => navigate(`/products/promotion/${productId}`)}
                                                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-purple-300 rounded-md text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                                                title="Adicionar promoção"
                                            >
                                                <Tag className="w-4 h-4" />
                                                Promoção
                                            </button>
                                            <button
                                                onClick={() => startEdit(product)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                title="Editar produto"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(productId, product.name || "Produto")}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title="Excluir produto"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
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
