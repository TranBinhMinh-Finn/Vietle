import { CircleQuestionMark, Calendar, Dumbbell, ChevronsUpDown} from "lucide-react";
import { GameModes } from "../utils";


const Header = ({gameMode, showGameModeModal, showHelpModal}) => {

  const getModeLabel = () => {
    return gameMode == GameModes.DAILY ? "Thử thách hàng ngày" : "Luyện tập";
  }

  const getModeIcon = () => {
    return gameMode == GameModes.DAILY ? (<Calendar size={12}/>) : (<Dumbbell size={12}/>);
  }

    return (
        <header className="sticky top-0 z-50 border-b-1 border-[#3b4043] bg-[#191a1a] flex justify-between">
        <div className="max-w-7xl px-4 ">
          <div className="flex items-center py-3">
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-bold">Vietle</span>
            </div>
            <button 
              onClick={() => showGameModeModal()}
              className="flex justify-between bg-[#141516] border-[#3b4043] border-2
              mx-4 px-3 py-2 text-sm font-medium items-center rounded-md w-54"> 
              <div className="flex justify-center items-center gap-2">
                {getModeIcon()}
                {getModeLabel()}
              </div>
              <ChevronsUpDown className="mr-2 ml-auto" size={15}/>
            </button>
          </div>
        </div>

        <div className="px-4 flex items-center">
          <button
              onClick={() => {showHelpModal()}}
              className="text-white hover:text-gray-300 flex-shrink-0 p-1 -m-1"
              aria-label="Close notification"
            ><CircleQuestionMark size={20} /></button>
        </div>
        
      </header>
    )
}

export default Header;