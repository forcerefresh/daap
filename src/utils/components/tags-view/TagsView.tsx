import { Popover, Position, Tag } from "@blueprintjs/core";
import cx from "classnames";
import React from "react";

import css from "./TagsView.module.scss";

type TagsViewProps = {
  tags?: string[];
  show?: number;
};

export default function TagsView({ tags = [], show = 1 }: TagsViewProps) {
  if (tags.length === 0) {
    return null;
  }
  const workingTags = [...tags];
  const firstTwo = workingTags.splice(0, show);

  return (
    <>
      {firstTwo?.map((tag) => (
        <>
          {tag && (
            <Tag round minimal style={{ maxWidth: "100px" }}>
              {tag}
            </Tag>
          )}
        </>
      ))}
      {workingTags.length > 0 && (
        <Popover
          interactionKind="hover"
          portalClassName={cx("bp5-dark")}
          minimal
          content={
            <div
              className={css.tagsHolder}
              onClick={(e) => e.stopPropagation()}
            >
              {workingTags.map((tag) => (
                <Tag key={tag} round minimal style={{ display: "block" }}>
                  {tag}
                </Tag>
              ))}
            </div>
          }
          position={Position.RIGHT_TOP}
        >
          <Tag round minimal style={{ cursor: "default" }}>
            +{workingTags.length} more
          </Tag>
        </Popover>
      )}
    </>
  );
}
