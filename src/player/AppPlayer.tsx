import React, { useEffect, useRef } from "react";
import { isEmpty } from "lodash-es";
import useDeepCompareEffect from "use-deep-compare-effect";
import { IPreviewState } from "../store/reducers/stage";
import { Player } from "./player/Player";
import { IPlayerData } from "../export/i-export-html";
import { TimelineMax } from "gsap/all";

export interface AppPlayerProps {
  playerData: IPlayerData | null;
  previewState: IPreviewState;
  manualProgress: number;
  onProgress: (progress: number, time: number, slideIdx: number) => void;
  requestStop: () => void;
}

export const AppPlayer: React.FC<AppPlayerProps> = (props) => {
  const { playerData, manualProgress, previewState, onProgress, requestStop } =
    props;

  const divRef = useRef(null);

  //const slideDataArr = playerData?.slideDataArr
  //const [player, setPlayer] = useState<Player>();

  const player = useRef<Player>();

  const playerHolderRef = useRef<HTMLDivElement>(null);

  // manual rogress
  useEffect(() => {
    if (previewState.previewState === "pause") {
      console.log(manualProgress);
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
        debugger;
        player.current?.clear();
        break;
    }
  }, [previewState.previewState]);

  // change preview speed
  useEffect(() => {
    player.current?.getCurrentTimeline()?.timeScale(previewState.previewSpeed);
  }, [previewState.previewSpeed]);

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
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAA");
    if (!isEmpty(playerData?.slideDataArr)) {
      /*const playerConfig: IPlayerConfig = {
        oneSlide: previewState?.scope?.entityType === "slide",
      };*/
      console.log(playerData);
      console.log(JSON.stringify(playerData));

      const pl = new Player(playerData, playerHolderRef.current!);
      player.current = pl;

      // TODO: DUPLICATE CODE 1
      pl.onUpdate(() => {
        console.log(player.current?.getCurrentTimeline()?.progress());
        //
        onProgress(
          player.current?.getCurrentTimeline()?.progress() || 0,
          player.current?.getCurrentTimeline()?.time() || 0,
          player.current?.getCurrentTimelineIdx() || 0
        );
      });

      pl.onCurrentTimelineChange(() => {
        console.log("onCurrentTimelineChange");
        // TODO: DUPLICATE CODE 2

        pl.onUpdate(() => {
          const tl = player.current?.getCurrentTimeline() as TimelineMax;
          console.log(player.current?.getCurrentTimeline()?.progress());
          console.log(tl.duration());
          console.log(tl.endTime());
          console.log(tl.totalTime());
          console.log(tl.time());
          onProgress(
            player.current?.getCurrentTimeline()?.progress() || 0,
            player.current?.getCurrentTimeline()?.time() || 0,
            player.current?.getCurrentTimelineIdx() || 0
          );
        });
      });

      pl.playSlide(0);

      currentPlayer.current = pl;

      return () => {
        pl.clear(true);
      };
    }
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
