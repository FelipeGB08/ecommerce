import { Link } from "react-router-dom";
import { AddProductCartConnection } from "../../connections/productConnection";

export function StoreProductComponent(
  { id, name, price }: { id: string; name: string; price: number }
) {
  return (
    <>
    <Link to={`/products/${id}`}>
      <div>
        <h1>{name}</h1>
        {/* Usamos o toLocaleString para garantir a vírgula e o R$ sem mudar o estilo */}
        <p>
          {Number(price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>  
      </div>
      </Link>
      <img
          src="https://cdn.iconscout.com/icon/free/png-256/free-adicionar-ao-carrinho-icon-svg-download-png-1794993.png"
          onClick={(e) => {
            e.preventDefault();
            AddProductCartConnection({ body: { productId: id } });
          }}>
        </img>
    </> 
  )
}