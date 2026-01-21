import { useState, useEffect } from 'react';

export const useTenant = () => {
  const [tenant, setTenant] = useState<string | null>(null);

  useEffect(() => {
    const hostname = window.location.hostname; // ex: boatepremium.nightflow.com
    const parts = hostname.split('.');

    // Se tiver mais de 2 partes (subdomínio presente)
    // No ambiente de desenvolvimento (localhost), parts.length geralmente é 1 ou 2.
    if (parts.length > 2) {
      setTenant(parts[0]); // Captura "boatepremium"
    } else {
      setTenant('admin'); // Default ou página de vendas
    }
  }, []);

  return tenant;
};
