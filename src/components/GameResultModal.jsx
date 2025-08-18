import Modal from "./Modal";
import { HeartCrack } from "lucide-react";

const GameResultModal = ({challenge, result, isOpen, onClose}) => {
    const playerWon = result?.playerWon;
    const title = playerWon ? "Thành công!" : "Thất bại...";
    const guessesCount = result?.guessesCount;
    const startName = challenge?.startName;
    const endName = challenge?.endName;
    const optimalPath = challenge?.optimalPath;
    const optimalGuesses = optimalPath?.length - 2;
    
    return (
        <Modal
            title={title}
            isOpen={isOpen}
            onClose={onClose}
            className={`border-t-4 ${playerWon?`border-[#61bd6c]`:`border-[#e05c56]`}`}
        >
            {
                playerWon ? (
                <div>
                    Chúc mừng! Bạn đã kết nối <strong style={{color: '#61bd6c'}}>{startName}
                    </strong> đến <strong style={{color: '#e05c56'}}>{endName}
                        </strong> trong <strong>{guessesCount}</strong> lần đoán.
                </div>
            ) : (
                <div>
                    Tiếc quá 😔... Chúc bạn may mắn lần sau. 
                </div>
            )
            }
            
            
            {/*the optimal path was...*/}
            <div className="mt-5">
                <div>
                    Số lần đoán ít nhất có thể là <strong>{optimalGuesses}</strong>. Đường đi ngắn nhất là: 
                </div>
                <div>
                    {optimalPath?.join(' ➡️ ')} 
                </div>
                
            </div>
            
        </Modal>
    );
}

export default GameResultModal;