import { Button, Checkbox, Classes, Dialog, Overlay } from "@blueprintjs/core";
import {
  AiProcessingStatus,
  AiPrompt,
  AiPromptStatus,
} from "../../types/ai-prompts";
import { useEffect, useState } from "react";
import { isEqual } from "lodash-es";

export const ImagePromptListView = ({
  prompts,
  title,
  // approvedImages,
  allowInstantReview,
  setImageProcessingStatus,
  onGenerateImage,
}: // onApply,
{
  title: string;
  prompts: AiPrompt[];
  allowInstantReview?: boolean;
  // approvedImages: { [promptId: string]: boolean };
  setImageProcessingStatus: (
    promptId: string,
    status: AiProcessingStatus
  ) => void;
  onGenerateImage: (objectId: string) => void;
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
            <ImageWithReview
              prompt={prompt}
              promptId={prompt.id}
              key={prompt.id}
              allowInstantReview={allowInstantReview}
              src={"/api/v1/generator/image-review/image/" + prompt.id}
              onGenerateImage={onGenerateImage}
              setImageStatus={(status) => {
                setImageProcessingStatus(
                  prompt.id,
                  status
                    ? AiProcessingStatus.APPROVED
                    : AiProcessingStatus.REJECTED
                );
              }}
              imageStatus={
                prompt.processingStatus === AiProcessingStatus.NOT_PROCESSED
                  ? undefined
                  : prompt.processingStatus === AiProcessingStatus.APPROVED
              }
            />
          );
        })}
      </div>
    </div>
  );
};

function ImageWithReview({
  src,
  promptId,
  imageStatus,
  setImageStatus,
  allowInstantReview,
  onGenerateImage,
  prompt,
}: {
  prompt: AiPrompt;
  src: string;
  promptId?: string;
  imageStatus: boolean | undefined;
  setImageStatus: (status: boolean | undefined) => void;
  allowInstantReview?: boolean;
  onGenerateImage: (objectId: string) => void;
}) {
  const [enabled, setEnabled] = useState(false);

  const borderColor =
    typeof imageStatus === "undefined"
      ? "gray"
      : imageStatus === true
      ? "green"
      : "red";

  const disabled = !enabled && imageStatus === undefined && !allowInstantReview;

  return (
    <div style={{ display: "flex", padding: "5px" }}>
      <div>
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

          // disabled={!isEqual(selectedColorPalette, colorSet)}
          // checked={!!approvedColorPalette.find((item) => isEqual(item, colorSet))}
          // onChange={(e) => {
          //   if (e.target.checked) {
          //     approvedColorPalette.push(colorSet);
          //     setApprovedColorPalette([...approvedColorPalette]);
          //   } else {
          //     approvedColorPalette = approvedColorPalette.filter(
          //       (item) => !isEqual(item, colorSet)
          //     );
          //     setApprovedColorPalette([...approvedColorPalette]);
          //   }
          // }}
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

          // disabled={!isEqual(selectedColorPalette, colorSet)}
          // checked={!!approvedColorPalette.find((item) => isEqual(item, colorSet))}
          // onChange={(e) => {
          //   if (e.target.checked) {
          //     approvedColorPalette.push(colorSet);
          //     setApprovedColorPalette([...approvedColorPalette]);
          //   } else {
          //     approvedColorPalette = approvedColorPalette.filter(
          //       (item) => !isEqual(item, colorSet)
          //     );
          //     setApprovedColorPalette([...approvedColorPalette]);
          //   }
          // }}
        />

        {imageStatus === false && (
          <Button
            small
            outlined
            onClick={() => {
              onGenerateImage(prompt.metadata.objectId);
            }}
          >
            Gen.
          </Button>
        )}
      </div>
      <div>
        {/* {promptId} */}
        {disabled && <div>Open to enable review</div>}
        <a href={src} target="_blank">
          <img
            onClick={() => {
              setEnabled(true);
            }}
            src={src}
            style={{
              maxWidth: "250px",
              maxHeight: "250px",
              border: "5px solid gray",
              borderColor,
            }}
          />
        </a>
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
