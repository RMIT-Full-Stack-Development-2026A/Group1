import React from 'react';

export const MarkerX = ({ variantData, className }) => {
    // Kẹp thêm màu và glow vào class chung
    const combinedClass = `${variantData?.xColor || ''} ${variantData?.xGlow || ''} ${variantData?.animation || ''} ${className}`;

    if (variantData?.id === "PIXEL" || variantData?.id === "MINIMAL") {
        return (
            <svg className={combinedClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                {variantData.id === "PIXEL" 
                    // PIXEL X: 5 khối vuông ghép lại thành hình chữ X cực sắc nét
                    ? <path d="M4 4h5v5H4V4zm11 0h5v5h-5V4zM9 9h6v6H9V9zm-5 6h5v5H4v-5zm11 0h5v5h-5v-5z" fill="currentColor" stroke="none"/> 
                    // MINIMAL X: Hai đường chéo chéo nhau
                    : <path d="M18 6L6 18M6 6l12 12" />
                }
            </svg>
        );
    }

    return <span className={`font-headline leading-none ${combinedClass}`}>X</span>;
};

export const MarkerO = ({ variantData, className }) => {
    // Kẹp thêm màu và glow vào class chung
    const combinedClass = `${variantData?.oColor || ''} ${variantData?.oGlow || ''} ${className}`;

    if (variantData?.id === "MINIMAL" || variantData?.id === "PIXEL") {
        return (
            <svg className={combinedClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                {variantData.id === "PIXEL"
                    // PIXEL O: Hình vuông có đục lỗ ở giữa (nhờ fillRule="evenodd")
                    ? <path fillRule="evenodd" clipRule="evenodd" d="M4 4h16v16H4V4zm4 4v8h8V8H8z" fill="currentColor" stroke="none" />
                    // MINIMAL O: Hình tròn trơn
                    : <circle cx="12" cy="12" r="9" />
                }
            </svg>
        );
    }

    return <span className={`font-headline leading-none ${combinedClass}`}>O</span>;
};