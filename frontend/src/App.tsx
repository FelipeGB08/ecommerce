import { Routes, Route, Navigate, useParams } from 'react-router-dom'; 
import LoginScreen from './screens/credentialScreens/loginScreen';
import SignupScreen from './screens/credentialScreens/signupScreen';
import CreateProductScreen from './screens/productScreens/createProductScreen';
import StoreScreen from './screens/storeScreens/storeScreen';
import ProductDatailsScreen from './screens/productScreens/productDatailsScreen';
import CreatePromotionScreen from './screens/productScreens/createPromotionScreen';
import IncorrectUserType from './screens/errorScreens/incorrectUserType';

// Componente para redirecionar rotas antigas de produtos
function RedirectProductDetails() {
  const { productId } = useParams<{ productId: string }>();
  return <Navigate to={`/products/${productId}`} replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Rotas principais */}
      <Route path="/" element={<LoginScreen />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/signup" element={<SignupScreen />} />
      <Route path="/store" element={<StoreScreen />} />
      
      {/* Rotas de produtos - novas (mais limpas) */}
      <Route path="/products/:productId" element={<ProductDatailsScreen />} />
      <Route path="/products/create" element={<CreateProductScreen />} />
      <Route path="/promotions" element={<CreatePromotionScreen />} />
      
      {/* Rotas antigas (mantidas para compatibilidade) */}
      <Route path="/productdetails/:productId" element={<RedirectProductDetails />} />
      <Route path="/createproduct" element={<Navigate to="/products/create" replace />} />
      <Route path="/createpromotionscreen" element={<Navigate to="/promotions" replace />} />
      
      {/* Rotas de erro */}
      <Route path="/unauthorized" element={<IncorrectUserType />} />
      <Route path="/incorrectusertype" element={<Navigate to="/unauthorized" replace />} />
      
      {/* 404 - redireciona para login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
