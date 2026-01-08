import { useState } from "react";
import { CreateProductConnection } from "../../connections/productConnection";

export default function CreateProductScreen() {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");

    return (
        <main className="page">
            <section className="card stack" aria-labelledby="create-product-title">
                <header className="stack" style={{ gap: 8 }}>
                    <h1 id="create-product-title">Cadastrar produto</h1>
                    <p>Preencha os dados do produto para disponibilizar na loja.</p>
                </header>

                <form className="stack" onSubmit={(e) => { e.preventDefault(); CreateProductConnection({ body: { name, price } }); }}>
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
            </section>
        </main>
    );
}