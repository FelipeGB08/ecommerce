import { useEffect, useState, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { GetUserInfoConnection } from '../connections/credentialConnections';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'seller' | 'customer';
}

export default function ProtectedRoute({ children, requiredRole = 'seller' }: ProtectedRouteProps) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUserRole() {
      try {
        const res = await GetUserInfoConnection();
        if (res && res.ok) {
          setUserRole(res.role || 'customer');
        } else {
          setUserRole('customer');
        }
      } catch (error) {
        console.error('Erro ao verificar role do usuário:', error);
        setUserRole('customer');
      } finally {
        setLoading(false);
      }
    }
    checkUserRole();
  }, []);

  // Mostrar loading enquanto verifica
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500">Verificando acesso...</div>
        </div>
      </div>
    );
  }

  // Se o role requerido é seller e o usuário não é seller, redirecionar
  if (requiredRole === 'seller' && userRole !== 'seller') {
    return <Navigate to="/unauthorized" replace />;
  }

  // Se tudo estiver ok, renderizar o children
  return <>{children}</>;
}
