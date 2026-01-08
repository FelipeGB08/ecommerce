import { useState } from "react";
import { SignupConnection } from "../../connections/credentialConnections";

export default function SignupScreen() {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const customer = "customer";
    const seller = "seller";

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
                            onClick={() => SignupConnection({ body: { name, password, customer } })}
                        >
                            Cadastrar como cliente
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => SignupConnection({ body: { name, password, seller } })}
                        >
                            Cadastrar como vendedor
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}