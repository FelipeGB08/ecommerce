import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Search, ShoppingCart, User, ChevronUp, Plus } from "lucide-react";
import { useCart } from "../contexts/cartContext";
import { GetUserInfoConnection } from "../connections/credentialConnections";

interface NavbarProps {
  showSearch?: boolean;
}

export default function Navbar({ showSearch = true }: NavbarProps) {
  const navigate = useNavigate();
  const { cartItemCount } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Verificar tipo de usuário e obter nome ao carregar
  useEffect(() => {
    async function checkUserRole() {
      try {
        const res = await GetUserInfoConnection();
        if (res && res.ok) {
          setUserRole(res.role || "customer");
          setUserName(res.name || "");
        } else {
          setUserRole("customer");
          setUserName("");
        }
      } catch (error) {
        setUserRole("customer");
        setUserName("");
      }
    }
    checkUserRole();
  }, []);

  // Fechar menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  // Função para fazer logout
  function handleLogout() {
    navigate("/login");
  }

  // Função de pesquisa
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/store?bySearch=true&word=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate(`/store`);
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/store" className="flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Ecommerce</h1>
          </Link>

          {/* Barra de Pesquisa */}
          {showSearch && (
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
          )}

          {/* Navegação e Ícones */}
          <div className="flex items-center gap-6">
            {/* Botão para Vendedores - Criar Produto */}
            {userRole === "seller" && (
              <Link
                to="/products/create"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Produto</span>
              </Link>
            )}
            <Link to="/cart" className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <User className="w-6 h-6 text-gray-700" />
                <ChevronUp className={`w-4 h-4 text-gray-700 transition-transform ${showUserMenu ? "" : "rotate-180"}`} />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {/* Informações da Conta */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <User className="w-8 h-8 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{userName || "Usuário"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Opções do Menu */}
                  <div className="py-1">
                    {userRole === "seller" && (
                      <>
                        <Link
                          to="/products/my-products"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Meus Produtos
                        </Link>
                        <Link
                          to="/products/create"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Adicionar Produto
                        </Link>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
