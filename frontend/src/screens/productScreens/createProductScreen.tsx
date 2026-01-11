import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CreateProductConnection } from "../../connections/productConnection";
import { ShoppingBag, Upload, X, CheckCircle2, AlertCircle } from "lucide-react";

interface ProductImage {
    id: string;
    file: File;
    preview: string;
    isUploading?: boolean;
}

export default function CreateProductScreen() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Estados do formulário
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [brand, setBrand] = useState("");
    const [description, setDescription] = useState("");
    const [basePrice, setBasePrice] = useState("");
    const [discountPrice, setDiscountPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [images, setImages] = useState<ProductImage[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
    const [errorMessage, setErrorMessage] = useState("");

    // Categorias disponíveis
    const categories = [
        { value: "roupa", label: "Roupa" },
        { value: "objeto", label: "Objeto" },
        { value: "tecnologia", label: "Tecnologia" },
        { value: "casa", label: "Casa e Decoração" },
        { value: "esporte", label: "Esporte" },
        { value: "livro", label: "Livros" },
        { value: "outro", label: "Outro" }
    ];

    // Função para lidar com upload de imagens
    function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach((file) => {
            if (file.type.startsWith("image/")) {
                const id = Math.random().toString(36).substring(7);
                const preview = URL.createObjectURL(file);
                
                setImages(prev => [...prev, { id, file, preview }]);
            }
        });

        // Limpar o input para permitir selecionar o mesmo arquivo novamente
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    // Função para remover imagem
    function handleRemoveImage(imageId: string) {
        setImages(prev => {
            const imageToRemove = prev.find(img => img.id === imageId);
            if (imageToRemove) {
                URL.revokeObjectURL(imageToRemove.preview);
            }
            return prev.filter(img => img.id !== imageId);
        });
    }

    // Função para arrastar e soltar imagens
    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const fileArray = Array.from(files);
            fileArray.forEach((file) => {
                if (file.type.startsWith("image/")) {
                    const id = Math.random().toString(36).substring(7);
                    const preview = URL.createObjectURL(file);
                    setImages(prev => [...prev, { id, file, preview }]);
                }
            });
        }
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
    }

    async function handleCreateProduct(e: React.FormEvent) {
        e.preventDefault();
        setSubmitStatus(null);
        setErrorMessage("");

        // Validações
        if (!name.trim()) {
            setErrorMessage("O nome do produto é obrigatório.");
            setSubmitStatus("error");
            return;
        }

        if (!description.trim()) {
            setErrorMessage("A descrição do produto é obrigatória.");
            setSubmitStatus("error");
            return;
        }

        if (images.length < 3) {
            setErrorMessage("É necessário adicionar no mínimo 3 imagens do produto.");
            setSubmitStatus("error");
            return;
        }

        if (!basePrice || parseFloat(basePrice.replace(",", ".")) <= 0) {
            setErrorMessage("O preço base é obrigatório e deve ser maior que zero.");
            setSubmitStatus("error");
            return;
        }

        if (!quantity || parseInt(quantity) < 0) {
            setErrorMessage("A quantidade em estoque é obrigatória.");
            setSubmitStatus("error");
            return;
        }

        setIsSubmitting(true);

        try {
            const priceToSend = basePrice.replace(",", ".");
            
            // Converter a primeira imagem para base64
            let coverImageBase64 = null;
            if (images.length > 0 && images[0].file) {
                coverImageBase64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64String = reader.result as string;
                        resolve(base64String);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(images[0].file);
                });
            }
            
            const res = await CreateProductConnection({ 
                body: { 
                    name, 
                    price: priceToSend,
                    coverImage: coverImageBase64,
                    // Campos adicionais para quando o backend suportar:
                    // category, brand, description, quantity, images
                } 
            });
            
            if (res && res.ok) {
                setSubmitStatus("success");
                // Limpar formulário após sucesso
                setTimeout(() => {
                    setName("");
                    setCategory("");
                    setBrand("");
                    setDescription("");
                    setBasePrice("");
                    setDiscountPrice("");
                    setQuantity("");
                    setImages([]);
                    setSubmitStatus(null);
                }, 3000);
            } else {
                setErrorMessage(res?.msg || "Erro ao criar produto. Tente novamente.");
                setSubmitStatus("error");
            }
        } catch (error) {
            setErrorMessage("Erro ao criar produto. Tente novamente.");
            setSubmitStatus("error");
        } finally {
            setIsSubmitting(false);
        }
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

                        {/* Navegação */}
                        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-700">
                            <Link to="/store" className="hover:text-blue-600">Dashboard</Link>
                            <Link to="/products/create" className="text-blue-600">Meus Produtos</Link>
                            <Link to="/promotions" className="hover:text-blue-600">Promoções</Link>
                            <Link to="/store" className="hover:text-blue-600">Relatórios</Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Conteúdo Principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumbs e Título */}
                <nav className="text-sm text-gray-600 mb-4">
                    <Link to="/store" className="hover:text-blue-600">Meus Produtos</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900">Criar Novo</span>
                </nav>

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Adicionar Novo Produto</h1>
                        <p className="text-gray-600">Preencha os detalhes abaixo para adicionar um novo item ao seu inventário.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/store")}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Salvar Rascunho
                        </button>
                        <button
                            type="submit"
                            form="product-form"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Publicando..." : "Publicar Produto"}
                        </button>
                    </div>
                </div>

                {/* Mensagens de Status */}
                {submitStatus === "success" && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <p className="text-green-800 font-medium">Produto criado com sucesso!</p>
                    </div>
                )}

                {submitStatus === "error" && errorMessage && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <p className="text-red-800 font-medium">{errorMessage}</p>
                    </div>
                )}

                <form id="product-form" onSubmit={handleCreateProduct} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Coluna Esquerda */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Informações Gerais */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Informações Gerais</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nome do Produto <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ex.: Fones de Ouvido com Cancelamento de Ruído"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                                            Categoria <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="category"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                            required
                                        >
                                            <option value="">Selecione a categoria</option>
                                            {categories.map((cat) => (
                                                <option key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                                            Marca (Opcional)
                                        </label>
                                        <input
                                            id="brand"
                                            type="text"
                                            value={brand}
                                            onChange={(e) => setBrand(e.target.value)}
                                            placeholder="Ex.: Sony, Nike"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                        Descrição <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Descreva as características, especificações e benefícios do seu produto..."
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-y"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Mídia do Produto */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Mídia do Produto</h2>
                            
                            {/* Área de Upload */}
                            <div
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                            >
                                <Upload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                                <p className="text-gray-700 font-medium mb-2">Clique para enviar ou arraste e solte</p>
                                <p className="text-sm text-gray-500">SVG, PNG, JPG ou GIF (máx. 800x400px)</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </div>

                            {/* Imagens Enviadas */}
                            {images.length > 0 && (
                                <div className="mt-6">
                                    <p className="text-sm font-medium text-gray-700 mb-3">
                                        Imagens ({images.length}/3 mínimo)
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {images.map((image, index) => (
                                            <div key={image.id} className="relative group">
                                                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                                    <img
                                                        src={image.preview}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {image.isUploading && (
                                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                            <div className="text-white text-sm">Enviando...</div>
                                                        </div>
                                                    )}
                                                </div>
                                                {index === 0 && (
                                                    <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                                        Imagem Principal
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(image.id)}
                                                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    {images.length < 3 && (
                                        <p className="mt-2 text-sm text-amber-600">
                                            Adicione pelo menos {3 - images.length} imagem(ns) para completar o mínimo de 3.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Coluna Direita */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Preços */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Preços</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-2">
                                        Preço Base <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                                        <input
                                            id="basePrice"
                                            type="text"
                                            value={basePrice}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^\d,]/g, "");
                                                setBasePrice(value);
                                            }}
                                            placeholder="0,00"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="discountPrice" className="block text-sm font-medium text-gray-700 mb-2">
                                        Preço com Desconto
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                                        <input
                                            id="discountPrice"
                                            type="text"
                                            value={discountPrice}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^\d,]/g, "");
                                                setDiscountPrice(value);
                                            }}
                                            placeholder="0,00"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">Deixe vazio se não houver desconto.</p>
                                </div>
                            </div>
                        </div>

                        {/* Estoque */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Estoque</h2>
                            
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                                    Quantidade Disponível <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="quantity"
                                    type="number"
                                    min="0"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    );
}