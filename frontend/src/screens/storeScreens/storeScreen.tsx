import { StoreProductsContainer } from "../../containers/storeContainers/storeProductsContainer";
import { SearchProductComponent } from "../../components/productComponents/searchProductComponent";
import { useSearchParams } from "react-router-dom";

export default function StoreScreen({}:{}) {

    const [searchParams] = useSearchParams();

    //tenta pegar estes itens abaixo direto da Url (não obrigatórios, só para pesquisa)
    const bySearch = searchParams.get("bySearch") === "true";
    const searchedWord = searchParams.get("word") ?? "";


    return(
        <main className="page">
            <section className="stack" aria-labelledby="store-title">
                <header className="stack" style={{ gap: 4 }}>
                    <h1 id="store-title">Loja</h1>
                    {bySearch && searchedWord.length > 0 && (
                        <p>Resultados para “{searchedWord}”.</p>
                    )}
                </header>

                <section className="card stack">
                    <SearchProductComponent />
                </section>

                <section className="grid">
                    <StoreProductsContainer
                        searched={bySearch && searchedWord.length > 0}
                        searchedWord={searchedWord}
                    />
                </section>
            </section>
        </main>
    );
}