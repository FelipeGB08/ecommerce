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
                    
                    // Converter datas de promoção se existirem
                    let promotionStartDate: Date | undefined;
                    let promotionEndDate: Date | undefined;
                    let promotionPercentage: number | undefined;

                    if (item.promotionStartDate) {
                        try {
                            // Se vier como string do formato "Y-m-d H:i:s"
                            if (typeof item.promotionStartDate === 'string') {
                                promotionStartDate = new Date(item.promotionStartDate.replace(' ', 'T'));
                            } else if (typeof item.promotionStartDate === 'object') {
                                if (item.promotionStartDate.$date) {
                                    promotionStartDate = new Date(item.promotionStartDate.$date);
                                } else if (typeof item.promotionStartDate === 'number') {
                                    promotionStartDate = new Date(item.promotionStartDate);
                                }
                            } else if (typeof item.promotionStartDate === 'number') {
                                promotionStartDate = new Date(item.promotionStartDate);
                            }
                        } catch (e) {
                            console.error("Erro ao converter promotionStartDate:", e, item.promotionStartDate);
                        }
                    }

                    if (item.promotionEndDate) {
                        try {
                            // Se vier como string do formato "Y-m-d H:i:s"
                            if (typeof item.promotionEndDate === 'string') {
                                promotionEndDate = new Date(item.promotionEndDate.replace(' ', 'T'));
                            } else if (typeof item.promotionEndDate === 'object') {
                                if (item.promotionEndDate.$date) {
                                    promotionEndDate = new Date(item.promotionEndDate.$date);
                                } else if (typeof item.promotionEndDate === 'number') {
                                    promotionEndDate = new Date(item.promotionEndDate);
        }
                            } else if (typeof item.promotionEndDate === 'number') {
                                promotionEndDate = new Date(item.promotionEndDate);
                            }
                        } catch (e) {
                            console.error("Erro ao converter promotionEndDate:", e, item.promotionEndDate);
                        }
                    }

                    if (item.percentagePromotion) {
                        promotionPercentage = typeof item.percentagePromotion === 'number' 
                            ? item.percentagePromotion 
                            : parseFloat(item.percentagePromotion);
                    }
                    
                    return (
            <StoreProductComponent 
                            key={productId || `product-${index}`}
                            id={productId} 
                            name={item.name || "Produto sem nome"} 
                            price={item.price || 0}
                            coverImage={item.coverImage || undefined}
                            promotionPercentage={promotionPercentage}
                            promotionStartDate={promotionStartDate}
                            promotionEndDate={promotionEndDate}
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