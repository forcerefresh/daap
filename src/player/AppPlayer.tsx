import React, { useEffect, useRef, useState } from "react";
import { isEmpty } from "lodash-es";
import useDeepCompareEffect from "use-deep-compare-effect";
import { IPlayerData } from "../export/export-html";
import { IPreviewState } from "../store/reducers/stage";
import { Player } from "./player/Player";

export interface AppPlayerProps {
  playerData: IPlayerData | null;
  previewState: IPreviewState;
  manualProgress: number;
  onProgress: (progress: number) => void;
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
  /*useEffect(() => {
    if (tl.paused()) {
      console.log(manualProgress);
      tl.progress(manualProgress, true);
    }
  }, [manualProgress]);*/

  // play/pause switch
  /*useEffect(() => {
    switch (previewState.previewState) {
      case "play":
        tl.paused(false);
        break;
      case "pause":
        tl.paused(true);
        break;
    }
  }, [previewState.previewState]);*/

  // change preview speed
  /*useEffect(() => {
    tl.timeScale(previewState.previewSpeed);
  }, [previewState.previewSpeed]);*/

  // when we turn off repeat it stops playing on end and reset position to start
  /*useEffect(() => {
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
  }, [previewState.repeat]);*/

  /*useEffect(() => {
    tl.eventCallback("onUpdate", () => {
      onProgress(tl.progress());
    });
    return () => {
      // TODO: do we need to cleanup;
    };
  }, [tl]);*/

  let currentPlayer = React.useRef<Player | undefined>();
  useDeepCompareEffect(() => {
    if (!isEmpty(playerData?.slideDataArr)) {
      /*const playerConfig: IPlayerConfig = {
        oneSlide: previewState?.scope?.entityType === "slide",
      };*/
      const pl = new Player(playerData, playerHolderRef.current!);
      player.current = pl;

      pl.playSlide(0);

      currentPlayer.current = pl;

      return () => {
        pl.clear();
      };
    }
  }, [playerData]);

  useEffect(() => {
    currentPlayer.current?.setPaused(!!previewState.paused);
  }, [previewState.paused]);

  return (
    <div>
      <div style={{ position: "relative" }} ref={playerHolderRef} />
    </div>
  );
};
