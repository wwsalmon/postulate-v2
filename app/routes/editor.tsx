import ReactKatex from "react-katex";
import SlateEditor from "../../slate/SlateEditor";

export default function Editor() {

    return (
        <>
            <SlateEditor/>
            <ReactKatex.BlockMath math="\\frac{1}{2}"/>
        </>
    )
}