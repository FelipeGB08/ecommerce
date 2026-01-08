import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CreateProductConnection } from "../../connections/productConnection";

export default function CreateProductScreen() {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const navigate = useNavigate();

    async function handleCreateProduct(e: React.FormEvent) {
        e.preventDefault();
        const res = await CreateProductConnection({ body: { name, price } });
        
        if (res && res.ok) {
            // Limpa os campos após sucesso
            setName("");
            setPrice("");
            // Opcional: redireciona para promoções ou mantém na página
            // navigate("/promotions");
        }
    }

    return (
        <main className="page">
            <section className="card stack" aria-labelledby="create-product-title">
                <header className="stack" style={{ gap: 8 }}>
                    <h1 id="create-product-title">Cadastrar produto</h1>
                    <p>Preencha os dados do produto para disponibilizar na loja.</p>
                </header>

                <form className="stack" onSubmit={handleCreateProduct}>
                    <label className="stack" style={{ gap: 4 }}>
                        <span>Nome do produto</span>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => { setName(e.target.value); }}
                            placeholder="Ex.: Camiseta básica"
                        />
                    </label>

                    <label className="stack" style={{ gap: 4 }}>
                        <span>Preço</span>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={price}
                            onChange={(e) => { setPrice(e.target.value); }}
                            placeholder="Ex.: 59,90"
                        />
                        <small>Use o formato monetário desejado (ex.: 59,90).</small>
                    </label>

                    <button type="submit" className="btn btn-primary">Criar produto</button>
                </form>

                <div style={{ marginTop: 16 }}>
                    <Link to="/promotions" style={{ color: "#60a5fa", textDecoration: "none", fontSize: 14 }}>
                        ← Gerenciar promoções
                    </Link>
                </div>
            </section>
        </main>
    );
}