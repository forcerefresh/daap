import { useContext } from "react";
import cx from "classnames";
import {
  Button,
  ButtonGroup,
  Divider,
  Icon,
  Tag,
  Text,
} from "@blueprintjs/core";
import DaapLogo from "./daap-logo.svg?react";
import { IStore } from "../../../store/store";
import {
  updateEditor,
} from "../../../store/actions/actions";
import { connect } from "react-redux";
import css from "./SassMainHeader.module.scss";
import LibraryIcon from "../../../panels/toolbar-panel/assets/library-icon.svg?react";
import ExtensionsIcon from "../../../panels/toolbar-panel/assets/extensions-icon.svg?react";
import AddObjectIcon from "../../../panels/toolbar-panel/assets/add-object-icon.svg?react";
import ChangeCheckerButton from "../../../utils/components/change-checker-button/ChangeCheckerButton";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { IntegrationContext } from "../../../integration";
import { useNavigate } from "react-router";
import { IEditor } from "../../../store/reducers/editor";
import { Link } from "react-router-dom";


type IMainHeader = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    className?: string;
  };

const MainHeader = (props: IMainHeader) => {
  const {
    className,
    meta,
    breakpointConfig,
    canUseLayouts,
    outdatedExtensions,
    _updateEditor,
    fullScreen,
  } = props;

  const navigate = useNavigate();

  const {
    getFullscreenButtonComponent: FullscreenButtonComponent,
    AccountComponent,
    platform,
  } = useContext(IntegrationContext);

  return (
    <>
      <div className={cx(css.mainHeader, className)}>
        <div className={css.left}>
          {platform.hasHomeLinkInSearch ? (
            <Link to={"/search"} style={{ outline: "none" }}>
              <DaapLogo className={css.logo} />
            </Link>
          ) : (
            <DaapLogo className={css.logo} />
          )}

          <div className={css.leftActionHolder}>
            <div>
              <ButtonGroup minimal={true} className={css.mainButtons}>
                <Button
                  minimal
                  icon={<AddObjectIcon width={25} height={25} />}
                  onClick={() => {
                    const event = new CustomEvent("OPEN_CREATE_NEW");
                    window.dispatchEvent(event);
                  }}
                >
                  Create
                </Button>

                <Button
                  minimal
                  className={css.largeButton}
                  icon={<LibraryIcon width={25} height={25} />}
                  onClick={() => {
                    const event = new CustomEvent("OPEN_PROJECTS");
                    window.dispatchEvent(event);
                  }}
                >
                  Documents
                </Button>

                <Divider dir="horizontal" />

                <Button
                  minimal
                  className={css.largeButton}
                  icon={<Icon icon="applications" size={25} />}
                  onClick={() => {
                    const event = new CustomEvent("OPEN_TEMPLATES");
                    window.dispatchEvent(event);
                  }}
                >
                  Templates
                </Button>

                {canUseLayouts && (
                  <>
                    <Divider dir="horizontal" />
                    <Button
                      minimal
                      className={css.largeButton}
                      icon={<Icon icon="page-layout" size={25} />}
                      onClick={() => {
                        const event = new CustomEvent("OPEN_LAYOUTS");
                        window.dispatchEvent(event);
                      }}
                    >
                      Layouts
                    </Button>
                  </>
                )}

                {platform.hasLayoutsButton &&
                  canUseLayouts && (
                    <>
                      <Divider dir="horizontal" />

                      <Button
                        minimal
                        className={css.largeButton}
                        icon={<ExtensionsIcon width={25} height={25} />}
                        onClick={() => {
                          const event = new CustomEvent("OPEN_EXTENSIONS");
                          window.dispatchEvent(event);
                        }}
                      >
                        {outdatedExtensions?.length > 0 && (
                          <Tag
                            intent={"danger"}
                            round
                            className={css.buttonTag}
                            large={false}
                          >
                            {outdatedExtensions.length}
                          </Tag>
                        )}
                        Extensions
                      </Button>
                    </>
                  )}

                <Divider dir="horizontal" />

                <Button
                  minimal
                  icon={<Icon icon="floppy-disk" size={25} />}
                  onClick={() => {
                    const event = new CustomEvent("OPEN_SAVE");
                    window.dispatchEvent(event);
                  }}
                >
                  Save
                </Button>

                <ButtonGroup minimal={true}>
                  <Button
                    minimal
                    icon={<Icon icon="export" size={25} />}
                    onClick={() => {
                      const event = new CustomEvent("OPEN_EXPORT");
                      window.dispatchEvent(event);
                    }}
                  >
                    Export
                  </Button>
                </ButtonGroup>


                <Divider dir="horizontal" />

                <div className={css.projectNameHolder}>
                  <Text ellipsize style={{ maxWidth: "200px" }}>
                    {meta.name}
                  </Text>
                  <div style={{ fontFamily: "monospace" }}>
                    {breakpointConfig?.normal.page.width}x
                    {breakpointConfig?.normal.page.height}
                  </div>
                </div>
              </ButtonGroup>
            </div>
          </div>
        </div>
        <div className={css.center}></div>

        <div className={css.right}>
          <>
            <ChangeCheckerButton
              onDenied={() => {}}
              className={css.largeButton}
              // large
              style={{ color: "rgb(110 240 239)" }}
              minimal
              icon={
                <Icon
                  style={{ color: "rgb(110 240 239)" }}
                  icon="search"
                  size={20}
                />
              }
              onAllow={() => {
                navigate(`/search`);
              }}
              confirmButtonText="Discard & Go to Search"
            >
              Search
            </ChangeCheckerButton>

            <AccountComponent placement="editor-header" />

            <FullscreenButtonComponent
              toggle={() => {
                _updateEditor({ fullScreen: !fullScreen });
              }}
              isFullscreen={fullScreen}
            />
          </>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state: IStore) => {
  const breakpointConfig: BreakpointConfiguration | undefined =
    state.project.settings.breakpoints.breakpointsConfiguration.find(
      (breakpointConfig: any) =>
        breakpointConfig.type === state.stage.selectedDevice,
    );

  return {
    meta: state.meta,
    canUseLayouts: state.globals.canUseLayouts ?? false,
    breakpointConfig,
    fullScreen: state.editor.fullScreen,
    outdatedExtensions: state.editor.outdatedExtensions,
  };
};

const mapDispatchToProps = {
  _updateEditor: (editor: Partial<IEditor>) => updateEditor(editor),
};

export default connect(mapStateToProps, mapDispatchToProps)(MainHeader);
