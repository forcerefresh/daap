import React from "react";
import css from "./MainLayout.module.scss";

export interface IMainLayout {
  toolbar?: React.ReactElement;
  properties?: React.ReactElement;
  content?: React.ReactElement;
  timeline?: React.ReactElement;
}
export default function MainLayout(props: IMainLayout) {
  const { toolbar, content, timeline, properties } = props;

  return (
    <div className={css.mainLayout}>
      <div className={css.toolbar}>{toolbar}</div>
      <div className={css.center}>
        <div className={css.content}>{content}</div>
        <div className={css.timeline}>{timeline}</div>
      </div>
      <div className={css.properties}>{properties}</div>
    </div>
  );
}
