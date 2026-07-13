import { type KeyboardEvent } from "react";
import { Node, Text, Transforms } from "slate";
import type { CustomEditor } from "./slate";
import { insertEmptyLine, onEnterList } from "./withList";

export const onEnter = (e: KeyboardEvent<HTMLDivElement>, editor: CustomEditor) => {
    if (e.key !== "Enter") return false;
    e.preventDefault();
    if (e.shiftKey) {
        editor.insertText("\n");
    } else {
        if (onEnterList(editor)) return true;

        if (!editor.selection) return false;

        const selectedLeaf = Node.descendant(editor, editor.selection.anchor.path);

        if (Text.isText(selectedLeaf) && [selectedLeaf.text.length, 0].includes(editor.selection.anchor.offset)) {
            insertEmptyLine(editor);

            if ([0, editor.children.length - 2].includes(editor.selection.anchor.path[0])) {
                Transforms.select(editor, {
                    path: [editor.selection.anchor.path[0] + 1, 0],
                    offset: 0,
                });
            }
        } else {
            Transforms.splitNodes(editor);
            Transforms.setNodes(editor, {type: "p"});
        }
    }
    return true;
};