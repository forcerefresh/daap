import { Button, Checkbox, Classes, Dialog, Overlay } from "@blueprintjs/core";
import {
  AiProcessingStatus,
  AiPrompt,
  AiPromptStatus,
} from "../../types/ai-prompts";
import { useEffect, useState } from "react";
import { isEqual } from "lodash-es";
import { AITemplatePreview } from "../ai-template-preview/ai-template-preview";
import { updateLayout, updateTemplate } from "../../utils/update-layout-utils";

export const LayoutPromptListView = ({
  prompts,
  layout,
  title,
  parentPrompt,
  selectedColorPalette,
  imagePrompts,
  vectorPrompts,
}: // approvedImages,
// allowInstantReview,
// setImageProcessingStatus,
// onApply,
{
  title: string;
  layout: any;
  prompts: AiPrompt[];
  parentPrompt?: any;
  selectedColorPalette?: any;
  imagePrompts: any[];
  vectorPrompts: any[];
  // allowInstantReview?: boolean;
  // approvedImages: { [promptId: string]: boolean };
  // setImageProcessingStatus: (
  //   promptId: string,
  //   status: AiProcessingStatus
  // ) => void;
  // onApply: () => void;
}) => {
  useEffect(() => {
    console.log("onApply *********");
    // onApply();
  }, [prompts]);

  if (!prompts || prompts.length == 0) return null;

  return (
    <div>
      <h4>{title}</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          {/* <Button intent="primary" onClick={onApply}>
            Apply
          </Button> */}
        </div>
        {prompts.map((prompt, idx) => {
          if (prompt.status !== AiPromptStatus.DONE) {
            return null;
          }

          return (
            <LayoutWithReview
              prompt={prompt}
              key={prompt.id}
              layout={layout}
              parentPrompt={parentPrompt}
              selectedColorPalette={selectedColorPalette}
              imagePrompts={imagePrompts}
              vectorPrompts={vectorPrompts}
              // allowInstantReview={allowInstantReview}
              // src={"/api/v1/generator/image-review/image/" + prompt.id}
              // setImageStatus={(status) => {
              //   setImageProcessingStatus(
              //     prompt.id,
              //     status
              //       ? AiProcessingStatus.APPROVED
              //       : AiProcessingStatus.REJECTED
              //   );
              // }}
              // imageStatus={
              //   prompt.processingStatus === AiProcessingStatus.NOT_PROCESSED
              //     ? undefined
              //     : prompt.processingStatus === AiProcessingStatus.APPROVED
              // }
            />
          );
        })}
      </div>
    </div>
  );
};

function LayoutWithReview({
  // src,
  prompt,
  layout,
  parentPrompt,
  selectedColorPalette,
  imagePrompts,
  vectorPrompts,
}: // imageStatus,
// setImageStatus,
// allowInstantReview,
{
  // src: string;
  parentPrompt?: any;
  prompt?: any;
  layout?: any;
  selectedColorPalette?: any;
  imagePrompts: any[];
  vectorPrompts: any[];
  // imageStatus: boolean | undefined;
  // setImageStatus: (status: boolean | undefined) => void;
  // allowInstantReview?: boolean;
}) {
  const [enabled, setEnabled] = useState(false);
  // const [template, setTemplate] = useState();

  const template = updateLayout(layout, prompt.aiResponseJson);

  // useEffect(() => {
  //   const newTemplate = updateTemplate(
  //     newLayout,
  //     newLayout,
  //     prompt.aiResponseJson!,
  //     selectedColorPalette,
  //     imagePrompts.map((ip) => ip.metadata) as any,
  //     vectorPrompts.map((ip) => ip.metadata) as any
  //   );

  //   setTemplate(newTemplate);
  // }, [
  //   newLayout,
  //   prompt.aiResponseJson,
  //   selectedColorPalette,
  //   imagePrompts,
  //   vectorPrompts,
  // ]);

  // const borderColor =
  //   typeof imageStatus === "undefined"
  //     ? "gray"
  //     : imageStatus === true
  //     ? "green"
  //     : "red";

  // const disabled = !enabled && imageStatus === undefined && !allowInstantReview;

  return (
    <div style={{ display: "flex", padding: "5px" }}>
      {/* <div>
        <Checkbox
          style={{ borderLeft: "10px solid green" }}
          disabled={disabled}
          large
          checked={imageStatus === true}
          onChange={(e) => {
            if (e.target.checked) {
              setImageStatus(true);
            }
          }}
        />
        <Checkbox
          disabled={disabled}
          large
          style={{ borderLeft: "10px solid red" }}
          checked={imageStatus === false}
          onChange={(e) => {
            if (e.target.checked) {
              setImageStatus(false);
            }
          }}
        />
      </div> */}
      <div style={{ minHeight: "370px" }}>
        {/* {promptId} */}
        {template && (
          <AITemplatePreview currentProject={template} width={350} />
        )}
      </div>
    </div>
  );
}

//  <Overlay
//         className="image-review-panel"
//         isOpen={fullScreen}
//         onClose={() => setFullScreen(false)}

//         canEscapeKeyClose={true}
//         canOutsideClickClose={true}
//       >
//         <div
//           className={Classes.CARD}
//           style={{
//             width: "var(--daap-forcerefresh-app-width)",
//             height: "var(--daap-forcerefresh-app-height)",
//           }}
//         >
//           <div className={Classes.DIALOG_BODY}>
//             <img
//               onClick={() => {
//                 setFullScreen(true);
//               }}
//               src={src}
//               style={{
//                 maxWidth: "100%",
//                 maxHeight: "calc(var(--daap-forcerefresh-app-height) - 200px)",
//               }}
//             />
//           </div>
//           <div
//             className={Classes.DIALOG_FOOTER}
//             style={{ display: "flex", gap: "16px" }}
//           >
//             <Button intent="success" large>
//               Approve
//             </Button>
//             <Button intent="danger" large>
//               Reject
//             </Button>
//             <Button large>Close</Button>
//           </div>
//         </div>
//       </Overlay>
