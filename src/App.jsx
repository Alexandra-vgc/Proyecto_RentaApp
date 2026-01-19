import { useState } from "react";
import WelcomeModal from "./components/WelcomeModal";

function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <>
      {showWelcome && (
        <WelcomeModal onFinish={() => setShowWelcome(false)} />
      )}

      {!showWelcome && (
        <div className="main-content">
          <h2>Departamentos disponibles</h2>
          <p>
            Aquí se carga el contenido principal de Mi Renta App.
          </p>
        </div>
      )}
    </>
  );
}

export default App;
