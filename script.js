// App.js
import React, 'useState', { useEffect } from 'react';
import Settings from './Settings'; // Importa o novo componente de configurações
import './App.css'; // Importa a folha de estilos

// Importe sua imagem aqui. Coloque o arquivo da imagem na mesma pasta (src) para facilitar.
import logoPixelUp from './logo.png'; 

function App() {
  // Estado para controlar o tema atual ('light' ou 'dark')
  const [theme, setTheme] = useState('light');

  // Função para alternar o tema
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Efeito que adiciona a classe do tema ao body do documento
  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(theme);
  }, [theme]);

  return (
    <div className={`app-container ${theme}`}>
      <header className="app-header">
        <div className="logo-container">
          {/* Use a imagem importada aqui */}
          <img src={logoPixelUp} alt="Pixel Up Logo" className="header-logo" />
          <h1>Aceleração de Vendas</h1> {/* NOME ALTERADO AQUI */}
        </div>
      </header>
      
      <main className="app-main">
        {/* Renderiza o novo componente de Configurações */}
        <Settings toggleTheme={toggleTheme} currentTheme={theme} />
        
        {/* Você pode adicionar outras seções da sua aplicação aqui */}
      </main>
    </div>
  );
}

export default App;
