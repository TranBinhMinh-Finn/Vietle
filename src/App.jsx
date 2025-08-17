import Game from "./Game"
import './App.css';
import { ToastProvider } from "./components/Toast";
import Header from "./components/Header";

const App = () => {

    return (
      <ToastProvider>
        <Header/>
        <div className="box-border bg-[#181a1b]
                  max-w-full h-screen flex flex-col">
        <Game/>
        </div>
      </ToastProvider>
      
    );
}

export default App;