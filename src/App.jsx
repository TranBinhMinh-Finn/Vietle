import Game from "./Game"
import './App.css';

const App = () => {

    return (
      <div 
        className="box-border px-[min(50px, 5%)] bg-[#181a1b]
                  max-w-full max-h-[100vh]">
        <Game/>
      </div>
    );
}

export default App;