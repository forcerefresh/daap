import React, { useCallback, useEffect, useRef, useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import update from "immutability-helper";
import {
  activateSlide,
  selectSlides,
  selectForProperties,
  selectForPropertiesProps,
  addNewPage,
  reorderPages,
} from "../../store/actions/actions";
import css from "./PagesSimplified.module.scss";
import { PageType } from "../../store/reducers/i-pages";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { SimplifiedPageRow } from "./SimplifiedPageRow";
import { last } from "lodash-es";
import { Button } from "@blueprintjs/core";
import withScrolling from "react-dnd-scrolling";

const ScrollingComponent = withScrolling("div");

type ISlidesPanel = typeof mapDispatchToProps & ReturnType<typeof mapStateToProps>;

const PagesSimplifiedPanel = (props: ISlidesPanel) => {
  const {
    objects,
    activeSlideId,
    selectedSlideIds,
    pagesIds,
    pageById,
    breakpointConfig,
    _addNewPage,
    _reorderPages,
    _activateSlide,
    _selectSlides,
    _selectForProperties,
  } = props;

  const [forceUpdatePreviewIdx, setForceUpdatePreviewIdx] = useState(0);
  useEffect(() => {
    setForceUpdatePreviewIdx((prev) => prev + 1);
  }, [objects]);

  const [sortedPageIds, setSortedPageIds] = useState<string[] | undefined>();
  useEffect(() => {
    setSortedPageIds(undefined);
  }, [pagesIds]);

  // Ref so movePage callback has no stale closure on pagesIds
  const pagesIdsRef = useRef(pagesIds);
  pagesIdsRef.current = pagesIds;

  const movePage = useCallback((dragIndex: number, hoverIndex: number) => {
    setSortedPageIds((prev) => {
      const current = prev ?? pagesIdsRef.current;
      return update(current, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, current[dragIndex] as string],
        ],
      });
    });
  }, []);

  const onPageClick = (_event: React.MouseEvent<HTMLDivElement>, pageId: string) => {
    _activateSlide(pageId);
    _selectSlides([pageId]);
    _selectForProperties({ id: pageId, type: "slide" });
  };

  const displayPageIds = sortedPageIds ?? pagesIds;

  return (
    <div className={cx(css.pagePanel, "no-custom-cursor")}>
      <div className={css.layersHolder}>
        <ScrollingComponent className={cx(css.objectsHolder)}>
          {displayPageIds.length > 0 ? (
            displayPageIds.map((pageId, idx) => {
              const page = pageById[pageId];
              return (
                <div className={css.itemHolder} key={`page-${pageId}`}>
                  <div
                    className={cx(css.objectItem, {
                      [css.selected]: page.id === activeSlideId,
                    })}
                  >
                    <div>{page.name}</div>
                    <div>
                      <Button
                        className={cx(css.smallButton, css.addPageSmall)}
                        small
                        minimal
                        onClick={() => _addNewPage(PageType.Normal, true, idx)}
                        icon="add"
                      />
                    </div>
                  </div>
                  <SimplifiedPageRow
                    forceUpdatePreviewIdx={forceUpdatePreviewIdx}
                    page={page}
                    movePage={movePage}
                    dropCancel={() => setSortedPageIds(undefined)}
                    dropDone={() => {
                      _reorderPages(sortedPageIds ?? pagesIds);
                      setSortedPageIds(undefined);
                    }}
                    pageById={pageById}
                    onPageClick={onPageClick}
                    breakpointConfig={breakpointConfig}
                    selectedPageIds={selectedSlideIds}
                    rowIndex={idx}
                  />
                </div>
              );
            })
          ) : (
            <span className="bp5-text-disabled">No pages found</span>
          )}
        </ScrollingComponent>
        <div
          style={{
            display: "flex",
            flexDirection: "row-reverse",
            marginTop: "5px",
            marginRight: "5px",
          }}
        >
          <Button
            className={css.smallButton}
            small
            minimal
            onClick={() => _addNewPage(PageType.Normal, true)}
            icon="add"
          >
            Add Page
          </Button>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { pages, selection, objects } = state.project;

  const breakpointConfig: BreakpointConfiguration | undefined = last(
    state.project.settings.breakpoints.breakpointsConfiguration.filter((bc) => bc.enabled),
  );

  return {
    objects: objects.objectById,
    selectedSlideIds: selection.selectedSlideIds,
    pagesIds: pages.pages,
    pageById: pages.pageById,
    activeSlideId: selection.activeSlideId,
    breakpointConfig,
  };
};

const mapDispatchToProps = {
  _activateSlide: (id: string): any => activateSlide(id),
  _selectSlides: (ids: string[]): any => selectSlides(ids),
  _selectForProperties: (payload: selectForPropertiesProps) => selectForProperties(payload),
  _addNewPage: addNewPage,
  _reorderPages: (pageIds: string[]) => reorderPages(pageIds),
};

export default connect(mapStateToProps, mapDispatchToProps)(PagesSimplifiedPanel);
