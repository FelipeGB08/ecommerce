import { useState } from "react";
import { LoginConnection } from "../../connections/credentialConnections";

export default function LoginScreen() {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    return (
        <main className="page">
            <section className="card stack" aria-labelledby="login-title">
                <header className="stack" style={{ gap: 8 }}>
                    <h1 id="login-title">Entrar</h1>
                    <p>Use suas credenciais para acessar.</p>
                </header>

                <form className="stack" onSubmit={(e) => { e.preventDefault(); LoginConnection({ body: { name, password } }); }}>
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
            </section>
        </main>
    );
}