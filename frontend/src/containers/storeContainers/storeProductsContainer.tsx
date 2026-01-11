import { StoreProductComponent } from "../../components/storeComponents/storeProductComponent";

export function StoreProductsContainer({
    searched, 
    searchedWord, 
    products
}: {
    searched: boolean; 
    searchedWord: string;
    products?: any[];
}) {
    // Se produtos foram passados diretamente (filtrados/paginados), use-os
    if (products && products.length > 0) {
        return (
            <>
                {products.map((item: any, index: any) => {
                    // Tratar diferentes formatos de ID do MongoDB
                    let productId = "";
                    if (item._id) {
                        if (typeof item._id === "object" && item._id.$oid) {
                            productId = item._id.$oid;
                        } else if (typeof item._id === "string") {
                            productId = item._id;
                        } else {
                            productId = String(item._id);
                        }
                    }
                    
                    return (
                        <StoreProductComponent 
                            key={productId || `product-${index}`}
                            id={productId} 
                            name={item.name || "Produto sem nome"} 
                            price={item.price || 0}
                            coverImage={item.coverImage || undefined}
                        />
                    );
                })}
            </>
        );
    }

    // Fallback: nenhum produto para exibir
    return (
        <div className="col-span-full text-center py-12">
            <p className="text-gray-500">Nenhum produto encontrado.</p>
        </div>
    );
}