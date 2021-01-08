import React from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./HistoryPanel.module.scss";

interface IHistoryPanelProps {
  onRequestClose: () => void;
}

export type IHistoryPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IHistoryPanelProps;

const HistoryPanel: React.FC<IHistoryPanelMergedProps> = (props) => {
  const { prev, next } = props;

  const nextTitles = next.map((item) => item.type).reverse();
  const prevTitles = prev.map((item) => item.type);

  return (
    <div className={cx("bp3-dark", css.historyPanel)}>
      <div>
        {nextTitles.map((item, idx) => (
          <div key={idx} className={cx({ [css.nextItem]: true })}>
            {item}
          </div>
        ))}
        {prevTitles.map((item, idx) => (
          <div
            key={idx + "prev"}
            className={cx({
              [css.activeItem]: idx === 0,
              [css.prevItem]: idx > 0,
            })}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  diff: (state as any).diff,
  prev: (state as any).diff.prev as { type: string }[],
  next: (state as any).diff.next as { type: string }[],
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(HistoryPanel);
