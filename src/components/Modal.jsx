import {X} from 'lucide-react'

const Modal = ({title, children, onClose, isOpen = false}) => {
    
    if(!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
            <div 
                className="absolute inset-0 bg-black opacity-50 transition-opacity duration-300"
                onClick={onClose}
            />

            <div className="relative bg-[#181a1b] rounded-lg shadow-2xl max-w-md w-full mx-4">
                <div className="flex items-center justify-between p-6 border-b border-[#3b4043]">
                <h2 className="text-xl font-bold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-400 transition-colors duration-200"
                    >
                        <X size={24} />
                    </button>   
                </div>

                <div className="p-6">
                    {children}
                </div>
            </div>
            
            
            
        </div>
    );
}

export default Modal;