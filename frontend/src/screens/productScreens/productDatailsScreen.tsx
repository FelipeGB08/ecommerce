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

  // ID temporário para teste de carrinho
  const userId = "123"; 

  useEffect(() => {
      //faz uma requisição para pegar os detalhes
      async function showProductDetails() {
          const res = await ShowProductDetailsConnection({ body: {"productId":productId} });

          if (res && res.ok) {
            setDetails(res.msg);
        }
      }
      showProductDetails();
  }, [productId]); // Adicionado productId como dependência por boa prática

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

  // Função para lidar com a adição ao carrinho
  async function handleAddToCart() {
    const res = await AddProductCartConnection({ 
      body: { 
        "productId": productId, 
        "userId": userId // Enviando o userId necessário para o seu Controller
      } 
    });

    if (res && res.ok) {
      alert("Produto adicionado ao carrinho!");
    } else {
      alert("Erro ao adicionar ao carrinho.");
    }
  }

  return(
    <main className="page">
      <section className="stack" aria-labelledby="product-title">
        <header className="stack card" style={{ gap: 12 }}>
          <div className="stack" style={{ gap: 4 }}>
            <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>Detalhes do produto</p>
            <h1 id="product-title">{details.name}</h1>
            <p style={{ fontSize: 24, fontWeight: 'bold', color: '#10b981', margin: '8px 0' }}>
              {details.price ? `R$ ${Number(details.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Carregando preço...'}
            </p>
          </div>

          <div className="stack" style={{ gap: 12 }}>
            <img
              src="https://cdn.iconscout.com/icon/free/png-256/free-adicionar-ao-carrinho-icon-svg-download-png-1794993.png"
              alt="Adicionar ao carrinho"
              onClick={(e) => {
                e.preventDefault();
                handleAddToCart(); // Chamando a nova função com validação
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