import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LoginConnection } from "../../connections/credentialConnections";
import { ShoppingBag, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function LoginScreen() {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        const res = await LoginConnection({ body: { name, password } });
        
        if (res && res.ok) {
            // Mostrar mensagem de sucesso
            setShowSuccess(true);
            // Após 1.5 segundos, redireciona para a loja
            setTimeout(() => {
                navigate("/store");
            }, 1500);
        } else {
            // Mantém o comportamento atual se houver erro (pode adicionar feedback visual depois)
            console.log("Erro no login");
            alert("Erro ao fazer login. Verifique suas credenciais e tente novamente.");
        }
    }

    return (
        <main className="min-h-screen flex">
            {/* Lado esquerdo - Imagem de fundo */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 overflow-hidden">
                {/* Imagem de fundo com blur */}
                <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80')",
                        filter: "blur(2px)"
                    }}
                />
                <div className="absolute inset-0 bg-amber-900/60" />
                
                {/* Conteúdo sobre a imagem */}
                <div className="relative z-10 flex flex-col justify-end p-12 text-white">
                    <ShoppingBag className="w-12 h-12 mb-6" />
                    <blockquote className="text-2xl font-medium mb-4">
                        "A melhor forma de prever o futuro é criá-lo."
                    </blockquote>
                    <p className="text-lg text-white/90">
                        Gerencie sua loja com confiança.
                    </p>
                </div>
            </div>

            {/* Lado direito - Formulário */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
                <div className="w-full max-w-md">
                    {/* Logo e título */}
                    <div className="flex items-center gap-3 mb-2">
                        <ShoppingBag className="w-8 h-8 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Ecommerce</h1>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Bem-vindo de volta
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Por favor, insira seus dados para entrar.
                    </p>

                    {/* Mensagem de Sucesso */}
                    {showSuccess && (
                        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <div>
                                <p className="text-green-800 font-medium">Login realizado com sucesso!</p>
                                <p className="text-green-600 text-sm">Redirecionando...</p>
                            </div>
                        </div>
                    )}

                    {/* Formulário */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Campo Nome */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Nome
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="seu-nome"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                required
                            />
                        </div>

                        {/* Campo Senha */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition pr-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Lembrar e Esqueceu senha */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">
                                    Lembrar por 30 dias
                                </span>
                            </label>
                            <Link 
                                to="#" 
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                onClick={(e) => {
                                    e.preventDefault();
                                    // Funcionalidade de recuperação de senha pode ser implementada depois
                                }}
                            >
                                Esqueceu a senha?
                            </Link>
                        </div>

                        {/* Botão Entrar */}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                        >
                            Entrar
                        </button>
                    </form>

                    {/* Separador */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Ou continue com</span>
                        </div>
                    </div>

                    {/* Botão Google */}
                    <button
                        type="button"
                        className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Google
                    </button>

                    {/* Link para cadastro */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-600 text-sm">
                            Não tem uma conta?{" "}
                            <Link 
                                to="/signup" 
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Cadastre-se
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}