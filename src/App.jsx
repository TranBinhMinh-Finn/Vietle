import Game from "./Game"
import './App.css';
import { ToastProvider } from "./components/Toast";
import Header from "./components/Header";
import { useState } from "react";
import HelpModal from "./components/HelpModal";
import GameResultModal from "./components/GameResultModal";

const App = () => {

    const [showHelp, setShowHelp] = useState(false);
    const [challenge, setChallenge] = useState(null);
    const [result, setResult] = useState(null);
    const [showResult, setShowResult] = useState(false);

    const showGameResult = (challenge, result) => {
      setChallenge(challenge);
      setResult(result);
      setShowResult(true);
    }
    return (
      <>
        <HelpModal
            isOpen={showHelp}
            onClose={() => setShowHelp(false)}
          />
        <ToastProvider>

        <GameResultModal
            isOpen={showResult}
            onClose={() => setShowResult(false)}
            challenge={challenge}
            result={result}
        />
          
          <Header
            showHelpModal={()=> setShowHelp(true)}
          />
          <div className="box-border bg-[#181a1b]
                    max-w-full h-screen flex flex-col">
          <Game showResult={showGameResult}/>
          </div>
        </ToastProvider>
      </>
      
    );
}

export default App;