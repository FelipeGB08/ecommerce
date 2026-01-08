export default function IncorrectUserType() {
    return(
        <main className="page" style={{ display: "flex", minHeight: "70vh", alignItems: "center", justifyContent: "center" }}>
            <section className="card stack" aria-labelledby="forbidden-title" style={{ textAlign: "center" }}>
                <h1 id="forbidden-title">Você não pode acessar essa página</h1>
                <p>Este conteúdo é exclusivo para vendedores.</p>
            </section>
        </main>
    );
}