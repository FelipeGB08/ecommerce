import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CanBePromotionalProductsContainer } from "../../containers/storeContainers/canBePromotionalProductsContainer";

export default function CreatePromotionScreen() {
    const [textAreaSearchedWord, setTextAreaSearchedWord] = useState("");
    const [searchParams] = useSearchParams();

    //tenta pegar estes itens abaixo direto da Url (não obrigatórios, só para pesquisa)
    const navigate = useNavigate();
    const searchedWord = searchParams.get("word") ?? "";
    const bySearch = searchParams.get("bySearch") === "true";

    //retorna todos os produtos do vendedor com a opção de adicionar % de desconto em cada um separadamente
    return(
        <main className="page">
            <section className="stack" aria-labelledby="promotion-title">
                <header className="stack card" style={{ gap: 8 }}>
                    <h1 id="promotion-title">Criar promoções</h1>
                    {bySearch && searchedWord.length > 0 && (
                        <p>Mostrando resultados para “{searchedWord}”.</p>
                    )}
                </header>

                <section className="card stack">
                    <form className="stack" onSubmit={(e) => {
                        e.preventDefault();
                        navigate(`/createpromotionscreen?bySearch=true&word=${encodeURIComponent(textAreaSearchedWord)}`);
                    }}>
                        <label className="stack" style={{ gap: 4 }}>
                            <span>Buscar produto</span>
                            <input
                                type="text"
                                value={textAreaSearchedWord}
                                onChange={(e)=>{setTextAreaSearchedWord(e.target.value)}}
                                placeholder="Digite o nome do produto"
                            />
                        </label>
                        <button type="submit" className="btn btn-primary">Buscar</button>
                    </form>
                </section>

                <section className="grid">
                    <CanBePromotionalProductsContainer isSearch={bySearch} searchedWord={searchedWord}/>
                </section>
            </section>
        </main>
    );
}