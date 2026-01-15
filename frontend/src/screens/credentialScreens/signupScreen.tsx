import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SignupConnection } from "../../connections/credentialConnections";
import { ShoppingBag, Store, Eye, EyeOff, Mail, CheckCircle2, AlertCircle } from "lucide-react";

export default function SignupScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [role, setRole] = useState<"customer" | "seller">("customer");
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [serverError, setServerError] = useState("");
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
        setServerError("");
        
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
            setServerError("Você precisa concordar com os Termos de Serviço e Política de Privacidade!");
            return;
        }

        // O backend espera { email, password, seller: "seller" } para vendedor
        // ou apenas { email, password } para cliente (usa "customer" como padrão)
        const body = role === "seller" 
            ? { email, password, seller: "seller" }
            : { email, password };
        
        const res = await SignupConnection({ body });
        
        if (res && res.ok) {
            // Mostrar mensagem de sucesso
            setShowSuccess(true);
            // Após 2 segundos, redireciona para login
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } else {
            // Mostrar erro bonito
            setServerError(res?.msg || "Erro ao criar conta. Tente novamente.");
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

                {/* Mensagem de Erro */}
                {serverError && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <div>
                            <p className="text-red-800 font-medium">Erro ao registrar</p>
                            <p className="text-red-600 text-sm">{serverError}</p>
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
                            {/* Campo Email */}
                            <div className="md:col-span-2">
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
                                        required
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
                </div>
            </div>
        </main>
    );
}