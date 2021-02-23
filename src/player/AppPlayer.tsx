import React, { useEffect, useRef, useState } from "react";
import { isEmpty } from "lodash-es";
import gsap from "gsap";
import useDeepCompareEffect from "use-deep-compare-effect";
import { IPlayerData } from "../export/export-html";
import { IPreviewState } from "../store/reducers/stage";
import { createTimelineForObject } from "./AppPlayerUtils";

export interface AppPlayerProps {
  playerData: IPlayerData | null;
  previewState: IPreviewState;
  onProgress: (progress: number) => void;
  requestStop: () => void;
}

export const AppPlayer: React.FC<AppPlayerProps> = (props) => {
  const { playerData, previewState, onProgress, requestStop } = props;

  const divRef = useRef(null);

  const transitionsDataArr = playerData?.transitionsDataArr || [];
  const [tl, _setTl] = useState(gsap.timeline());

  // play/pause switch
  useEffect(() => {
    switch (previewState.previewState) {
      case "play":
        tl.paused(false);
        break;
      case "pause":
        tl.paused(true);
        break;
    }
  }, [previewState.previewState]);

  // change preview speed
  useEffect(() => {
    tl.timeScale(previewState.previewSpeed);
  }, [previewState.previewSpeed]);

  // when we turn off repeat it stops playing on end and reset position to start
  useEffect(() => {
    tl.eventCallback("onRepeat", () => {
      if (!previewState.repeat) {
        tl.progress(0);
        tl.pause();
        requestStop();
      } else {
        document.querySelectorAll(".effect-main-element").forEach((el) => {
          (el as HTMLDivElement).style.visibility = "hidden";
        });
      }
    });
  }, [previewState.repeat]);

  useEffect(() => {
    tl.eventCallback("onUpdate", () => {
      onProgress(tl.progress());
    });
    return () => {
      // TODO: do we need to cleanup;
    };
  }, [tl]);

  useDeepCompareEffect(() => {
    if (!isEmpty(transitionsDataArr)) {
      tl.clear();

      tl.repeat(-1);
      tl.timeScale(previewState.previewSpeed);

      transitionsDataArr.forEach((data) => {
        console.log(data);
        tl.add(createTimelineForObject(data), 0);
      });

      tl.restart();

      /*tl.eventCallback("onComplete", () => {
        _setStagePreview({ isPreview: false });
      });*/

      return () => {
        tl.clear();
      };
    }
  }, [transitionsDataArr]);

  return (
    <div>
      <div
        style={{ position: "relative" }}
        dangerouslySetInnerHTML={{ __html: playerData?.html as string }}
      />
    </div>
  );
};
