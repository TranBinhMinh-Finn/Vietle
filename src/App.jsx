import Game from "./Game"
import './App.css';
import { ToastProvider } from "./components/Toast";
import Header from "./components/Header";
import { useState } from "react";
import HelpModal from "./components/HelpModal";
import GameResultModal from "./components/GameResultModal";
import { GameModes } from "./utils";
import ModeSelectModal from "./components/ModeSelectModal";

const App = () => {

    const [showHelp, setShowHelp] = useState(false);
    const [challenge, setChallenge] = useState(null);
    const [result, setResult] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [gameMode, setGameMode] = useState(GameModes.DAILY);
    const [showModeSelect, setShowModeSelect] = useState(false);

    const showGameResult = (challenge, result) => {
      setChallenge(challenge);
      setResult(result);
      setShowResult(true);
    }

    const showGameModeModal = () => {
      /*
      var newGameMode;
      if(gameMode == GameModes.DAILY)
        newGameMode = GameModes.PRACTICE;
      else
        newGameMode = GameModes.DAILY;
      setGameMode(newGameMode);*/
    }

    return (
      <>
        <Header
            showHelpModal={()=> setShowHelp(true)}
            showGameModeModal={() => setShowModeSelect(true)}
            gameMode={gameMode}
        />

        <HelpModal
            isOpen={showHelp}
            onClose={() => setShowHelp(false)}
          />
        
        <ModeSelectModal
          isOpen={showModeSelect}
          onClose={() => setShowModeSelect(false)}
          setGameMode={setGameMode}
          currentGameMode={gameMode}
        />
        <GameResultModal
            isOpen={showResult}
            onClose={() => setShowResult(false)}
            challenge={challenge}
            result={result}
        />

        <ToastProvider>
          <div className="box-border bg-[#181a1b]
                    max-w-full h-screen flex flex-col">
          <Game 
            gameMode={gameMode}
            showResult={showGameResult}/>
          </div>
        </ToastProvider>
      </>
      
    );
}

export default App;