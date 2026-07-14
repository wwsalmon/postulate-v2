import { type Dispatch, type SetStateAction, useCallback, useEffect, useState } from "react";
import { useAutosave } from "react-autosave";
import SlateEditor from "./SlateEditor";
import { Node, type Descendant } from "slate";
import equal from "deep-equal";

export default function AutosavingEditor({ prevValue, onSubmitEdit, setStatus, hideStatus, projectId }: { prevValue: Descendant[], onSubmitEdit: (value: Descendant[]) => Promise<any>, setStatus?: Dispatch<SetStateAction<string>>, hideStatus?: boolean, projectId: string }) {
    const [value, setValue] = useState<Descendant[]>(prevValue);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (setStatus) setStatus(getStatus(isLoading, value, prevValue));
    }, [value, prevValue, isLoading]);

    useAutosave({
        data: value, onSave: useCallback((value: Descendant[]) => {
            if (!isLoading) {
                setIsLoading(true);

                onSubmitEdit(value).then(() => setIsLoading(false));
            }
        }, []), interval: 1000
    });

    return (
        <>
            <SlateEditor initialValue={value} setValue={setValue} projectId={projectId} />
            {!hideStatus && (
                <p className="text-sm mt-3">{getStatus(isLoading, value, prevValue)}</p>
            )}
        </>
    )
}

export const getStatus = (isLoading: boolean, value: Node[] | string, prevValue: Node[] | string) => isLoading ? "Saving..." : equal(value, prevValue) ? "Saved" : "Unsaved changes"