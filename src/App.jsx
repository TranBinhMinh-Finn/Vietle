import Game from "./Game"
import './App.css';
import { ToastProvider } from "./components/Toast";
import Header from "./components/Header";
import { useState } from "react";
import HelpModal from "./components/HelpModal";

const App = () => {

    const [showHelp, setShowHelp] = useState(true);

    return (
      <>
        <HelpModal
            isOpen={showHelp}
            onClose={() => setShowHelp(false)}
          ></HelpModal>
        <ToastProvider>
          
          <Header
            showHelpModal={()=> setShowHelp(true)}
          />
          <div className="box-border bg-[#181a1b]
                    max-w-full h-screen flex flex-col">
          <Game/>
          </div>
        </ToastProvider>
      </>
      
    );
}

export default App;