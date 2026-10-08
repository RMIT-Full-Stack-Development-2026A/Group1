import toast from "react-hot-toast";

/**
 * Show a success toast.
 * @param {string} message - Message to display.
 * @param {import('react-hot-toast').ToastOptions} [options={}] - Toast options.
 * @returns {string}
 */
export const notifySuccess = (message, options = {}) => {
    return toast.success(message, options);
};

/**
 * Show an error toast.
 * @param {string} message - Message to display.
 * @param {import('react-hot-toast').ToastOptions} [options={}] - Toast options.
 * @returns {string}
 */
export const notifyError = (message, options = {}) => {
    return toast.error(message, {
        duration: options.duration ?? 6000,
        ...options,
    });
};

/**
 * Show a loading toast and return its toast id.
 * @param {string} message - Message to display.
 * @param {import('react-hot-toast').ToastOptions} [options={}] - Toast options.
 * @returns {string}
 */
export const notifyLoading = (message, options = {}) => {
    return toast.loading(message, options);
};

/**
 * Update an existing loading toast with a success or error state.
 * @param {string} toastId - Toast id returned by notifyLoading.
 * @param {'success' | 'error'} type - Toast type to apply.
 * @param {string} message - Message to display.
 * @returns {string}
 */
export const notifyUpdate = (toastId, type, message) => {
    return toast[type](message, { id: toastId });
};

