import React, { useContext, useEffect, useRef } from "react";
import { isEmpty } from "lodash-es";
import useDeepCompareEffect from "use-deep-compare-effect";
import { IPreviewState } from "../store/reducers/stage";
import { Player } from "./player/Player";
import { IPlayerData } from "../export/i-export-html";
import { PreviewTimelineContext } from "../utils/preview-timeline-provider/PreviewTimelineProvider";

export interface AppPlayerProps {
  playerData: IPlayerData | null;
  previewState: IPreviewState;
  manualProgress: number;
  // deprecated : onProgress?: (progress: number, time: number, slideIdx: number) => void;
  requestStop: () => void;
}

export const AppPlayer: React.FC<AppPlayerProps> = (props) => {
  const { playerData, manualProgress, previewState, requestStop } = props;

  const { setPreviewTimelineState } = useContext(PreviewTimelineContext);

  const player = useRef<Player>();
  const playerHolderRef = useRef<HTMLDivElement>(null);

  // manual progress
  useEffect(() => {
    if (previewState.previewState === "pause") {
      player.current?.getCurrentTimeline()?.progress(manualProgress, true);
    }
  }, [manualProgress]);

  // play/pause switch
  useEffect(() => {
    switch (previewState.previewState) {
      case "play":
        player.current?.paused(false);
        break;
      case "pause":
        player.current?.paused(true);
        break;
      case "stop":
        // TODO: this can be removed as its not reachable
        player.current?.clear();
        setPreviewTimelineState({
          progress: 0,
          time: 0,
          slideIdx: 0,
        });
        break;
    }
  }, [previewState.previewState]);

  // change preview speed
  // useEffect(() => {
  //   player.current?.getCurrentTimeline()?.timeScale(previewState.previewSpeed);
  // }, [previewState.previewSpeed]);

  // when we turn off repeat it stops playing on end and reset position to start
  useEffect(() => {
    player.current?.getCurrentTimeline()?.eventCallback("onRepeat", () => {
      if (!previewState.repeat) {
        player.current?.getCurrentTimeline()?.progress(0);
        player.current?.getCurrentTimeline()?.pause();
        requestStop();
      } else {
        document.querySelectorAll(".effect-main-element").forEach((el) => {
          (el as HTMLDivElement).style.visibility = "hidden";
        });
      }
    });
  }, [previewState.repeat]);

  let currentPlayer = React.useRef<Player | undefined>();
  useDeepCompareEffect(() => {
    if (!isEmpty(playerData?.slideDataArr)) {
      /*const playerConfig: IPlayerConfig = {
        oneSlide: previewState?.scope?.entityType === "slide",
      };*/

      const pl = new Player(playerData, playerHolderRef.current!, {
        isApp: true,
      });
      player.current = pl;

      // TODO: DUPLICATE CODE 1
      pl.onUpdate(() => {
        setPreviewTimelineState({
          progress: player.current?.getCurrentTimeline()?.progress() || 0,
          time: player.current?.getCurrentTimeline()?.time()! / 1000 || 0,
          slideIdx: player.current?.getCurrentTimelineIdx() || 0,
        });
      });

      pl.onCurrentTimelineChange(() => {
        // TODO: DUPLICATE CODE 2

        pl.onUpdate(() => {
          setPreviewTimelineState({
            progress: player.current?.getCurrentTimeline()?.progress() || 0,
            time: player.current?.getCurrentTimeline()?.time()! / 1000 || 0,
            slideIdx: player.current?.getCurrentTimelineIdx() || 0,
          });
        });
      });

      pl.play();

      currentPlayer.current = pl;
    }

    return () => {
      player.current?.clear();
      setPreviewTimelineState({
        progress: 0,
        time: 0,
        slideIdx: 0,
      });
    };
  }, [playerData]);

  useEffect(() => {
    currentPlayer.current?.setRootPaused(!!previewState.paused);
  }, [previewState.paused]);

  return (
    <div>
      <div style={{ position: "relative" }} ref={playerHolderRef} />
    </div>
  );
};
