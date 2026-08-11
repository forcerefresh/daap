import { Button, HTMLSelect } from "@blueprintjs/core";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { Player } from "daap-player";
import { getSliderOptionsFromLocalStorage } from "./utils";
import css from "./PlayerDev.module.scss";
import cx from "classnames";
import { IPlayerData } from "../export/i-export-html";

interface IParentDivConfig {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

function getPlayerHolderStyle(offset = 0) {
  return {
    left: offset,
    top: offset,
    right: offset,
    bottom: offset,
  };
}
function PlayerDev() {
  const playerHolderRef = useRef(null);
  const playerRootRef = useRef(null);
  const playerRef = useRef<Player | undefined>();
  const [selectedSlider, setSelectedSlider] = useState<string | undefined>();
  const [latestPlayerData, setLatestPlayerData] = useState<any>();
  const [playerHolderStyle, setPlayerHolderStyle] = useState(
    getPlayerHolderStyle(0),
  );

  const [sliderReference, setSliderReference] = useState<"viewport" | "parent">(
    "viewport",
  );
  const [parentDivConfig, setParentDivConfig] = useState<IParentDivConfig>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    if (!selectedSlider) return;

    const exportsData = JSON.parse(localStorage.getItem("exports") || "{}");
    const selectedPlayerData: IPlayerData = exportsData[selectedSlider as any];
    setLatestPlayerData(selectedPlayerData);

    if (playerRef.current) {
      playerRef.current.clear(true);
    }

    setSliderReference(
      selectedPlayerData.config.breakpointReference || "viewport",
    );

    setPlayerHolderStyle(
      getPlayerHolderStyle(
        selectedPlayerData.config.breakpointReference === "parent" ? 100 : 0,
      ),
    );

    playerRef.current = new Player(selectedPlayerData, playerRootRef.current!);
    playerRef.current.play();
  }, [selectedSlider]);

  const sliderOptions = getSliderOptionsFromLocalStorage();

  const renderBreakpointButtons = () => {
    return latestPlayerData?.breakpoints.breakpointsConfiguration.map(
      (bp: any) => {
        return (
          <Button
            onClick={() => {
              playerRef.current?.setDevice(bp.type);
            }}
          >
            {bp.type}
          </Button>
        );
      },
    );
  };

  // const refreshButtonEl = document.getElementById("refreshButton");
  // refreshButtonEl?.addEventListener("click", (e: any) => {
  //   if (player) {
  //     player.clear(true);
  //   }

  //   player = new Player(latestPlayerData, playerRootEl);
  //   player.play();
  // });

  // const pauseButtonEl = document.getElementById("pauseButton");
  // pauseButtonEl?.addEventListener("click", (e: any) => {
  //   if (player) {
  //     player.setRootPaused(true);
  //   }
  // });

  const renderRefreshButton = () => {
    return (
      <Button
        onClick={() => {
          if (playerRef.current) {
            playerRef.current.clear(true);
          }

          playerRef.current = new Player(
            latestPlayerData,
            playerRootRef.current!,
          );
          playerRef.current.play();
        }}
      >
        Pause
      </Button>
    );
  };

  const renderPauseButton = () => {
    return (
      <Button
        onClick={() => {
          if (playerRef.current) {
            playerRef.current.setRootPaused(true);
          }
        }}
      >
        Pause
      </Button>
    );
  };

  const playerHolderStylePx = {
    left: playerHolderStyle.left + "px",
    top: playerHolderStyle.top + "px",
    right: playerHolderStyle.right + "px",
    bottom: playerHolderStyle.bottom + "px",
  };
  return (
    <div>
      <div className={css.controlsHolder}>
        <HTMLSelect
          className={css.selectInput}
          id="text-input"
          options={[{ label: "Select slider", value: "" }, ...sliderOptions]}
          value={selectedSlider}
          onChange={(event: ChangeEvent) => {
            setSelectedSlider((event.currentTarget as HTMLSelectElement).value);
          }}
        />
        {renderRefreshButton()}
        {renderPauseButton()}
        {!!latestPlayerData && (
          <>
            <div>{renderBreakpointButtons()}</div>
            <div>
              <HTMLSelect
                className={css.selectInput}
                id="text-input"
                options={[
                  { label: "Viewport", value: "viewport" },
                  { label: "Parent", value: "parent" },
                ]}
                value={sliderReference}
                onChange={(event: ChangeEvent) => {
                  const bpRef = (event.currentTarget as HTMLSelectElement)
                    .value as "viewport" | "parent";
                  setSliderReference(bpRef);

                  setPlayerHolderStyle(
                    getPlayerHolderStyle(bpRef === "viewport" ? 0 : 100),
                  );

                  setTimeout(() => {
                    playerRef.current?.setBreakpointReference(bpRef);
                  }, 1);
                }}
              />
            </div>
          </>
        )}
      </div>

      <div
        ref={playerHolderRef}
        style={{ position: "absolute", ...playerHolderStylePx }}
      >
        <div ref={playerRootRef}></div>
      </div>
    </div>
  );
}

export default PlayerDev;
