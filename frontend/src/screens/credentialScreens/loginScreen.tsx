import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LoginConnection } from "../../connections/credentialConnections";
import { ShoppingBag, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        const res = await LoginConnection({ body: { email, password } });
        
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
                        {/* Campo Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu-email@exemplo.com"
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