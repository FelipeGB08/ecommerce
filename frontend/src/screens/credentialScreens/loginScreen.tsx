import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LoginConnection } from "../../connections/credentialConnections";

export default function LoginScreen() {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        const res = await LoginConnection({ body: { name, password } });
        
        if (res && res.ok) {
            // Após login bem-sucedido, redireciona para a loja
            navigate("/store");
        } else {
            // Mantém o comportamento atual se houver erro (pode adicionar feedback visual depois)
            console.log("Erro no login");
        }
    }

    return (
        <main className="page">
            <section className="card stack" aria-labelledby="login-title">
                <header className="stack" style={{ gap: 8 }}>
                    <h1 id="login-title">Entrar</h1>
                    <p>Use suas credenciais para acessar.</p>
                </header>

                <form className="stack" onSubmit={handleLogin}>
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
                            placeholder="Digite sua senha"
                        />
                    </label>

                    <button type="submit" className="btn btn-primary">Entrar</button>
                </form>

                <div style={{ textAlign: "center", marginTop: 16 }}>
                    <small style={{ color: "#9ca3af" }}>
                        Não tem uma conta?{" "}
                        <Link to="/signup" style={{ color: "#60a5fa", textDecoration: "none" }}>
                            Cadastre-se
                        </Link>
                    </small>
                </div>
            </section>
        </main>
    );
}