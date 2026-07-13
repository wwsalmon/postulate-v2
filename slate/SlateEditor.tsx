import { useCallback, useState } from "react";
import {createEditor, Node, type BaseEditor, type Descendant, Text, Element as SlateElement} from "slate";
import {Editable, ReactEditor, Slate, withReact, type RenderElementProps, type RenderLeafProps} from "slate-react";
import {withHistory} from "slate-history";
import withLinks, { SlateLinkBalloon } from "./withLinks";
import { withShortcuts } from "./withShortcuts";
import { onHotkey } from "./onHotkey";
import { onTabList, withLists } from "./withList";
import { onEnter } from "./onEnter";
import withDeserializeMD from "./withDeserializeMD";
import { withCodeblocks } from "./withCodeblocks";
import withTex, { BlockTex, InlineTex } from "./withTex";

const initialValue: Node[] & Descendant[] = [
    {
        type: 'p',
        children: [{ text: 'A line of text in a paragraph.' }],
    },
];

// leaving out withImages
export const customSlateEditorFactory = () => 
    withTex(
        withLists(
            withCodeblocks(
                withLinks(
                    withShortcuts(
                        withDeserializeMD(
                            withHistory(
                                withReact(createEditor() as ReactEditor)
                            )
                        )
                    )
                )
            )
        )
    );

export default function SlateEditor() {
    const [editor] = useState(customSlateEditorFactory());
    const [value, setValue] = useState<Node[]>(initialValue);
    const renderElement = useCallback((props: RenderElementProps) => <Element {...props} />, []);
    const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, []);

    console.log(value);

    return (
        <div className="prose" style={{fontSize: 20}}>
            <Slate editor={editor} value={initialValue} onChange={value => setValue(value)}>
                <Editable
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    placeholder="Capture your thoughts"
                    spellCheck
                    autoFocus
                    onKeyDown={event => {
                        onTabList(event, editor);
                        onHotkey(event, editor);
                        onEnter(event, editor);
                    }}
                ></Editable>
                <SlateLinkBalloon/>
            </Slate>
        </div>
    )
}

export const getPlainTextFromSlateValue = (value: Node[]) => value.map(node => getPlainTextFromSlateNode(node)).join("\n");

const getPlainTextFromSlateNode = (node: Node): string => {
    if (Text.isText(node)) return node.text;
    if (SlateElement.isElement(node)) return getPlainTextFromSlateValue(node.children);
    return "";
}

const Element = ({attributes, children, element}: RenderElementProps) => {
    switch (element.type) {
        case "blockquote":
            return <blockquote {...attributes}>{children}</blockquote>;
        case "ul":
            return <ul {...attributes}>{children}</ul>;
        case "h1":
            return <h1 {...attributes}>{children}</h1>;
        case "h2":
            return <h2 {...attributes}>{children}</h2>;
        case "h3":
            return <h3 {...attributes}>{children}</h3>;
        case "h4":
            return <h4 {...attributes}>{children}</h4>;
        case "li":
            return <li {...attributes}>{children}</li>;
        case "ol":
            return <ol {...attributes}>{children}</ol>;
        case "a":
            return <a {...attributes} href={element.url}>{children}</a>;
        case "codeblock":
            return <pre {...attributes}><code>{children}</code></pre>;
        case "inlineTex":
            return <InlineTex attributes={attributes} element={element}>{children}</InlineTex>;
        case "blockTex":
            return <BlockTex attributes={attributes} element={element}>{children}</BlockTex>;
        // case "img":
        //     return <Image attributes={attributes} element={element}>{children}</Image>;
        default:
            return <p {...attributes}>{children}</p>;
    }
};

const Leaf = ({attributes, children, leaf}: RenderLeafProps) => {
    if ("bold" in leaf && leaf.bold) {
        children = <strong>{children}</strong>;
    }

    if ("code" in leaf && leaf.code) {
        children = <code>{children}</code>;
    }

    if ("italic" in leaf && leaf.italic) {
        children = <em>{children}</em>;
    }

    if ("underline" in leaf && leaf.underline) {
        children = <u>{children}</u>;
    }

    return <span {...attributes}>{children}</span>;
};