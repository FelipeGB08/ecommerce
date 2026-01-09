import { StandardFunction } from "./connectionsConfig";

export function CreateProductConnection({ body }: { body: Record<string, any> }) {
    return StandardFunction({
        requestType: "POST",
        route: "/productRoute.php",
        whitchFunction: "createProduct",
        body: body
    });
}

export function AddProductCartConnection({ body }: { body: Record<string, any> }) {
    return StandardFunction({
        requestType: "POST",
        route: "/productRoute.php",
        whitchFunction: "addProductCart",
        body: body
    });
}

export function ShowProductDetailsConnection({ body }: { body: Record<string, any> }) {
    return StandardFunction({
        requestType: "POST",
        route: "/productRoute.php",
        whitchFunction: "getProductDetails",
        body: body
    });
}

export function PublicProductRateConnection({ body }: { body: Record<string, any> }) {
    return StandardFunction({
        requestType: "POST",
        route: "/productRoute.php",
        whitchFunction: "publicProductRate",
        body: body
    });
}

export function GetProductCommentsConnection({ body }: { body: Record<string, any> }) {
    return StandardFunction({
        requestType: "POST",
        route: "/productRoute.php",
        whitchFunction: "getProductComments",
        body: body
    });
}

export function GetStoreSearchedProductsConnection({ body }: { body: Record<string, any> }) {
    return StandardFunction({
        requestType: "POST",
        route: "/productRoute.php",
        whitchFunction: "getStoreSearchedProducts",
        body: body
    });
}

export function SellerGetStoreSearchedProductsConnection({ body }: { body: Record<string, any> }) {
    return StandardFunction({
        requestType: "POST",
        route: "/productRoute.php",
        whitchFunction: "sellerGetStoreSearchedProducts",
        body: body
    });
}

export function GetUserCartConnection({ body }: { body: Record<string, any> }) {
    return StandardFunction({
        requestType: "POST",
        route: "/productRoute.php",
        whitchFunction: "getUserCart",
        body: body
    });
}

export function UpdateCartQuantityConnection({ body }: { body: Record<string, any> }) {
    return StandardFunction({
        requestType: "POST",
        route: "/productRoute.php",
        whitchFunction: "updateCartQuantity",
        body: body
    });
}

export function RemoveFromCartConnection({ body }: { body: Record<string, any> }) {
    return StandardFunction({
        requestType: "POST",
        route: "/productRoute.php",
        whitchFunction: "removeFromCart",
        body: body
    });
}

export function CreatePaymentConnection({ body }: { body: Record<string, any> }) {
    return StandardFunction({
        requestType: "POST",
        route: "/productRoute.php",
        whitchFunction: "createPayment",
        body: body
    });
}