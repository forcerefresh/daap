import React, {
  CSSProperties,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import cx from "classnames";
import css from "./CursorProvider.module.scss";
import { ToolsContext } from "../../utils/tools/ToolsProvider";
import { useSelector } from "react-redux";
import { IStore } from "../../store/store";
import { getZoom } from "../../store/helpers/calculateZoom";

export interface ICursorStyle {
  size: number;
  style: CSSProperties;
}

export interface ICursorContext {
}

export const CursorContext = React.createContext<ICursorContext>({});

const SUPPORTED_CURSORS = [false, "pointer", "right", "left"];

export const CursorProvider = ({
  children,
}: React.PropsWithChildren<React.ReactNode>) => {
  const { cursorStyle, appZoom = 1 } = useContext(ToolsContext);
  const {
    stage,
    project: { settings },
  } = useSelector((state: IStore) => state);
  const zoom = getZoom(stage, settings);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursor, setCursor] = useState<string | undefined>("circle");

  const [visible, setVisible] = useState(true);

  const { activeTool } = useContext(ToolsContext);

  const onMouseMove = (event: MouseEvent) => {
    const { pageX: x, pageY: y } = event;
    setMousePosition({ x, y });

    const showMe = !(event.target as Element).closest(".no-custom-cursor");
    setVisible(showMe);
  };

  useEffect(() => {
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
    };
  });

  const { x, y } = mousePosition;

  const onCursor = (cursorType: string) => {
    const cursor =
      (SUPPORTED_CURSORS.includes(cursorType) && cursorType) || undefined;
    setCursor(cursor);
  };

  const [stageRect, setStageRect] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const stagePanelRect = document
      .getElementsByClassName("StagePanel")?.[0]
      ?.getBoundingClientRect();

    if (stagePanelRect) {
      setStageRect(stagePanelRect);
    }
  }, [cursorStyle]);

  return (
    <CursorContext.Provider value={{}}>
      <div
        className={cx({
          [css.hideCursor]: !!cursor && !!activeTool && cursorStyle,
        })}
      >
        {cursorStyle && (
          <ins
            className={cx(css.movable, {
              [css.active]: cursorStyle && !!cursor && visible && !!activeTool,
              //[`cursor-${cursor}`]: !!cursor,
            })}
            style={{
              left: `${(x - stageRect.x) / appZoom}px`,
              top: `${(y - stageRect.y) / appZoom}px`,
              ...cursorStyle.style,
              width: zoom * cursorStyle.size + "px",
              height: zoom * cursorStyle.size + "px",
            }}
          />
        )}
        {children}
      </div>
    </CursorContext.Provider>
  );
};

export default CursorProvider;
