import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-xl border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500/25 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:focus:border-violet-500 dark:focus:ring-violet-500/25 ' +
                className
            }
            ref={localRef}
        />
    );
});
