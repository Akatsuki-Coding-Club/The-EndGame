import { ToastContainer, toast as toastifyToast, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React from 'react';

// Custom Toast Styles override can go into index.css or here via styling

type CustomToastOptions = {
    description?: string;
    duration?: number;
};

const renderMessage = (type: string, message: string, description?: string) => {
    const titleColor = type === 'success' ? 'text-green-500' : type === 'error' ? 'text-red-500' : type === 'info' ? 'text-blue-500' : 'text-gray-400';
    return (
        <div className="flex flex-col gap-1 items-start justify-center pl-2">
            <span className={`text-[12px] md:text-[13px] font-black tracking-[0.2em] uppercase leading-tight ${titleColor} drop-shadow-[0_0_8px_currentColor]`}>{message}</span>
            {description && <span className="text-[10px] md:text-[11px] text-white/70 font-mono tracking-widest uppercase leading-snug">{description}</span>}
        </div>
    );
};

const getThemeClass = (type: string) => {
    switch (type) {
        case 'success':
            return 'bg-[#050508] border-y border-r border-y-white/5 border-r-white/5 border-l-[4px] border-l-green-600 shadow-[0_4px_30px_rgba(22,163,74,0.15)]';
        case 'error':
            return 'bg-[#050508] border-y border-r border-y-white/5 border-r-white/5 border-l-[4px] border-l-red-600 shadow-[0_4px_30px_rgba(220,38,38,0.15)]';
        case 'info':
            return 'bg-[#050508] border-y border-r border-y-white/5 border-r-white/5 border-l-[4px] border-l-blue-600 shadow-[0_4px_30px_rgba(37,99,235,0.15)]';
        default:
            return 'bg-[#050508] border-y border-r border-y-white/5 border-r-white/5 border-l-[4px] border-l-gray-600 shadow-[0_4px_30px_rgba(75,85,99,0.15)]';
    }
};

const createToast = (type: 'success' | 'error' | 'info' | 'default', message: string, options?: CustomToastOptions) => {
    const autoClose = options?.duration ?? 2500;
    const content = renderMessage(type, message, options?.description);

    const toastOptions: ToastOptions = {
        autoClose,
        className: `!rounded-md !p-3 !min-h-0 backdrop-blur-md ${getThemeClass(type)}`,
        closeButton: true,
        icon: false, // Turn off default icons to save space and match the techy theme
    };

    if (type === 'success') {
        return toastifyToast.success(content, toastOptions);
    }
    if (type === 'error') {
        return toastifyToast.error(content, toastOptions);
    }
    if (type === 'info') {
        return toastifyToast.info(content, toastOptions);
    }
    return toastifyToast(content, toastOptions);
};

export const customToast = Object.assign(
    (message: string, options?: CustomToastOptions) => createToast('default', message, options),
    {
        success: (message: string, options?: CustomToastOptions) => createToast('success', message, options),
        error: (message: string, options?: CustomToastOptions) => createToast('error', message, options),
        info: (message: string, options?: CustomToastOptions) => createToast('info', message, options),
        dismiss: () => toastifyToast.dismiss(),
    }
);

// We define a wrapper for ToastContainer so it can be cleanly imported into App.tsx
export const AppToastContainer = () => {
    return (
        <ToastContainer
            stacked
            position="top-right"
            autoClose={2500}
            hideProgressBar
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss={false}
            draggable
            pauseOnHover
            toastClassName="relative flex !p-0 !min-h-0 !mb-[5px] justify-between overflow-hidden cursor-pointer w-auto"
            className="!w-auto sm:min-w-[320px] max-w-[90vw]"
            style={{
                top: '72px', // Below the 64px navbar, plus 8px gap
                right: '8px', // Little margin on the right side
                zIndex: 100000,
            }}
        />
    );
};
