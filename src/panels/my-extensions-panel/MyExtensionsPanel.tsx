import React, { useContext, useEffect, useRef, useState } from "react";
import cx from "classnames";
import InfiniteScroll from "react-infinite-scroll-component";
import { debounce, filter } from "lodash-es";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import { Alert, Button, InputGroup, Intent, Spinner } from "@blueprintjs/core";
import { IntegrationContext } from "../../integration";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import css from "./MyExtensionsPanel.module.scss";
import { loadAndRegisterExternalComponent } from "../../objects/external-object-utils";
import { IExtensionItem } from "../../webslider-sdk/src/objects/i-extensions";
import { logger } from "../../webslider-sdk/src/utils/logger/logger";

interface IExtensionsPanelProps {
  onRequestClose: () => void;
}

export type IExtensionsPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IExtensionsPanelProps;

const MyExtensionsPanel: React.FC<IExtensionsPanelMergedProps> = (props) => {
  const { onRequestClose, _registerObject, _unregisterObject } = props;

  const [extensions, setExtensions] = useState<IExtensionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [searchValue, setSearchValue] = useState<string>("");
  const [isUninstallOpen, setIsUninstallOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUninstallOrDeleteLoading, setUninstallOrDeleteLoading] =
    useState(false);
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
  const UploadComponent = globalContext?.getMyUploadComponent;
  const { fetchImages, deleteImages } = globalContext.useMyMediaHook();

  useEffect(() => {
    getInstalledExtensions().then((res: { items: IExtensionItem[] }) => {
      setInstalledExtensions(res.items);
    });
  }, []);

  const fetchData = (from = -1) => {
    setLoading(true);

    from = from === -1 ? extensions?.length || 0 : from;

    fetchImages({
      type: "extension",
      from: 0,
      search: searchValue,
      perPage: 100000,
    }).then(
      (result) => {
        if (from === 0) {
          setExtensions([...result.data]);
        } else {
          setExtensions([...extensions, ...result.data]);
        }
        setLoading(false);
        setHasMore(result.data.length > 0);
      },

      (error) => {
        logger.error(error);
      }
    );
  };

  const debounceFetchData = debounce((from = -1) => fetchData(from), 100);

  useEffect(() => {
    debounceFetchData();
  }, []);

  const uninstallOrDelIdRef = useRef<IExtensionItem | undefined>();
  const onUninstall = (extension: IExtensionItem) => {
    setIsUninstallOpen(true);
    uninstallOrDelIdRef.current = extension;
  };

  const uninstallConfirm = () => {
    setUninstallOrDeleteLoading(true);

    if (!uninstallOrDelIdRef.current?.id) return;

    uninstallExtension({
      id: uninstallOrDelIdRef.current.id,
      source: "local",
    }).then((mItem?: Partial<IExtensionItem>) => {
      getInstalledExtensions().then((res) => {
        setInstalledExtensions(res.items);
      });

      setIsUninstallOpen(false);
      setUninstallOrDeleteLoading(false);

      AppToaster.show({
        intent: "success",
        message: `Extension "${mItem?.name}" is successfully uninstalled.`,
      });
    });
  };

  const uninstallCancel = () => {
    setIsUninstallOpen(false);
    setUninstallOrDeleteLoading(false);
  };

  const onDelete = (extension: IExtensionItem) => {
    setIsDeleteOpen(true);
    uninstallOrDelIdRef.current = extension;
  };

  const deleteConfirm = () => {
    setUninstallOrDeleteLoading(true);

    if (!uninstallOrDelIdRef.current?.id) return;

    deleteImages("extension", [`${uninstallOrDelIdRef.current.id}`]).then(
      (resp) => {
        debounceFetchData(0);

        getInstalledExtensions().then((res) => {
          setInstalledExtensions(res.items);
        });

        setIsDeleteOpen(false);
        setUninstallOrDeleteLoading(false);

        AppToaster.show({
          intent: "success",
          message: `Extension is successfully deleted.`,
        });
      }
    );
  };

  const deleteCancel = () => {
    setIsDeleteOpen(false);
    setUninstallOrDeleteLoading(false);
  };

  const onInstall = (item: IExtensionItem) => {
    setCurrentlyInstallingExtensions({
      ...currentlyInstallingExtensions,
      [item.type]: true,
    });
    installExtension({ ...item, source: "local" }).then((mItem) => {
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
        setInstalledExtensions(res.items);
      });
    });
  };

  console.log(installedExtensions);
  if (!installedExtensions) {
    return null;
  }
  return (
    <div className={css.extensionsPanel}>
      <UploadComponent
        type="extension"
        onComplete={() => {
          debounceFetchData(0);
          //setForceUpdate(Math.random());
        }}
        onStop={() => {
          debounceFetchData(0);
          //setForceUpdate(Math.random());
        }}
      />
      <div className={css.headerSection}>
        <InputGroup
          large
          leftIcon="search"
          placeholder="Extend your app..."
          rightElement={
            <Button
              large
              icon="arrow-right"
              onClick={() => {
                setExtensions(() => []);
                debounceFetchData(0);
              }}
            />
          }
          value={searchValue}
          onChange={(event: any) => {
            setSearchValue((event.currentTarget as HTMLInputElement).value);
          }}
          onKeyPress={(event) => {
            if (event.key === "Enter") {
              setExtensions(() => []);
              debounceFetchData(0);
            }
          }}
        ></InputGroup>
      </div>

      <div className={cx(css.headerSection, css.tableHeader)}>
        {/*<div className={css.id}>ID</div>*/}
        <div className={css.thumb}></div>
        <div className={css.name}>Name &amp; Description</div>
        <div className={css.created}>Created</div>
        <div className={css.modified}>Modified</div>
        <div className={css.action}>Action</div>
      </div>

      <div className={css.mainSection} id="mediaHolder">
        <InfiniteScroll
          dataLength={extensions?.length || -1} //This is important field to render the next data
          next={debounceFetchData}
          hasMore={hasMore}
          loader={
            <div style={{ textAlign: "center", margin: "20px" }}>
              <Spinner size={50} />
            </div>
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
                <b>There are no project for the selected criteria.</b>
              ) : (
                <b>All projects are loaded for the selected criteria.</b>
              )}
            </p>
          }
        >
          {extensions?.map((extension, idx) => (
            <div key={extension.type}>
              <div className={cx(css.headerSection, css.tableRow)}>
                {/*<div className={css.id}>{extension.id}</div>*/}
                <div className={css.thumb}>
                  <div
                    className={css.thumbHolder}
                    dangerouslySetInnerHTML={{ __html: extension.logoUrl }}
                  ></div>
                </div>
                <div className={css.name}>
                  <span className={css["type-" + extension.componentType]}>
                    {extension.componentType.toUpperCase()}
                  </span>
                  <br />
                  {extension.name}
                  <br />
                  <span className={css.description}>
                    {extension.description}
                  </span>
                </div>
                <div className={css.created}>
                  {new Date(extension.created).toLocaleDateString()}
                  <br />
                  {new Date(extension.created).toLocaleTimeString()}
                </div>
                <div className={css.modified}>
                  {new Date(extension.modified).toLocaleDateString()}
                  <br />
                  {new Date(extension.modified).toLocaleTimeString()}
                </div>
                <div className={css.action}>
                  {installedExtensions &&
                    !installedExtensions?.find(
                      (item) => item.id === extension.id
                    ) && (
                      <div className={css.actionHolder}>
                        <Button
                          disabled={
                            currentlyInstallingExtensions[extension.type]
                          }
                          intent="primary"
                          onClick={() => onInstall(extension)}
                        >
                          {currentlyInstallingExtensions[extension.type]
                            ? "Installing..."
                            : "Install"}
                        </Button>
                        <br />
                        <Button
                          disabled={
                            currentlyInstallingExtensions[extension.type]
                          }
                          intent="danger"
                          onClick={() => onDelete(extension)}
                        >
                          Delete
                        </Button>
                      </div>
                    )}

                  {installedExtensions &&
                    !!installedExtensions?.find(
                      (item) => item.id === extension.id
                    ) && (
                      <>
                        <p className={css.installedMessage}>
                          Component is installed.
                        </p>
                        <Button
                          intent="none"
                          onClick={() => onUninstall(extension)}
                        >
                          Uninstall
                        </Button>
                      </>
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
        loading={isUninstallOrDeleteLoading}
        intent={Intent.DANGER}
        isOpen={isUninstallOpen}
        onCancel={uninstallCancel}
        onConfirm={uninstallConfirm}
        className="bp3-dark"
      >
        <p>
          If component is used in some projects it won't be available and
          visible after uninstallation.
        </p>
        <p>
          Are you sure you want to uninstall{" "}
          <b>{uninstallOrDelIdRef?.current?.name}</b> extension?
        </p>
      </Alert>
      <Alert
        cancelButtonText="Cancel"
        confirmButtonText="Delete"
        canOutsideClickCancel={false}
        icon="trash"
        loading={isUninstallOrDeleteLoading}
        intent={Intent.DANGER}
        isOpen={isDeleteOpen}
        onCancel={deleteCancel}
        onConfirm={deleteConfirm}
        className="bp3-dark"
      >
        <p>
          Are you sure you want to delete{" "}
          <b>{uninstallOrDelIdRef?.current?.name}</b> extension?
        </p>
      </Alert>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({});

const mapDispatchToProps = {
  _registerObject: (extObjectDef: any) => undefined,
  _unregisterObject: (extObjectDef: any) => undefined,
};

export default connect(mapStateToProps, mapDispatchToProps)(MyExtensionsPanel);
