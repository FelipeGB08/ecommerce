import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SignupConnection } from "../../connections/credentialConnections";
import { ShoppingBag, Store, Eye, EyeOff, Mail, CheckCircle2 } from "lucide-react";

export default function SignupScreen() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [role, setRole] = useState<"customer" | "seller">("customer");
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();

    // Função para validar senha
    function validatePassword(pwd: string): string {
        if (pwd.length < 6) {
            return "A senha deve ter no mínimo 6 caracteres";
        }
        if (!/\d/.test(pwd)) {
            return "A senha deve conter ao menos um número";
        }
        return "";
    }

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault();
        
        // Limpar erros anteriores
        setPasswordError("");
        
        // Validação de senha
        const passwordValidation = validatePassword(password);
        if (passwordValidation) {
            setPasswordError(passwordValidation);
            return;
        }
        
        // Validação de confirmação de senha
        if (password !== confirmPassword) {
            setPasswordError("As senhas não coincidem!");
            return;
        }
        
        if (!agreedToTerms) {
            alert("Você precisa concordar com os Termos de Serviço e Política de Privacidade!");
            return;
        }

        // O backend espera { name, password, seller: "seller" } para vendedor
        // ou apenas { name, password } para cliente (usa "customer" como padrão)
        const body = role === "seller" 
            ? { name, password, seller: "seller" }
            : { name, password };
        
        const res = await SignupConnection({ body });
        
        if (res && res.ok) {
            // Mostrar mensagem de sucesso
            setShowSuccess(true);
            // Após 2 segundos, redireciona para login
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } else {
            // Mantém o comportamento atual se houver erro
            console.log("Erro no cadastro");
            alert("Erro ao criar conta. Tente novamente.");
        }
    }

    return (
        <main className="h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div className="w-full max-w-2xl">
                {/* Header com logo e link de login */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="w-7 h-7 text-blue-600" />
                        <h1 className="text-xl font-bold text-gray-900">Ecommerce</h1>
                    </div>
                    <div className="text-sm">
                        <span className="text-gray-600">Já tem uma conta? </span>
                        <Link 
                            to="/login" 
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Entrar
                        </Link>
                    </div>
                </div>

                {/* Mensagem de Sucesso */}
                {showSuccess && (
                    <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div>
                            <p className="text-green-800 font-medium">Registro realizado com sucesso!</p>
                            <p className="text-green-600 text-sm">Redirecionando para o login...</p>
                        </div>
                    </div>
                )}

                {/* Card do formulário */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        Criar conta
                    </h2>
                    <p className="text-gray-600 mb-6 text-sm">
                        Gerencie seus produtos ou comece a comprar hoje.
                    </p>

                    <form onSubmit={handleSignup} className="space-y-4">
                        {/* Seção "Eu quero" */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                Eu quero
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setRole("customer")}
                                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 text-sm font-medium transition ${
                                        role === "customer"
                                            ? "bg-blue-50 border-blue-600 text-blue-600"
                                            : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    <ShoppingBag className="w-4 h-4" />
                                    Comprar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole("seller")}
                                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 text-sm font-medium transition ${
                                        role === "seller"
                                            ? "bg-blue-50 border-blue-600 text-blue-600"
                                            : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    <Store className="w-4 h-4" />
                                    Vender
                                </button>
                            </div>
                        </div>

                        {/* Grid de campos lado a lado */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Campo Nome Completo */}
                            <div>
                                <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">
                                    Nome Completo
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Digite seu nome"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    required
                                />
                            </div>

                            {/* Campo Email */}
                            <div>
                                <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <div className="relative">
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="nome@empresa.com"
                                        className="w-full px-3 py-2 pl-9 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    />
                                    <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        {/* Grid de senhas lado a lado */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Campo Senha */}
                            <div>
                                <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                                    Senha
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setPasswordError("");
                                        }}
                                        placeholder="Mín. 6 caracteres + 1 número"
                                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition pr-10 ${
                                            passwordError ? "border-red-300" : "border-gray-300"
                                        }`}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                {passwordError && (
                                    <p className="mt-1 text-xs text-red-600">{passwordError}</p>
                                )}
                            </div>

                            {/* Campo Confirmar Senha */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1">
                                    Confirmar Senha
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            // Validar quando confirmar senha é alterada
                                            if (e.target.value && e.target.value !== password) {
                                                setPasswordError("As senhas não coincidem!");
                                            } else if (e.target.value === password && password) {
                                                setPasswordError("");
                                            }
                                        }}
                                        placeholder="Confirme sua senha"
                                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition pr-10 ${
                                            passwordError ? "border-red-300" : "border-gray-300"
                                        }`}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Checkbox de Termos */}
                        <div>
                            <label className="flex items-start gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    required
                                />
                                <span className="text-xs text-gray-700">
                                    Concordo com os{" "}
                                    <span className="font-bold">Termos de Serviço</span> e{" "}
                                    <span className="font-bold">Política de Privacidade</span>.
                                </span>
                            </label>
                        </div>

                        {/* Botão Criar Conta */}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition text-sm"
                        >
                            Criar conta
                        </button>
                    </form>

                    {/* Separador */}
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-2 bg-white text-gray-500">Ou continue com</span>
                        </div>
                    </div>

                    {/* Botão Google */}
                    <button
                        type="button"
                        className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition text-sm"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                        Cadastre-se com Google
                    </button>
                </div>
            </div>
        </main>
    );
}