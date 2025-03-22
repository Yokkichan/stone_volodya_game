import React from "react";

interface Task {
    name: string;
    icon: string;
    reward: number;
    label: string;
    link: string;
}

interface TaskItemProps {
    task: Task;
    isLoading: boolean;
    isCompleted: boolean;
    onClick: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, isLoading, isCompleted, onClick }) => (
    <div
        className={`earn-task-item ${isLoading ? "loading" : ""} ${isCompleted ? "completed" : ""}`}
        onClick={!isCompleted && !isLoading ? onClick : undefined}
    >
        <img src={task.icon} alt={task.label} className="earn-task-icon" />
        <div className="earn-task-details">
            <span className="earn-task-text">{task.label}</span>
            <div className="earn-reward">
                <span className="earn-reward-icon">🪨</span>
                <span className="earn-text-xs">+{task.reward.toLocaleString()}</span>
            </div>
        </div>
        {isLoading && <span className="earn-task-status loading">Processing...</span>}
        {isCompleted && <span className="earn-task-status completed">✔</span>}
    </div>
);