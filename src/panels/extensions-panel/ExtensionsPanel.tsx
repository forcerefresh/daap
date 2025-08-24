import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import cx from "classnames";
import InfiniteScroll from "react-infinite-scroll-component";
import { debounce } from "lodash-es";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import {
  Alert,
  Button,
  Checkbox,
  FormGroup,
  InputGroup,
  Intent,
  Spinner,
} from "@blueprintjs/core";
import { IntegrationContext } from "../../integration";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import css from "./ExtensionsPanel.module.scss";
import { loadAndRegisterExternalComponent } from "../../objects/external-object-utils";
import { unregisterObject } from "webslider-sdk/lib/objects/objects-register";
import { IExtensionItem } from "webslider-sdk/lib/objects/i-extensions";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { checkIfAssetsServiceHasError } from "../../utils/api-services/api-services-utils";
import { unregisterAnimation } from "webslider-sdk/lib/animations/animations-register";
import { IEditor } from "../../store/reducers/editor";
import { updateEditor } from "../../store/actions/actions";
import { removeExtensionFromMissing } from "../../utils/extensions/extensions-utils";
import { RightPanelHeader } from "../common/panel-header/PanelHeader";
import { ExternalSVG } from "./external-svg";
import { getLatestVersionsMap } from "../../objects/objectToolFactory";
import { getCheckboxField } from "../../inputs/input-utils";

interface IExtensionsPanelProps {
  onRequestClose: () => void;
}

export type IExtensionsPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IExtensionsPanelProps;

