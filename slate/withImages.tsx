import type {CustomEditor, CustomElement} from "./slate";
import {insertNodesAndClearEmpty} from "./withDeserializeMD";
import {type ReactNode} from "react";
import {useFocused, useSelected} from "slate-react";
import {Element, Node} from "slate";
import { createBrowserClient, POCKETBASE_API_URL } from "~/pocketbase";

const withImages = (editor: CustomEditor, projectId: string) => {
    const {insertData, isVoid} = editor;

    const pb = createBrowserClient();

    editor.isVoid = (element: CustomElement) => element.type === "img" || isVoid(element);

    // largely from https://github.com/ianstormtaylor/slate/blob/main/site/examples/images.tsx
    editor.insertData = (data) => {
        const {files} = data;

        if (files && files.length) {
            const file = files[0];
            const [mime] = file.type.split("/");

            if (mime === "image") {
                // if greater than 2 MB
                if ((file.size / 1024 / 1024) > 2) {
                    return window.alert("Maximum allowed filesize is 2MB");
                }

                if (!pb.authStore.record) return window.alert("Cannot upload image, not authenticated");

                // const projectId = "6be7z348qe11enn";
                
                pb.collection("files").create({
                    file: file,
                    user: pb.authStore.record.id,
                    project: projectId, // test
                }).then(record => {
                    const url = `${POCKETBASE_API_URL}/api/files/files/${record.id}/${record.file}`;
                    insertImage(editor, url);
                }).catch(e => {
                    return window.alert(`Error inserting image: ${e}`);
                });
            }
        }

        insertData(data);
    };

    return editor;
};

const insertImage = (editor: CustomEditor, url: string) => {
    // console.log("inserting image");

    const text = {text: ""};
    const image = {type: "img", url, children: [text]};
    insertNodesAndClearEmpty(editor, image);
};

export function Image({
                                      attributes,
                                      children,
                                      element
                                  }: { attributes: any, children: ReactNode, element: CustomElement }) {
    const focused = useFocused();
    const selected = useSelected();
    const showOutline = focused && selected;

    return (
        <div {...attributes}>
            <div contentEditable={false}>
                <img src={element.url} className={showOutline ? "border-2 border-blue-500" : ""}/>
            </div>
            {children}
        </div>
    );
}

export const findImages = (nodes: Node[]): string[] => {
    let images = [];
    for (let node of nodes) {
        if (!Element.isElement(node)) continue;
        if (node.type === "img" && node.url) images.push(node.url);
        if (node.children) images.push(...findImages(node.children));
    }
    return images;
}

export default withImages;