import { Link } from "react-router-dom";
import { ShoppingBag, Lock, User } from "lucide-react";

export default function IncorrectUserType() {
    function handleLogout() {
        // Implementar logout se necessário
        window.location.href = "/login";
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/store" className="flex items-center gap-3">
                            <ShoppingBag className="w-8 h-8 text-blue-600" />
                            <h1 className="text-2xl font-bold text-gray-900">Ecommerce</h1>
                        </Link>

                        {/* Right side - Logout button and User icon */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Logout
                            </button>
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="w-6 h-6 text-gray-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
                <div className="w-full max-w-md">
                    {/* Card */}
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
                        {/* Lock Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <Lock className="w-8 h-8 text-red-600" />
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Acesso Restrito
                        </h1>

                        {/* Description */}
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Esta área é gerenciada por Vendedores. Parece que você está logado como Comprador. 
                            Por favor, troque de conta ou retorne à loja.
                        </p>

                        {/* Button */}
                        <Link
                            to="/store"
                            className="inline-block w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Voltar para a Loja
                        </Link>

                        {/* Support Link */}
                        <p className="mt-6 text-sm text-gray-500">
                            Acha que isso é um engano?{" "}
                            <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                                Entre em contato com o suporte
                            </a>
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        {/* Footer Links */}
                        <div className="flex justify-center gap-6 mb-4 text-sm text-gray-500">
                            <a href="#" className="hover:text-gray-700 transition-colors">
                                Política de Privacidade
                            </a>
                            <a href="#" className="hover:text-gray-700 transition-colors">
                                Termos de Serviço
                            </a>
                            <a href="#" className="hover:text-gray-700 transition-colors">
                                Central de Ajuda
                            </a>
                        </div>

                        {/* Copyright */}
                        <p className="text-sm text-gray-400">
                            © 2024 Ecommerce Inc.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
