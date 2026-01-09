import { useEffect, useState } from "react";
// Importe as novas conexões aqui
import { GetUserCartConnection, UpdateCartQuantityConnection, RemoveFromCartConnection } from "../../connections/productConnection";

export default function CartScreen() {
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Função para recarregar o carrinho
    async function loadCart() {
        setLoading(true);
        const res = await GetUserCartConnection({ body: {} });
        if (res && res.ok) {
            setCartItems(res.msg);
        }
        setLoading(false);
    }

    useEffect(() => {
        loadCart();
    }, []);

    // Lógica para alterar quantidade
    async function handleQuantity(productId: string, currentQty: number, change: number) {
        const newQty = currentQty + change;
        if (newQty < 1) return; // Não deixa baixar de 1

        // Atualização Otimista (Muda na tela antes de ir pro banco pra parecer rápido)
        const updatedItems = cartItems.map(item => 
            String(item.productId.$oid) === productId ? { ...item, quantity: newQty } : item
        );
        setCartItems(updatedItems);

        // Chama o backend
        await UpdateCartQuantityConnection({ 
            body: { productId: productId, quantity: newQty } 
        });
    }

    // Lógica para remover item
    async function handleRemove(productId: string) {
        if(!confirm("Tem certeza que deseja remover este item?")) return;

        // Remove da tela imediatamente
        setCartItems(prev => prev.filter(item => String(item.productId.$oid) !== productId));

        // Chama o backend
        await RemoveFromCartConnection({ 
            body: { productId: productId } 
        });
    }

    // Calcula o total do carrinho
    const cartTotal = cartItems.reduce((acc, item) => {
        return acc + (item.price * (item.quantity || 1));
    }, 0);

    return (
        <main className="page">
            <section className="stack" aria-labelledby="cart-title">
                <header className="stack card" style={{ gap: 4 }}>
                    <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>Finalizar pedido</p>
                    <h1 id="cart-title">Meu Carrinho</h1>
                </header>

                <section className="stack" style={{ gap: 12 }}>
                    {loading ? (
                        <div className="card">Carregando itens...</div>
                    ) : cartItems.length > 0 ? (
                        cartItems.map((item, index) => {
                            // Pega o ID corretamente do objeto OID do Mongo
                            const pId = String(item.productId.$oid);
                            
                            return (
                                <article key={index} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div className="stack" style={{ gap: 4 }}>
                                        <h3 style={{ margin: 0 }}>{item.name}</h3>
                                        
                                        <p style={{ margin: 0, fontSize: 16, color: '#10b981', fontWeight: 'bold' }}>
                                            {item.price 
                                                ? `R$ ${Number(item.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                                                : 'R$ --'}
                                        </p>

                                        {/* BOTOES DE QUANTIDADE */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                                            <button 
                                                className="btn" 
                                                style={{ padding: '2px 8px', minWidth: '30px' }}
                                                onClick={() => handleQuantity(pId, item.quantity || 1, -1)}
                                            >-</button>
                                            
                                            <span style={{ fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>
                                                {item.quantity || 1}
                                            </span>
                                            
                                            <button 
                                                className="btn" 
                                                style={{ padding: '2px 8px', minWidth: '30px' }}
                                                onClick={() => handleQuantity(pId, item.quantity || 1, 1)}
                                            >+</button>
                                        </div>
                                    </div>

                                    <div className="stack" style={{ alignItems: 'flex-end', gap: 12 }}>
                                        <span 
                                            style={{ color: "#ef4444", cursor: "pointer", fontSize: 14, textDecoration: 'underline' }}
                                            onClick={() => handleRemove(pId)}
                                        >
                                            Remover
                                        </span>
                                        {/* Subtotal do item */}
                                        <span style={{ fontSize: 12, color: '#6b7280' }}>
                                            Sub: R$ {(item.price * (item.quantity || 1)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </article>
                            );
                        })
                    ) : (
                        <div className="card">
                            <p>Seu carrinho está vazio.</p>
                        </div>
                    )}
                </section>

                {cartItems.length > 0 && (
                    <footer className="card stack" style={{ marginTop: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 'bold' }}>
                            <span>Total:</span>
                            <span>R$ {cartTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <button className="btn btn-primary" style={{ marginTop: 10 }}>
                            Finalizar Compra
                        </button>
                    </footer>
                )}
                
            </section>
        </main>
    );
}