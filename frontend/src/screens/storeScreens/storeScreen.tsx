import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { StoreProductsContainer } from "../../containers/storeContainers/storeProductsContainer";
import { GetStoreProductsConnection } from "../../connections/storeConnection";
import { GetStoreSearchedProductsConnection } from "../../connections/productConnection";
import { ShoppingBag, Search, ShoppingCart, User, Heart, ChevronLeft, ChevronRight } from "lucide-react";

export default function StoreScreen({}:{}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState<any[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(10000);
    const [sortBy, setSortBy] = useState<"name" | "price-low" | "price-high">("name");
    const [currentPage, setCurrentPage] = useState(1);
    const [editingMinPrice, setEditingMinPrice] = useState(false);
    const [editingMaxPrice, setEditingMaxPrice] = useState(false);
    const [tempMinPrice, setTempMinPrice] = useState("");
    const [tempMaxPrice, setTempMaxPrice] = useState("");
    const productsPerPage = 12;

    const bySearch = searchParams.get("bySearch") === "true";
    const searchedWord = searchParams.get("word") ?? "";

    // Carregar produtos
    useEffect(() => {
        async function fetchData() {
            if (bySearch && searchedWord.length > 0) {
                const res = await GetStoreSearchedProductsConnection({
                    body: { searchedWord }
                });
                if (res && res.ok) {
                    setProducts(res.msg || []);
                    setFilteredProducts(res.msg || []);
                    // Calcular faixa de preço automática
                    const prices = (res.msg || []).map((p: any) => p.price || 0);
                    if (prices.length > 0) {
                        const max = Math.max(...prices);
                        setMaxPrice(max > 0 ? max : 10000);
                    }
                }
            } else {
                const res = await GetStoreProductsConnection({ body: {} });
                if (res && res.ok) {
                    setProducts(res.msg || []);
                    setFilteredProducts(res.msg || []);
                    // Calcular faixa de preço automática
                    const prices = (res.msg || []).map((p: any) => p.price || 0);
                    if (prices.length > 0) {
                        const max = Math.max(...prices);
                        setMaxPrice(max > 0 ? max : 10000);
                    }
                }
            }
        }
        fetchData();
        setSearchTerm(searchedWord);
    }, [bySearch, searchedWord]);

    // Aplicar filtros e ordenação
    useEffect(() => {
        let filtered = [...products];

        // Filtro de preço
        filtered = filtered.filter((p: any) => {
            const price = p.price || 0;
            return price >= minPrice && price <= maxPrice;
        });

        // Ordenação
        filtered.sort((a: any, b: any) => {
            switch (sortBy) {
                case "price-low":
                    return (a.price || 0) - (b.price || 0);
                case "price-high":
                    return (b.price || 0) - (a.price || 0);
                case "name":
                default:
                    return (a.name || "").localeCompare(b.name || "");
            }
        });

        setFilteredProducts(filtered);
        setCurrentPage(1);
    }, [products, minPrice, maxPrice, sortBy]);

    // Função de pesquisa
    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/store?bySearch=true&word=${encodeURIComponent(searchTerm.trim())}`);
        } else {
            navigate(`/store`);
        }
    }

    // Paginação
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

    // Limpar filtros
    function clearFilters() {
        setMinPrice(0);
        if (products.length > 0) {
            const max = Math.max(...products.map((p: any) => p.price || 0), 10000);
            setMaxPrice(max > 0 ? max : 10000);
        } else {
            setMaxPrice(10000);
        }
        setSortBy("name");
    }

    return(
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

                        {/* Barra de Pesquisa */}
                        <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar produtos, marcas e mais..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>
                        </form>

                        {/* Navegação e Ícones */}
                        <div className="flex items-center gap-6">
                            <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-700">
                                <Link to="/store" className="hover:text-blue-600">Produtos</Link>
                                <Link to="/store" className="hover:text-blue-600">Categorias</Link>
                            </nav>
                            <Link to="/cart" className="relative">
                                <ShoppingCart className="w-6 h-6 text-gray-700" />
                            </Link>
                            <Link to="/store" className="flex items-center gap-2">
                                <User className="w-6 h-6 text-gray-700" />
                                <span className="hidden sm:block text-sm font-medium text-gray-700">Usuário</span>
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
                        <span className="text-gray-900">Produtos</span>
                        {bySearch && searchedWord && (
                            <>
                                <span className="mx-2">/</span>
                                <span className="text-gray-900">Resultados para "{searchedWord}"</span>
                            </>
                        )}
                    </nav>
                </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8">
                    {/* Sidebar de Filtros */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Limpar tudo
                                </button>
                            </div>

                            {/* Filtro de Preço */}
                            {products.length > 0 && (() => {
                                const maxProductPrice = Math.max(...products.map((p: any) => p.price || 0), 10000);
                                
                                function handleMinPriceBlur() {
                                    const val = Math.max(0, Math.min(maxProductPrice, Number(tempMinPrice) || 0));
                                    setMinPrice(val);
                                    if (val > maxPrice) setMaxPrice(val);
                                    setEditingMinPrice(false);
                                    setTempMinPrice("");
                                }

                                function handleMaxPriceBlur() {
                                    const val = Math.max(0, Math.min(maxProductPrice, Number(tempMaxPrice) || maxProductPrice));
                                    setMaxPrice(val);
                                    if (val < minPrice) setMinPrice(val);
                                    setEditingMaxPrice(false);
                                    setTempMaxPrice("");
                                }

                                return (
                                    <div className="mb-6">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase">Faixa de Preço</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label 
                                                    className="block text-sm text-gray-600 mb-2 cursor-text"
                                                    onClick={() => {
                                                        if (!editingMinPrice) {
                                                            setEditingMinPrice(true);
                                                            setTempMinPrice(minPrice.toString());
                                                        }
                                                    }}
                                                >
                                                    Mínimo:{" "}
                                                    {editingMinPrice ? (
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={maxProductPrice}
                                                            step="0.01"
                                                            value={tempMinPrice}
                                                            onChange={(e) => setTempMinPrice(e.target.value)}
                                                            onBlur={handleMinPriceBlur}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    handleMinPriceBlur();
                                                                } else if (e.key === "Escape") {
                                                                    setEditingMinPrice(false);
                                                                    setTempMinPrice("");
                                                                }
                                                            }}
                                                            className="inline-block w-24 ml-1 px-2 py-1 border border-blue-500 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <span className="text-gray-900 font-medium">
                                                            {Number(minPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                        </span>
                                                    )}
                                                </label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max={maxProductPrice}
                                                    step="10"
                                                    value={minPrice}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        setMinPrice(val);
                                                        if (val > maxPrice) setMaxPrice(val);
                                                    }}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                                />
                                            </div>
                                            <div>
                                                <label 
                                                    className="block text-sm text-gray-600 mb-2 cursor-text"
                                                    onClick={() => {
                                                        if (!editingMaxPrice) {
                                                            setEditingMaxPrice(true);
                                                            setTempMaxPrice(maxPrice.toString());
                                                        }
                                                    }}
                                                >
                                                    Máximo:{" "}
                                                    {editingMaxPrice ? (
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={maxProductPrice}
                                                            step="0.01"
                                                            value={tempMaxPrice}
                                                            onChange={(e) => setTempMaxPrice(e.target.value)}
                                                            onBlur={handleMaxPriceBlur}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    handleMaxPriceBlur();
                                                                } else if (e.key === "Escape") {
                                                                    setEditingMaxPrice(false);
                                                                    setTempMaxPrice("");
                                                                }
                                                            }}
                                                            className="inline-block w-24 ml-1 px-2 py-1 border border-blue-500 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <span className="text-gray-900 font-medium">
                                                            {Number(maxPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                        </span>
                                                    )}
                                                </label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max={maxProductPrice}
                                                    step="10"
                                                    value={maxPrice}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        setMaxPrice(val);
                                                        if (val < minPrice) setMinPrice(val);
                                                    }}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </aside>

                    {/* Área de Produtos */}
                    <div className="flex-1">
                        {/* Título e Ordenação */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                                    {bySearch && searchedWord ? `Resultados para "${searchedWord}"` : "Produtos"}
                                </h1>
                                <p className="text-gray-600">
                                    Mostrando {startIndex + 1}-{Math.min(startIndex + productsPerPage, filteredProducts.length)} de {filteredProducts.length} produtos
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-medium text-gray-700">Ordenar por:</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                >
                                    <option value="name">Nome</option>
                                    <option value="price-low">Preço: Menor para Maior</option>
                                    <option value="price-high">Preço: Maior para Menor</option>
                                </select>
                            </div>
                        </div>

                        {/* Grid de Produtos */}
                        {paginatedProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                <StoreProductsContainer
                                    searched={false}
                                    searchedWord=""
                                    products={paginatedProducts}
                                />
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">Nenhum produto encontrado.</p>
                                <p className="text-gray-400 text-sm mt-2">Tente ajustar os filtros ou fazer uma nova busca.</p>
                            </div>
                        )}

                        {/* Paginação */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-4 py-2 border rounded-lg ${
                                                    currentPage === page
                                                        ? "bg-blue-600 text-white border-blue-600"
                                                        : "border-gray-300 hover:bg-gray-50"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                                        return <span key={page} className="px-2">...</span>;
                                    }
                                    return null;
                                })}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}