const ExtensionsPanel: React.FC<IExtensionsPanelMergedProps> = (props) => {
  const { _updateEditor, missingExtensions, outdatedExtensions } = props;

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [extensions, setExtensions] = useState<IExtensionItem[]>([]);
  const [extensionsMerged, setExtensionsMerged] = useState<
    (IExtensionItem & {
      installedExtension: IExtensionItem;
      installed: boolean;
      upToDate: boolean;
    })[]
  >([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [searchValue, setSearchValue] = useState<string>("");
  const [isUninstallOpen, setIsUninstallOpen] = useState(false);
  const [isUninstallLoading, setUninstallLoading] = useState(false);
  const [installedExtensions, setInstalledExtensions] =
    useState<IExtensionItem[]>();

  const [currentlyInstallingExtensions, setCurrentlyInstallingExtensions] =
    useState<{ [key: string]: boolean }>({});

  const globalContext = useContext(IntegrationContext);
  const {
    getExtensions,
    installExtension,
    uninstallExtension,
    getInstalledExtensions,
  } = globalContext.useExtensionsHook();

  const { getLicenseDetails } = globalContext.useLicenseHook();

  const [apiKey, setApiKey] = useState<string | undefined>();
  const apiKeyRef = useRef<string | undefined>();

  useEffect(() => {
    getLicenseDetails().then((data) => {
      apiKeyRef.current = data.apiKey;
      setApiKey(data.apiKey);
      debounceFetchData();
    });
  }, []);

  useEffect(() => {
    getInstalledExtensions().then((res: { data: IExtensionItem[] }) => {
      setInstalledExtensions(res.data);
    });
  }, []);

  const cachedMissingExtensions = useMemo(
    () => missingExtensions.map((item) => item.type),
    []
  );

  const fetchData = (from = -1) => {
    // if (!apiKey) return;

    setLoading(true);

    from = from === -1 ? extensions?.length || 0 : from;

    getExtensions(
      from,
      searchValue,
      undefined,
      cachedMissingExtensions,
      apiKeyRef.current
    ).then(
      (result) => {
        const err = checkIfAssetsServiceHasError(result);
        if (err) {
          setErrorMessage(err);
          return;
        }
        if (from === 0) {
          setExtensions([...result.data]);
        } else {
          setExtensions([...extensions, ...result.data]);
        }
        setLoading(false);
        setHasMore(result.data.length > 0);
      },

      (error) => {
        logger.app.error(error);
      }
    );
  };

  const debounceFetchData = debounce((from = -1) => fetchData(from), 100);

  useEffect(() => {
    // debounceFetchData();
  }, []);

  const uninstallIdRef = useRef<IExtensionItem | undefined>();
  const onUninstall = (extension: IExtensionItem) => {
    setIsUninstallOpen(true);
    uninstallIdRef.current = extension;
  };

  const uninstallConfirm = () => {
    setUninstallLoading(true);

    if (!uninstallIdRef.current?.type) return;

    uninstallExtension({
      type: uninstallIdRef.current.type,
      source: "marketplace",
    }).then((mItem?: Partial<IExtensionItem>) => {
      getInstalledExtensions().then((res) => {
        setInstalledExtensions(res.data);
      });

      if (mItem?.extensionType === "object") {
        unregisterObject(mItem.type!);
      }
      if (mItem?.extensionType === "animation") {
        unregisterAnimation(mItem.type!);
      }

      setIsUninstallOpen(false);
      setUninstallLoading(false);

      AppToaster.show({
        intent: "success",
        message: `Extension "${mItem?.name}" is successfully uninstalled.`,
      });
    });
  };

  const uninstallCancel = () => {
    setIsUninstallOpen(false);
    setUninstallLoading(false);
  };

  const onInstall = (item: IExtensionItem) => {
    setCurrentlyInstallingExtensions({
      ...currentlyInstallingExtensions,
      [item.type]: true,
    });

    installExtension({ ...item, source: "marketplace" }).then((mItem) => {
      loadAndRegisterExternalComponent(mItem).then(() => {});

      AppToaster.show({
        intent: "success",
        message: `Extension "${mItem.name}" is successfully installed.`,
      });

      setCurrentlyInstallingExtensions({
        ...currentlyInstallingExtensions,
        [mItem.type]: false,
      });

      getInstalledExtensions().then((res) => {
        setInstalledExtensions(res.data);
      });

      const newMissingExtensions = removeExtensionFromMissing(
        missingExtensions,
        mItem.type
      );
      _updateEditor({
        missingExtensions: newMissingExtensions,
        outdatedExtensions: outdatedExtensions.filter(
          (ext) => ext.type !== item.type
        ),
      });
    });
  };

  // if (!installedExtensions) {
  //   return null;
  // }

  const [filter, setFilter] = useState({ onlyInstalled: false });

  useEffect(() => {
    if (!extensions) return;

    const installedExtensionsMap = installedExtensions
      ? getLatestVersionsMap(installedExtensions)
      : new Map();

    const merged = extensions.map((extension) => {
      const installedExtension = installedExtensionsMap.get(extension.type);
      return {
        ...extension,
        installedExtension,
        installed: !!installedExtension,
        upToDate: extension.version === installedExtension?.version,
      };
    });

    const filtered = merged
      .filter((ext) => !filter.onlyInstalled || ext.installed)
      .filter((ext) => {
        if (searchValue === "") return true;
        if (new RegExp(searchValue, "i").test(ext.name)) return true;
        return false;
      })
      .sort((a, b) => (a.installed && !a.upToDate ? -1 : 1));

    setExtensionsMerged(filtered);
  }, [extensions, installedExtensions, filter, searchValue]);

  return (
    <div className={cx("bp5-dark", css.extensionsPanel)}>
      <RightPanelHeader>
        <div>EXTENSIONS</div>
      </RightPanelHeader>

      <div className={css.headerSection}>
        <InputGroup
          style={{ marginBottom: "10px" }}
          large
          leftIcon="search"
          placeholder="Extend your app..."
          // rightElement={
          //   <Button
          //     large
          //     icon="arrow-right"
          //     onClick={() => {
          //       setExtensions(() => []);
          //       debounceFetchData(0);
          //     }}
          //   />
          // }
          value={searchValue}
          onChange={(event: any) => {
            setSearchValue((event.currentTarget as HTMLInputElement).value);
          }}
          // onKeyPress={(event) => {
          //   if (event.key === "Enter") {
          //     setExtensions(() => []);
          //     debounceFetchData(0);
          //   }
          // }}
        ></InputGroup>

        <div className="input60">
          {getCheckboxField(
            "Only installed",
            filter.onlyInstalled,
            (onlyInstalled: any) => {
              setFilter((prev) => ({
                ...prev,
                onlyInstalled: onlyInstalled,
              }));
            },
            "",
            { alignIndicator: "left" }
          )}
        </div>
        {/* <Checkbox
          alignIndicator=""
          label="Only installed"
          checked={filter.onlyInstalled}
          onChange={() => {}}
        /> */}
      </div>

      {/* <div className={cx(css.headerSection, css.tableHeader)}>
        <div className={css.id}>ID</div>
        <div className={css.thumb}></div>
        <div className={css.nameAndDesc}>Name &amp; Description</div>
         <div className={css.created}>Created</div>
        <div className={css.modified}>Modified</div> 
        <div className={css.action}>Action</div>
      </div> */}

      <div className={css.mainSection} id="mediaHolder">
        {/* {!apiKey && (
          <div className="error">
            {
              "API KEY is not found. Goto Settings > Licenses and enter valid serial number."
            }
          </div>
        )} */}
        {!!errorMessage && <div className="error">{errorMessage}</div>}
        <InfiniteScroll
          dataLength={extensions?.length || -1} //This is important field to render the next data
          next={debounceFetchData}
          hasMore={false} //{hasMore}
          loader={
            apiKey &&
            !errorMessage && (
              <div style={{ textAlign: "center", margin: "20px" }}>
                <Spinner size={50} />
              </div>
            )
          }
          scrollableTarget="mediaHolder"
          scrollThreshold="5px"
          endMessage={
            <p
              style={{
                textAlign: "center",
                display: loading ? "none" : "block",
              }}
            >
              {extensions.length === 0 ? (
                <b>No extensions were found for the chosen criteria.</b>
              ) : (
                <b>All extensions have been loaded for the chosen criteria.</b>
              )}
            </p>
          }
        >
          {extensionsMerged?.map((extension, idx) => (
            <div key={extension.type}>
              <div
                className={cx(css.headerSection, css.tableRow, {
                  [css.missingExtension]: cachedMissingExtensions.includes(
                    extension.type
                  ),
                })}
              >
                {/*<div className={css.id}>{extension.id}</div>*/}
                <div className={css.thumb}>
                  <div className={css.thumbHolder}>
                    <ExternalSVG
                      fallbackSrc=""
                      src={`https://extensions.bucket.forcerefresh.io/${extension.type}/${extension.version}/icon.svg`}
                    />
                  </div>
                </div>
                <div className={css.nameAndDesc}>
                  <div>
                    <div className={css.name}>{extension.name}</div>
                    <div className={css.version}>
                      {extension.installed && !extension.upToDate ? (
                        <div className={css.newVersionAvailable}>
                          Version {extension.version} is available{" "}
                        </div>
                      ) : (
                        <strong> {extension.version}</strong>
                      )}
                    </div>
                  </div>
                  <div className={css.description}>{extension.description}</div>
                  <div className={css["type-" + extension.extensionType]}>
                    {extension.extensionType.toUpperCase()}
                  </div>
                </div>
                {/* <div className={css.created}>
                  {new Date(extension.created).toLocaleDateString()}
                  <br />
                  {new Date(extension.created).toLocaleTimeString()}
                </div>
                <div className={css.modified}>
                  {new Date(extension.modified).toLocaleDateString()}
                  <br />
                  {new Date(extension.modified).toLocaleTimeString()}
                </div> */}
                <div className={css.action}>
                  {(!extension.installed || !extension.upToDate) && (
                    <Button
                      disabled={
                        extension.licenseDisabled ||
                        currentlyInstallingExtensions[extension.type]
                      }
                      intent="primary"
                      onClick={() => onInstall(extension)}
                    >
                      {currentlyInstallingExtensions[extension.type]
                        ? "Installing..."
                        : extension.installed && !extension.upToDate
                        ? "Upgrade"
                        : "Install"}
                    </Button>
                  )}

                  {installedExtensions &&
                    !!installedExtensions?.find(
                      (item) => item.type === extension.type
                    ) && (
                      <>
                        {/* <p className={css.installedMessage}>
                          Component is installed.
                        </p> */}
                        <Button
                          intent="none"
                          onClick={() => onUninstall(extension)}
                        >
                          Uninstall
                        </Button>
                      </>
                    )}
                  {extension.licenseDisabled && (
                    <div className={css.licenseRequired}>LICENSE REQUIRED</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </InfiniteScroll>
      </div>
      <Alert
        cancelButtonText="Cancel"
        confirmButtonText="Uninstall"
        canOutsideClickCancel={false}
        icon="trash"
        loading={isUninstallLoading}
        intent={Intent.DANGER}
        isOpen={isUninstallOpen}
        onCancel={uninstallCancel}
        onConfirm={uninstallConfirm}
        className="bp5-dark"
      >
        <p>
          Are you sure you want to uninstall{" "}
          <b>{uninstallIdRef?.current?.name}</b> object?
        </p>
      </Alert>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  missingExtensions: state.editor.missingExtensions,
  outdatedExtensions: state.editor.outdatedExtensions,
});

const mapDispatchToProps = {
  _registerObject: (extObjectDef: any) => undefined,
  _unregisterObject: (extObjectDef: any) => undefined,
  _updateEditor: (editor: Partial<IEditor>) => updateEditor(editor),
};

export default connect(mapStateToProps, mapDispatchToProps)(ExtensionsPanel);
