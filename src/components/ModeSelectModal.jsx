import { GameModes } from "../utils";
import { useState } from "react";
import Modal from "./Modal"
import {Calendar, Dumbbell} from 'lucide-react'

const ModeSelectModal = ({currentGameMode, setGameMode, isOpen, onClose}) => {
    const title = "Chọn chế độ chơi";
    const [selectedMode, setSelectedMode] = useState(currentGameMode);

    const onConfirm = () => {
        setGameMode(selectedMode);
        onClose();
    }
    return (
        <Modal title={title}
            isOpen={isOpen}
            onClose={onClose}>
            <div className="flex justify-evenly gap-2">
                <div 
                    onClick={() => setSelectedMode(GameModes.DAILY)}
                    className={`flex flex-col align-middle justify-center items-center rounded-lg border-2 p-4 grow w-96 h-60 text-center
                    ${selectedMode == GameModes.DAILY ? `border-[#61bd6c]` : `border-[#3b4043]`}`}>
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center ${selectedMode == GameModes.DAILY ? `bg-[#61bd6c]`:`bg-[#3b4043]`}`}>
                        <Calendar className="w-6 h-6 inline-block"/>
                    </div>
                    <div className="mt-4 font-bold">Thử thách hàng ngày</div>
                    
                    
                    <div className="text-sm">Giải thử thách Vietle của ngày hôm nay.</div>
                </div>
                <div 
                    onClick={() => setSelectedMode(GameModes.PRACTICE)}
                    className={`flex flex-col align-middle justify-center items-center rounded-lg border-2 p-4 grow w-96 h-60 text-center
                    ${selectedMode == GameModes.PRACTICE ? `border-[#61bd6c]` : `border-[#3b4043]`}`}>
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center ${selectedMode == GameModes.PRACTICE ? `bg-[#61bd6c]`:`bg-[#3b4043]`}`}>
                        <Dumbbell className="w-6 h-6 inline-block"/>
                    </div>
                    <div className="mt-4 font-bold">Luyện tập</div>
                    
                    <div className="text-sm">Luyện tập với các thử thách ngẫu nhiên không giới hạn.</div>
                </div>
            </div>

            <div className="flex-col justify-evenly gap-1 mt-4">
                <button 
                        onClick={() => onConfirm()}
                        className="text-center bg-[#141516] border-[#3b4043] border-2
                        px-3 py-2 text-sm font-medium items-center rounded-md w-full"> 
                    Xác nhận
                </button>
                <button 
                        onClick={() => onClose()}
                        className="text-center border-[#3b4043] border-2
                        px-3 py-2 text-sm mt-1 font-medium items-center rounded-md w-full"> 
                    Hủy
                </button>
                    
                    
            </div>
            
        </Modal>
    )
}

export default ModeSelectModal;