import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SignupConnection } from "../../connections/credentialConnections";

export default function SignupScreen() {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const customer = "customer";
    const seller = "seller";

    async function handleSignup(role: string) {
        // O backend espera { name, password, seller: "seller" } para vendedor
        // ou apenas { name, password } para cliente (usa "customer" como padrão)
        const body = role === "seller" 
            ? { name, password, seller: role }
            : { name, password };
        
        const res = await SignupConnection({ body });
        
        if (res && res.ok) {
            // Após signup bem-sucedido, redireciona para login
            navigate("/login");
        } else {
            // Mantém o comportamento atual se houver erro
            console.log("Erro no cadastro");
        }
    }

    return (
        <main className="page">
            <section className="card stack" aria-labelledby="signup-title">
                <header className="stack" style={{ gap: 8 }}>
                    <h1 id="signup-title">Criar conta</h1>
                    <p>Escolha se deseja se cadastrar como cliente ou vendedor.</p>
                </header>

                <form className="stack" onSubmit={(e) => e.preventDefault()}>
                    <label className="stack" style={{ gap: 4 }}>
                        <span>Nome</span>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Digite seu nome"
                        />
                    </label>

                    <label className="stack" style={{ gap: 4 }}>
                        <span>Senha</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Crie uma senha"
                        />
                    </label>

                    <div className="stack" style={{ gap: 8 }}>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => handleSignup(customer)}
                        >
                            Cadastrar como cliente
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => handleSignup(seller)}
                        >
                            Cadastrar como vendedor
                        </button>
                    </div>
                </form>

                <div style={{ textAlign: "center", marginTop: 16 }}>
                    <small style={{ color: "#9ca3af" }}>
                        Já tem uma conta?{" "}
                        <Link to="/login" style={{ color: "#60a5fa", textDecoration: "none" }}>
                            Entrar
                        </Link>
                    </small>
                </div>
            </section>
        </main>
    );
}