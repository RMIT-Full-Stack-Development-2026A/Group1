import { useEffect, useRef } from "react";

const FOCUSABLE =
    'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Dialog behavior for modals and overlays: moves focus inside when it opens, keeps Tab and Shift+Tab
 * cycling within the dialog, closes on Escape, and returns focus to the element that opened it.
 *
 * Attach the returned ref to the dialog root (give it tabIndex={-1} so it can take focus itself).
 *
 * @param {{ active: boolean, onClose?: () => void }} options - `onClose` omitted means Escape does nothing.
 */
export function useDialogA11y({ active, onClose }) {
    const ref = useRef(null);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    });

    useEffect(() => {
        if (!active) return undefined;
        const node = ref.current;
        if (!node) return undefined;

        const previouslyFocused = document.activeElement;
        const focusables = () =>
            [...node.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);

        (focusables()[0] ?? node).focus({ preventScroll: true });

        const onKeyDown = (event) => {
            if (event.key === "Escape" && onCloseRef.current) {
                event.stopPropagation();
                onCloseRef.current();
                return;
            }
            if (event.key !== "Tab") return;

            const items = focusables();
            if (items.length === 0) {
                event.preventDefault();
                node.focus();
                return;
            }
            const first = items[0];
            const last = items[items.length - 1];
            const current = document.activeElement;

            if (event.shiftKey && (current === first || current === node)) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && current === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            if (previouslyFocused && typeof previouslyFocused.focus === "function") {
                previouslyFocused.focus({ preventScroll: true });
            }
        };
    }, [active]);

    return ref;
}
