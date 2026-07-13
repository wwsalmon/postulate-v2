import {Editor, Element, Node, Point, Range, Transforms} from "slate";
import type { CustomEditor, CustomElement } from "./slate";
import { useFocused, useSelected } from "slate-react";
import type { ReactNode } from "react";
import ReactKatex from "react-katex";
// import {BlockMath, InlineMath} from "react-katex";
const {BlockMath, InlineMath} = ReactKatex;

const withTex = (editor: CustomEditor) => {
    const {insertText, isInline, normalizeNode, deleteBackward} = editor;

    editor.deleteBackward = (unit) => {
        const block = Editor.above(editor, {
            match: n => Editor.isBlock(editor, n),
        });

        if (!block?.length || !editor.selection) return;

        if (Element.isElement(block[0]) && block[0].type !== "inlineTex") {
            const thisLeaf = Editor.leaf(editor, editor.selection.anchor.path);
            const thisText = thisLeaf[0].text;

            if (thisText === "  ") {
                Transforms.removeNodes(editor, {at: thisLeaf[1].slice(0, thisLeaf[1].length - 1)});
                return;
            }
        }

        deleteBackward(unit);
    }

    editor.isInline = (element) => {
        return element.type === "inlineTex" || isInline(element);
    }

    editor.insertText = (text) => {
        if (!editor.selection) return;
        const selection = editor.selection;
        const anchor = selection.anchor;
        const {path, offset} = anchor;

        if (offset > 0 && selection && Range.isCollapsed(selection)) {
            if (text === "$") {
                const block = Editor.above(editor, {mode: "lowest"});

                if (!block?.length) return;

                if (Element.isElement(block[0]) && (block[0].type === "blockTex" || block[0].type === "codeblock")) return insertText(text);

                if (Element.isElement(block[0]) && block[0].type === "inlineTex") {
                    insertText(" ");
                    Transforms.splitNodes(editor);
                    Editor.deleteBackward(editor);
                    Editor.deleteForward(editor);
                    return;
                }

                const beforeText = Editor.string(editor, {anchor, focus: {path: path, offset: 0}});

                if (beforeText.includes("$")) {
                    const markerIndex = beforeText.lastIndexOf("$");
                    const latexString = beforeText.substring(markerIndex + 1);

                    if (latexString) {
                        Transforms.select(editor, {anchor, focus: {path: path, offset: markerIndex}});
                        Editor.deleteBackward(editor);
                        Transforms.insertNodes(editor, [{type: "inlineTex", children: [{text: latexString}]}]);
                        const {anchor: newAnchor} = editor.selection;
                        const {path: newPath, offset: newOffset} = newAnchor;
                        Transforms.select(editor, {path: newPath, offset: newOffset + 1});
                        return;
                    }
                }
            }

            else if (text === " ") {
                const beforeText = Editor.string(editor, {anchor, focus: {path: path, offset: offset - 1}});
                const twoBeforeText = offset > 1 ? Editor.string(editor, {
                    anchor: {path: path, offset: offset - 1},
                    focus: {path: path, offset: offset - 2}
                }) : null;

                if (beforeText === "$" && twoBeforeText !== "$") {
                    const block = Editor.above(editor, {
                        match: n => Editor.isBlock(editor, n),
                        mode: "lowest",
                    });

                    if (!block?.length) return;

                    if (Element.isElement(block[0]) && block[0].type !== "inlineTex" && block[0].type !== "blockTex" && block[0].type !== "codeblock") {
                        Transforms.select(editor, {anchor, focus: {path: path, offset: offset - 1}});
                        Transforms.delete(editor);
                        Transforms.insertNodes(editor, [{type: "inlineTex", children: [{text: "  "}]}]);
                        const thisPoint = {path: editor.selection.anchor.path, offset: 1};
                        Transforms.select(editor, {anchor: thisPoint, focus: thisPoint});

                        return;
                    }
                }
            }
        }

        insertText(text);
    }

    editor.normalizeNode = (entry) => {
        if (Element.isElement(entry[0]) && entry[0].type === "inlineTex") {
            if (!editor.selection) return;
            const thisLeaf = Editor.leaf(editor, editor.selection.anchor.path);
            const thisText = thisLeaf[0].text;

            if (thisText.charAt(0) !== " ") {
                Transforms.insertText(editor, " ", {at: {path: thisLeaf[1], offset: 0}});
                const thisPoint = {path: thisLeaf[1], offset: 1};
                Transforms.select(editor, thisPoint);
                return;
            }

            if (thisText.charAt(Math.max(thisText.length - 1, 1)) !== " ") {
                Transforms.insertText(editor, " ", {at: {path: thisLeaf[1], offset: thisText.length}});
                const thisPoint = {path: thisLeaf[1], offset: thisText.length};
                Transforms.select(editor, thisPoint);
                return;
            }
        }

        normalizeNode(entry);
    }

    return editor;
};

export default withTex;

export function BlockTex({
                                      attributes,
                                      children,
                                      element
                                  }: { attributes: any, children: ReactNode, element: CustomElement }) {
    const focused = useFocused();
    const selected = useSelected();
    const showSource = focused && selected;

    const math = Node.string(element);

    const isEmpty = math === "";

    let divProps = {
        ...attributes,
        className: "relative px-1 " + (showSource ? "border border-gray-300 py-2 " : "overflow-x-auto "),
    };

    return (
        <div {...divProps}>
            <div className={"font-mono text-sm text-center " + (showSource ? "" : "absolute top-1/2 left-0 -translate-y-1/2 w-full opacity-0")}>
                {children}
                {showSource && (
                    <div
                        contentEditable={false}
                        className="absolute pointer-events-none bg-gray-100 top-0 border border-gray-300 font-bold"
                        style={{fontSize: 8, paddingLeft: 2, paddingRight: 2, transform: "translateY(-100%)", left: -1}}
                    >
                        <span>LaTeX</span>
                    </div>
                )}
            </div>
            {!showSource && (
                <div className={"pointer-events-none " + (isEmpty ? "opacity-25" : "")} contentEditable={false}>
                    <BlockMath>{isEmpty ? "\\LaTeX" : math}</BlockMath>
                    {/* <BlockMath math="\frac{1}{2}"/> */}
                </div>
            )}
        </div>
    );
}

export function InlineTex({
                                      attributes,
                                      children,
                                      element
                                  }: { attributes: any, children: ReactNode, element: CustomElement }) {
    const focused = useFocused();
    const selected = useSelected();
    const showSource = focused && selected;

    const math = Node.string(element);

    let divProps = {
        ...attributes,
        className: "relative inline px-1 " + (showSource ? "border border-gray-300 py-2" : ""),
    };

    const isEmpty = math === "  ";

    return (
        <div {...divProps}>
            <span className={"font-mono text-sm " + (showSource ? "" : "text-center absolute top-1/2 left-0 -translate-y-1/2 w-full opacity-0")}>
                {children}
                {showSource && (
                    <div
                        contentEditable={false}
                        className="absolute select-none bg-gray-100 top-0 border border-gray-300 font-bold"
                        style={{fontSize: 8, paddingLeft: 2, paddingRight: 2, transform: "translateY(-100%)", left: -1}}
                    >
                        <span>LaTeX</span>
                    </div>
                )}
            </span>
            {!showSource && (
                <span contentEditable={false} className={"pointer-events-none " + (isEmpty ? "opacity-25" : "")}>
                    <InlineMath math={isEmpty ? "\\LaTeX" : math}/>
                </span>
            )}
        </div>
    );
}