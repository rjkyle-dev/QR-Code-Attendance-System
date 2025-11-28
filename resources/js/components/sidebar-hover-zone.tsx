import React from 'react';

interface SidebarHoverZoneProps {
    show: boolean;
    onMouseEnter: React.MouseEventHandler<HTMLDivElement>;
    className?: string;
    style?: React.CSSProperties;
}

const SidebarHoverZone: React.FC<SidebarHoverZoneProps> = ({ show, onMouseEnter, className = '', style }) => {
    if (!show) return null;
    return (
        <div
            className={`fixed top-0 left-0 z-40 h-full w-4 bg-transparent ${className}`}
            style={style}
            onMouseEnter={onMouseEnter}
            title="Hover to expand sidebar"
        />
    );
};

export default SidebarHoverZone;
