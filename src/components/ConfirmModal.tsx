import React from "react";
import "../styles/confirm-modal.css";
import stoneImage from "../assets/stone.png"; // Добавляем импорт иконки

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
    itemType: "boost" | "skin";
    cost: number;
    level?: number;
    count?: number;
    icon: string;
    description: string;
    bonus?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
                                                       isOpen,
                                                       onClose,
                                                       onConfirm,
                                                       itemName,
                                                       itemType,
                                                       cost,
                                                       level,
                                                       count,
                                                       icon,
                                                       description,
                                                       bonus,
                                                   }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <img src={icon} alt={itemName} className="modal-icon" />
                <h2 className="modal-title">{itemName}</h2>
                <p className="modal-description">{description}</p>
                {bonus && <p className="modal-bonus">{bonus}</p>}
                <div className="modal-cost">
                    <img src={stoneImage} alt="Stone" className="modal-cost-icon" /> {/* Заменяем эмодзи на иконку */}
                    <span className="modal-cost-text">
                        {cost.toLocaleString()}
                        {itemType === "boost" && level !== undefined ? ` • Level ${level}` : ""}
                        {itemType === "boost" && count !== undefined ? ` • ${count}/3` : ""}
                    </span>
                </div>
                <button className="modal-confirm-button" onClick={onConfirm}>
                    Get
                </button>
            </div>
        </div>
    );
};

export default ConfirmModal;