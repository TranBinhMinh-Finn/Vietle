import Modal from "./Modal";

const HelpModal = ({isOpen, onClose}) => {
    const title = "Hướng dẫn";

    return (
        <Modal
            title={title}
            isOpen={isOpen}
            onClose={onClose}
        >
            <div>
                <div>Nhập tên các tỉnh cần đi qua để đi từ tỉnh bắt đầu đến tỉnh kết thúc bằng đường bộ. 
                    Số lần đoán sẽ có giới hạn, nên hãy tìm đường đi với ít tỉnh nhất có thể.</div>
            </div>
        </Modal>
    )
}

export default HelpModal; 