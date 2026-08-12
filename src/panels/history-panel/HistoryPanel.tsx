import React, { useEffect, useRef } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./HistoryPanel.module.scss";
import { doRedo, doUndo, IUndoableAction } from "../../store/actions/actions";
import { Button } from "@blueprintjs/core";
import { PanelHeader } from "../common/panel-header/PanelHeader";

interface IHistoryPanelProps {
  onRequestClose: () => void;
}

export type IHistoryPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IHistoryPanelProps;

interface IHistoryItem {
  jumpIndex: number;
  title: string;
  ignoreActionTitle: string;
}

const getHistory = (
  prevOrNext: ({ type: string } & IUndoableAction)[]
): IHistoryItem[] => {
  const historyArr: IHistoryItem[] = [];

  let historyItem: IHistoryItem | undefined;
  prevOrNext.forEach((item: any, idx: number) => {
    if (!historyItem) {
      historyItem = {
        jumpIndex: -1,
        title: "",
        ignoreActionTitle: "",
      };
    }
    if (item.skipHistory !== true) {
      historyItem.jumpIndex = idx;
      historyItem.title = item.type;
      historyArr.push(historyItem);
      historyItem = undefined;
    } else {
      historyItem.ignoreActionTitle += item.type + "; ";
    }
  });
  return historyArr;
};

const HistoryPanel: React.FC<IHistoryPanelMergedProps> = (props) => {
  const { prev, next, doUndo, doRedo, hasUndoItem, hasRedoItem } = props;

  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const makeVisible = (activeRef?.current as any)?.scrollIntoViewIfNeeded;
    if (typeof makeVisible === "function") {
      makeVisible.call(activeRef?.current);
    }
  }, [activeRef, prev]);

  const nextHistory = getHistory([...next].reverse());
  const prevHistory = getHistory(prev);

  return (
    <div className={cx("bp5-dark", css.historyPanel)}>
      <PanelHeader title="HISTORY PANEL">
        <Button
          disabled={!hasUndoItem}
          minimal
          small
          onClick={() => doUndo()}
          icon="undo"
        >
          Undo
        </Button>
        <Button
          disabled={!hasRedoItem}
          minimal
          small
          onClick={() => doRedo()}
          icon="redo"
        >
          Redo
        </Button>
      </PanelHeader>
      <div className={css.historyHolder}>
        <div>
          {/*nextItems.map((item, idx) => (
            <div
              onClick={() => doJump(nextItems.length - idx)}
              key={idx}
              className={cx({ [css.nextItem]: true })}
            >
              {item.type}
            </div>
          ))*/}

          {/*prevItems.map((item, idx) => (
            <div
              onClick={() => doJump(-idx)}
              ref={idx === 0 ? activeRef : null}
              key={idx + "prev"}
              className={cx({
                [css.activeItem]: idx === 0,
                [css.prevItem]: idx > 0,
              })}
            >
              {item.type}
            </div>
            ))*/}

          {nextHistory.map((item, idx) => (
            <div
              //onClick={() => doJump(next.length - item.jumpIndex)}
              key={idx}
              className={cx({ [css.nextItem]: true })}
            >
              {!!item.ignoreActionTitle && (
                <>
                  {item.ignoreActionTitle} <br />
                </>
              )}

              <strong style={{ color: "#18da8a" }}>{item.title}</strong>
            </div>
          ))}

          {prevHistory.map((item, idx) => (
            <div
              //onClick={() => doJump(-item.jumpIndex)}
              ref={idx === 0 ? activeRef : null}
              key={idx + "prev"}
              className={cx({
                [css.activeItem]: idx === 0,
                [css.prevItem]: idx > 0,
              })}
            >
              {!!item.ignoreActionTitle && (
                <>
                  {item.ignoreActionTitle} <br />
                </>
              )}

              <strong style={{ color: "#18da8a" }}>{item.title}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  diff: state.project.diff,
  prev: state.project.diff.prev as ({ type: string } & IUndoableAction)[],
  next: state.project.diff.next as ({ type: string } & IUndoableAction)[],
  hasUndoItem: state.project.diff.prev.length !== 0,
  hasRedoItem: state.project.diff.next.length !== 0,
});

const mapDispatchToProps = {
  // doJump: (jumpIdx: number) => doJump(jumpIdx),
  doUndo: () => doUndo(),
  doRedo: () => doRedo(),
};

export default connect(mapStateToProps, mapDispatchToProps)(HistoryPanel);
