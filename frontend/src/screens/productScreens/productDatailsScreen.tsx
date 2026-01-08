import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ShowProductDetailsConnection } from "../../connections/productConnection";
import { AddProductCartConnection } from "../../connections/productConnection";
import { PublicProductRateConnection } from "../../connections/productConnection";
import { GetProductComments } from "../../containers/productContainers/commentsContainer";

export default function ProductDatailsScreen() {
  const { productId } = useParams<{ productId: string }>();
  const [details, setDetails] = useState<any>({});
  const [comment, setComment] = useState("");

  useEffect(() => {
      //faz uma requisição para pegar os detalhes
      async function showProductDetails() {
          const res = await ShowProductDetailsConnection({ body: {"productId":productId} });

          if (res && res.ok) {
            setDetails(res.msg);
        }
      }
      showProductDetails();
  }, []);

  async function handleSendComment() {
      //envia comentário para o produto
      const res = await PublicProductRateConnection({
          body: { "productId": productId, "comment": comment }
      });
      
      if(res && res.ok) {
          setComment("");
          window.location.reload();
      } else {
          alert("Erro ao enviar comentário");
      }
  }

  return(
    <main className="page">
      <section className="stack" aria-labelledby="product-title">
        <header className="stack card" style={{ gap: 12 }}>
          <div className="stack" style={{ gap: 4 }}>
            <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>Detalhes do produto</p>
            <h1 id="product-title">{details.name}</h1>
          </div>

          <div className="stack" style={{ gap: 12 }}>
            <img
              src="https://cdn.iconscout.com/icon/free/png-256/free-adicionar-ao-carrinho-icon-svg-download-png-1794993.png"
              alt="Adicionar ao carrinho"
              onClick={(e) => {
                e.preventDefault();
                AddProductCartConnection({ body: { "productId": productId } });
              }}
              style={{ cursor: 'pointer', maxWidth: 64 }}
            />
          </div>
        </header>

        <section className="card stack" aria-labelledby="comment-title">
          <h2 id="comment-title">Adicionar comentário</h2>
          <label className="stack" style={{ gap: 4 }}>
            <span>Comentário</span>
            <textarea
              value={comment}
              onChange={(e)=>{setComment(e.target.value)}}
              placeholder="Escreva seu comentário..."
              rows={4}
            />
          </label>
          <button className="btn btn-primary" onClick={handleSendComment}>Adicionar comentário</button>
        </section>

        <section className="card stack" aria-labelledby="comments-list-title">
          <h3 id="comments-list-title">Comentários</h3>
          <div className="stack">
            <GetProductComments productId={productId} />
          </div>
        </section>
      </section>
    </main>
  );
}