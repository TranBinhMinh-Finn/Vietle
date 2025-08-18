import { CircleQuestionMark } from "lucide-react";

const Header = ({showHelpModal}) => {

    return (
        <header className="sticky top-0 z-50 border-b-1 border-[#3b4043] bg-[#191a1a] flex justify-between">
        <div className="max-w-7xl px-4 ">
          <div className="flex items-center py-3">
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-bold">Vietle</span>
            </div>
          </div>
        </div>

        <div className="px-4 flex items-center">
          <button
              onClick={() => {showHelpModal()}}
              className="text-white hover:text-gray-300 transition-colors flex-shrink-0 p-1 -m-1"
              aria-label="Close notification"
            ><CircleQuestionMark size={20} /></button>
        </div>
        
      </header>
    )
}

export default Header;