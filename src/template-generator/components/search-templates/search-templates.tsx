import React, {
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import cx from "classnames";
import { last, omit } from "lodash-es";
import { connect } from "react-redux";
import { Dialog, InputGroup } from "@blueprintjs/core";
import { IStore } from "../../../store/store";
import css from "./search-template.module.scss";
import { IObject } from "webslider-sdk/lib/objects/i-object";

import {
  updateProjectMeta,
  updateEditor,
  replaceObject,
  addNewObject,
  openProject,
  doClearHistory,
  activateSlide,
  selectSlides,
  selectForPropertiesProps,
  selectForProperties,
  setDevice,
} from "../../../store/actions/actions";

import { IMeta } from "../../../store/reducers/meta";

import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { IEditor } from "../../../store/reducers/editor";
import { useAiPrompt } from "../../hooks/useTemplateGenerator";
import { AiProcessingStatus, AiPromptKind } from "../../types/ai-prompts";
import { useLayoutHook } from "../../../panels/layouts-panel/useLayoutHook";
import { updateTemplate } from "../../utils/update-layout-utils";
import { AITemplatePreview } from "../ai-template-preview/ai-template-preview";
import { resizeProportionally } from "../../../utils/common-calculation/common-calculation";
import { generateImages } from "../../../player/image-generator-utils";
import { blobToBase64 } from "../../../utils/file/file-utils";
import { usePublicTemplate } from "../../hooks/usePublicTemplate";
import { usePublicTemplateSearch } from "../../hooks/usePublicTemplateSearch";
import TemplatesGrid from "./templates-grid";

export const PREVIEW_WIDTH = 500;

interface ISearchTemplatesProps {
  onRequestClose?: () => void;
  open?: boolean;
}

export type ISearchTemplatesMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  ISearchTemplatesProps;

const SearchTemplates = (props: ISearchTemplatesMergedProps): ReactElement => {
  const { open, onRequestClose } = props;

  const [searchValue, setSearchValue] = useState("");
  const [search, setSearch] = useState("");

  // TODO: TMP:
  const { searchPublicTemplate } = usePublicTemplateSearch();

  const reload = () => {
    if (searchValue.length > 2) searchPublicTemplate(1, searchValue, 100);
  };

  return (
    <Dialog
      className={cx("bp5-dark", css.dialog)}
      isOpen={open}
      onClose={() => {
        onRequestClose?.();
      }}
      title="Search templates"
      canOutsideClickClose={false}
    >
      <div>
        <InputGroup
          large
          leftIcon="search"
          placeholder={`Explore our database of 1M+ documents...`}
          rightElement={undefined}
          value={searchValue}
          onChange={(event: any) => {
            setSearchValue((event.currentTarget as HTMLInputElement).value);
          }}
          onKeyPress={(event) => {
            if (event.key === "Enter") {
              setSearch((event.currentTarget as HTMLInputElement).value);

              // setSelectedImage(-1);
              // setPressEnter(false);
              // resetImages();
              // reload();
            }
          }}
        ></InputGroup>
      </div>
      <TemplatesGrid searchQuery={search} baseUrl="/" />
    </Dialog>
  );
};

const mapStateToProps = (state: IStore) => {
  // NOTE: get largest enabled
  const breakpointConfig: BreakpointConfiguration | undefined = last(
    state.project.settings.breakpoints.breakpointsConfiguration.filter(
      (bc) => bc.enabled
    )
  );

  return {
    // project: omit({ ...state.project }, "diff", "clipboard"), //, "selection"
    // meta: state.meta,
    // slides: state.project.pages,
    // layers: state.project.layers,
    // objects: state.project.objects,
    // breakpointConfig,
    // settings: state.project.settings,
    // breakpoints: state.project.settings.breakpoints,
    themeClass: state.project.settings.themeClass,
    // selectedDevice: state.stage.selectedDevice,
    // pages: state.project.pages,
  };
};

const mapDispatchToProps = {
  _updateProjectMeta: (meta: Partial<IMeta>) => updateProjectMeta(meta),
  _updateEditor: (editor: Partial<IEditor>) => updateEditor(editor),
  _replaceObject: replaceObject,
  _resetChangedState: () =>
    updateEditor({ sliderChanged: false, isExistingProject: true }),
  _addNewObject: (
    layerId: string,
    type: string,
    objectProps: Partial<IObject>,
    values?: { [key: string]: any }
  ) => addNewObject(layerId, type, objectProps, values),
  _openProject: (project: any) => openProject(project),
  _doClearHistory: () => doClearHistory(),
  _activateSlide: (id: string): any => activateSlide(id),
  _selectSlides: (ids: string[]): any => selectSlides(ids),
  _selectForProperties: (payload: selectForPropertiesProps) =>
    selectForProperties(payload),
  _setDevice: setDevice,
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchTemplates);
