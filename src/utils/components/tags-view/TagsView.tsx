import { Popover, Position, Tag } from "@blueprintjs/core";
import classnames from "classnames";
import React from "react";

type TagsViewProps = {
  tags: string[];
  show?: number;
};

export default function TagsView({ tags, show = 1 }: TagsViewProps) {
  if (!tags || tags.length === 0) {
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
          portalClassName={classnames("bp3-dark")}
          minimal
          content={
            <div style={{ margin: "10px" }}>
              {workingTags.map((tag) => (
                <Tag
                  key={tag}
                  round
                  minimal
                  style={{ display: "block", margin: "5px 0" }}
                >
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
