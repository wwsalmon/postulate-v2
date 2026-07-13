import {Editor, Element, Element as SlateElement, Transforms} from "slate";
import {isHotkey} from "is-hotkey";
import {ReactEditor} from "slate-react";
import {HistoryEditor} from "slate-history";
import {insertLink} from "./withLinks";
import {isListNode} from "./withList";
import { type KeyboardEvent } from "react";
import type { CustomEditor } from "./slate";

const markHotkeys: {[key: string]: string} = {
    "mod+b": "bold",
    "mod+i": "italic",
    "mod+u": "underline",
    "mod+`": "code",
};

const blockHotkeys: {[key: string]: string} = {
    "mod+alt+1": "h1",
    "mod+alt+2": "h2",
    "mod+alt+3": "h3",
    "mod+alt+4": "h4",
};

const toggleMark = (editor: CustomEditor, format: string) => {
    const isActive = isMarkActive(editor, format);

    if (isActive) {
        Editor.removeMark(editor, format);
    } else {
        Editor.addMark(editor, format, true);
    }
};

const isMarkActive = (editor: CustomEditor, format: string) => {
    const marks = Editor.marks(editor);
    // @ts-ignore indexing problem
    return marks ? marks[format] === true : false;
};

const toggleBlock = (editor: CustomEditor, format: string) => {
    const isActive = isBlockActive(editor, format);
    const isList = isListNode(format);

    Transforms.unwrapNodes(editor, {
        match: n => Element.isElement(n) && isListNode(n.type),
        split: true,
    });
    const newProperties: Partial<SlateElement> = {
        type: isActive ? "" : isList ? "li" : format,
    };
    Transforms.setNodes(editor, newProperties);

    if (!isActive && isList) {
        const block = {type: format, children: []};
        Transforms.wrapNodes(editor, block);
    }
};

export const isBlockActive = (editor: CustomEditor, format: string) => {
    // @ts-ignore
    const [match] = Editor.nodes(editor, {
        match: n => Element.isElement(n) && n.type === format,
    });

    return !!match;
};

export const onHotkey = (e: KeyboardEvent, editor: ReactEditor & HistoryEditor) => {
    for (const hotkey in markHotkeys) {
        if (isHotkey(hotkey, e)) {
            e.preventDefault();
            const mark = markHotkeys[hotkey];
            toggleMark(editor, mark);
        }
    }

    for (const hotkey in blockHotkeys) {
        if (isHotkey(hotkey, e)) {
            e.preventDefault();
            const block = blockHotkeys[hotkey];
            toggleBlock(editor, block);
        }
    }

    if (isHotkey("mod+k", e)) {
        e.preventDefault();
        const url = window.prompt("Enter the URL of the link:");
        if (!url) return;
        insertLink(editor, url);
    }
}