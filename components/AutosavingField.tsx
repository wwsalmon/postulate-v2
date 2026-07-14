import {type Dispatch, type SetStateAction, useCallback, useEffect, useState, type HTMLProps} from "react";
import {useAutosave} from "react-autosave";
import {Node} from "slate";

export default function AutosavingField({prevValue, onSubmitEdit, setStatus, ...domProps}: HTMLProps<HTMLInputElement> & {
    prevValue: string,
    onSubmitEdit: (value: string) => Promise<any>,
    setStatus?: Dispatch<SetStateAction<string>>,
}) {
    const [value, setValue] = useState<string>(prevValue);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (setStatus) setStatus(getStatus(isLoading, value, prevValue));
    }, [value, prevValue, isLoading]);

    useAutosave({
        data: value, onSave: useCallback((value: string) => {
            if (!isLoading) {
                setIsLoading(true);

                onSubmitEdit(value).then(() => setIsLoading(false));
            }
        }, []), interval: 1000
    });

    return (
        <>
            <input type="text" {...domProps} value={value} onChange={e => setValue(e.target.value)}/>
            <p className="text-sm mt-3">{getStatus(isLoading, value, prevValue)}</p>
        </>
    )
}

const getStatus = (isLoading: boolean, value: string, prevValue: string) => isLoading ? "Saving..." : value === prevValue ? "Saved" : "Unsaved changes";