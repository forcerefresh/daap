import React, { useContext, useEffect, useRef, useState } from "react";
import cx from "classnames";
import InfiniteScroll from "react-infinite-scroll-component";
import { debounce } from "lodash-es";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import { Alert, Button, InputGroup, Intent, Spinner } from "@blueprintjs/core";
import { IntegrationContext } from "../../integration";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import css from "./MarketplacePanel.module.scss";
import { loadAndRegisterExternalComponent } from "../../objects/external-object-utils";
import { IMarketItem } from "../../webslider-sdk/src/objects/i-marketplace";
import { logger } from "../../webslider-sdk/src/utils/logger/logger";

interface IMarketplacePanelProps {
  onRequestClose: () => void;
}

export type IMarketplaceMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IMarketplacePanelProps;

const MarketplacePanel: React.FC<IMarketplaceMergedProps> = (props) => {
  const { onRequestClose, _registerObject, _unregisterObject } = props;

  const [marketItems, setMarketItems] = useState<IMarketItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [searchValue, setSearchValue] = useState<string>("");
  const [isUninstallOpen, setIsUninstallOpen] = useState(false);
  const [isUninstallLoading, setUninstallLoading] = useState(false);
  const [installedMarketItems, setInstalledMarketItems] =
    useState<IMarketItem[]>();

  const globalContext = useContext(IntegrationContext);
  const {
    getMarketItems,
    installMarketItem,
    uninstallMarketItem,
    getInstalledMarketItems,
  } = globalContext.useMarketplaceHook();
  const UploadComponent = globalContext?.getMyUploadComponent;

  useEffect(() => {
    (() => {
      return getInstalledMarketItems();
    })().then((res: { items: IMarketItem[] }) => {
      setInstalledMarketItems(res.items);
    });
  }, []);

  const fetchData = (from = -1) => {
    setLoading(true);

    from = from === -1 ? marketItems?.length || 0 : from;

    getMarketItems(from, searchValue).then(
      (result) => {
        if (from === 0) {
          setMarketItems([...result.items]);
        } else {
          setMarketItems([...marketItems, ...result.items]);
        }
        setLoading(false);
        setHasMore(result.items.length > 0);
      },

      (error) => {
        logger.error(error);
      }
    );
  };

  useEffect(() => {
    debounceFetchData();
  }, []);

  const debounceFetchData = debounce((from = -1) => fetchData(from), 100);

  const uninstallIdRef = useRef<IMarketItem | undefined>();
  const onUninstall = (marketItem: IMarketItem) => {
    setIsUninstallOpen(true);
    uninstallIdRef.current = marketItem;
  };

  const uninstallConfirm = () => {
    setUninstallLoading(true);

    if (!uninstallIdRef.current?.id) return;

    uninstallMarketItem(uninstallIdRef.current.id).then(
      ({ id }: { id: number }) => {
        getInstalledMarketItems().then((res) => {
          setInstalledMarketItems(res.items);
        });

        setIsUninstallOpen(false);
        setUninstallLoading(false);
        AppToaster.show({
          intent: "success",
          message: "Object is successfully uninstalled.",
        });
      }
    );
  };

  const uninstallCancel = () => {
    setIsUninstallOpen(false);
    setUninstallLoading(false);
  };

  const onInstall = (item: IMarketItem) => {
    installMarketItem(item).then((mItem) => {
      loadAndRegisterExternalComponent(mItem).then(() => {});

      AppToaster.show({
        intent: "success",
        message: `Market component "${mItem.name}" is successfully installed.`,
      });

      getInstalledMarketItems().then((res) => {
        setInstalledMarketItems(res.items);
      });
    });
  };

  if (!installedMarketItems) {
    return null;
  }
  return (
    <div className={css.marketplacePanel}>
      <UploadComponent
        type="extension"
        onComplete={() => {
          //setForceUpdate(Math.random());
        }}
        onStop={() => {
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
                setMarketItems(() => []);
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
              setMarketItems(() => []);
              debounceFetchData(0);
            }
          }}
        ></InputGroup>
      </div>

      <div className={cx(css.headerSection, css.tableHeader)}>
        <div className={css.id}>ID</div>
        <div className={css.thumb}></div>
        <div className={css.name}>Name &amp; Description</div>
        <div className={css.created}>Created</div>
        <div className={css.modified}>Modified</div>
        <div className={css.action}>Action</div>
      </div>

      <div className={css.mainSection} id="mediaHolder">
        <InfiniteScroll
          dataLength={marketItems?.length || -1} //This is important field to render the next data
          next={debounceFetchData}
          hasMore={hasMore}
          loader={
            <p style={{ textAlign: "center", margin: "20px" }}>
              <Spinner size={50} />
            </p>
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
              {marketItems.length === 0 ? (
                <b>There are no project for the selected criteria.</b>
              ) : (
                <b>All projects are loaded for the selected criteria.</b>
              )}
            </p>
          }
        >
          {marketItems?.map((marketItem, idx) => (
            <>
              <div className={cx(css.headerSection, css.tableRow)}>
                <div className={css.id}>{marketItem.id}</div>
                <div className={css.thumb}>
                  <div className={css.thumbHolder}>
                    <img
                      src={`${process.env.REACT_APP_MARKETPLACE_BASE_URL}/${marketItem.logoUrl}`}
                    ></img>
                  </div>
                </div>
                <div className={css.name}>
                  <span className={css["type-" + marketItem.componentType]}>
                    {marketItem.componentType.toUpperCase()}
                  </span>
                  <br />
                  {marketItem.name}
                  <br />
                  <span className={css.description}>
                    {marketItem.description}
                  </span>
                </div>
                <div className={css.created}>
                  {new Date(marketItem.created).toLocaleDateString()}
                  <br />
                  {new Date(marketItem.created).toLocaleTimeString()}
                </div>
                <div className={css.modified}>
                  {new Date(marketItem.modified).toLocaleDateString()}
                  <br />
                  {new Date(marketItem.modified).toLocaleTimeString()}
                </div>
                <div className={css.action}>
                  {installedMarketItems &&
                    !installedMarketItems?.find(
                      (item) => item.id === marketItem.id
                    ) && (
                      <Button
                        intent="primary"
                        onClick={() => onInstall(marketItem)}
                      >
                        Install
                      </Button>
                    )}

                  {installedMarketItems &&
                    !!installedMarketItems?.find(
                      (item) => item.id === marketItem.id
                    ) && (
                      <>
                        <p className={css.installedMessage}>
                          Component is installed.
                        </p>
                        <Button
                          intent="none"
                          onClick={() => onUninstall(marketItem)}
                        >
                          Uninstall
                        </Button>
                      </>
                    )}
                </div>
              </div>
            </>
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
        className="bp3-dark"
      >
        <p>
          Are you sure you want to uninstall{" "}
          <b>{uninstallIdRef?.current?.name}</b> object?
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

export default connect(mapStateToProps, mapDispatchToProps)(MarketplacePanel);
