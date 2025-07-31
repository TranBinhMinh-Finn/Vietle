import { useRef } from 'react';
import MapComponent from './MapComponent';
import Header from './header';
import './App.css';

const App = () => {
  const mapComponentRef = useRef();

  const handleButtonClick = () => {
    const guessInput = document.getElementById('guess');
    const guessedProvince = guessInput.value.trim();
    
    if (guessedProvince && mapComponentRef.current) {
      // Call the highlight function in MapComponent
      mapComponentRef.current.highlightProvince(guessedProvince);
      
      // Clear the input
      guessInput.value = '';
    }
  };

  return (
    <div className="app-container">
      <Header />
      <div className="container">
        <MapComponent ref={mapComponentRef} />
        <input id="guess" type="text" placeholder="Enter province name..." />    
        <button onClick={handleButtonClick}>
          Guess
        </button>
      </div>  
    </div>
  );
};

export default App;