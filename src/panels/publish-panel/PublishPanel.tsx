import React, { useContext, useEffect, useState } from "react";
import { Popover2, Popover2InteractionKind } from "@blueprintjs/popover2";
import cx from "classnames";
import { omit } from "lodash-es";
import { connect } from "react-redux";
import {
  Button,
  FormGroup,
  InputGroup,
  Menu,
  MenuItem,
} from "@blueprintjs/core";
import { IStore } from "../../store/store";
import css from "./PublishPanel.module.scss";
import { updateProjectMeta, updateEditor } from "../../store/actions/actions";
import { IntegrationContext } from "../../integration";
import { IMeta } from "../../store/reducers/meta";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import { IEditor } from "../../store/reducers/editor";
import { ObjectStorageItem } from "../../integration/hooks/object-storage-hook/i-object-storage-hook";
import ConfirmButton from "../../utils/components/confirm-button/confirm-button";
import { base64ToBlob, downloadBlob } from "../../utils/file/file-utils";
import copyToClipboard from "copy-to-clipboard";

interface IPublishPanelProps {
  onRequestClose: () => void;
  onChange: () => void;
}

export type IPublishPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IPublishPanelProps;

const PublishPanel: React.FC<IPublishPanelMergedProps> = (props) => {
  const { meta, onChange } = props;

  const globalContext = useContext(IntegrationContext);
  const {
    publishToStorageObject,
    listStorageObjects = (p: any) => Promise.resolve([]),
    assignBucketToProject,
    removeBucketFromProject,
    getAssignedBucketIds = (p: any) => Promise.resolve([]),
    subscribeToPublishDetails,
    openPublishUrl,
    getPublishDetails,
    downloadPackage,
  } = globalContext.useObjectStorageHook();

  const [allBuckets, setAllBuckets] = useState<ObjectStorageItem[]>([]);
  const [assignedIds, setAssignedIds] = useState<string[]>([]);

  const [assignedBuckets, setVisibleBuckets] = useState<ObjectStorageItem[]>(
    []
  );

  const [publishLogs, setPublishLogs] = useState<string[]>([]);

  const [integrationDetailsOpen, setIntegrationDetailsOpen] = useState<{
    [key: string]: boolean;
  }>({});

  const [integrationDetails, setIntegrationDetails] = useState<{
    [key: string]: { indexUrl: string; jsonUrl: string; playerUrl: string };
  }>({});

  useEffect(() => {
    reloadStorageObjects();
    reloadAssignedIds();
  }, []);

  const reloadStorageObjects = () => {
    listStorageObjects({ projectId: meta.id! }).then((result) => {
      setAllBuckets(result);
    });
  };
  const reloadAssignedIds = () => {
    getAssignedBucketIds({ projectId: meta.id! }).then((result) => {
      setAssignedIds(result);
    });
  };

  useEffect(() => {
    const viz = allBuckets.filter(
      (bucket) => assignedIds.indexOf(bucket.id!) !== -1
    );
    setVisibleBuckets(viz);
  }, [allBuckets, assignedIds]);

  const bucketListMenu = (
    <Menu>
      {allBuckets.map((bucket) => (
        <MenuItem
          disabled={assignedIds.indexOf(bucket.id!) !== -1}
          text={
            `${bucket.bucketName} (${bucket.platform})` +
            (assignedIds.indexOf(bucket.id!) !== -1 ? " (assigned)" : "")
          }
          onClick={() => {
            assignBucketToProject({
              projectId: meta.id!,
              bucketId: bucket.id!,
            }).then((res) => {
              if (res.status === "OK") {
                AppToaster.show({
                  intent: "success",
                  message: "Bucket is successfully assigned to project.",
                });
                onChange();
              } else if (res.status === "ERROR") {
                AppToaster.show({
                  intent: "danger",
                  message: "Bucket is NOT assigned. Error: " + res.error,
                });
              }
              reloadAssignedIds();
              reloadStorageObjects();
            });
          }}
        />
      ))}
    </Menu>
  );

  const noBucketAlert = () => {
    AppToaster.show({
      intent: "warning",
      message: `You have no bucket. Please go to "Settings > Object Storage" in order to add bucket.`,
    });
  };
  return (
    <div className={cx("bp3-dark", css.publishPanel)}>
      <div className={css.panelHeader}>
        <div>PUBLISH PANEL</div>
      </div>
      <div className={css.publishHolder}>
        <div className={css.sectionHeader}>
          <div>BUCKETS</div>

          <Popover2
            content={allBuckets?.length > 0 ? bucketListMenu : <></>}
            placement="left-end"
            shouldReturnFocusOnClose={false}
            interactionKind={Popover2InteractionKind.CLICK}
            hoverCloseDelay={10}
            hoverOpenDelay={15}
          >
            <Button
              minimal
              onClick={() => {
                if (allBuckets?.length === 0) noBucketAlert();
              }}
              className={css.addNewBucket}
              small={true}
              icon="add"
            >
              Assign bucket to this project
            </Button>
          </Popover2>
        </div>
        {assignedBuckets.map((bucket) => (
          <div className={css.bucketItem}>
            <p>
              Bucket:
              <strong>
                {" "}
                {bucket.bucketName} ({bucket.platform})
              </strong>
            </p>
            {bucket.description && <p>Description: {bucket.description} </p>}
            {bucket.assignedProject?.revision === meta.saveRevision ? (
              <p className={css.inSync}>
                Status: Publish is in sync with save. <br />
                Publish revision: {bucket.assignedProject?.revision}
                <br /> Save revision: {meta.saveRevision}
              </p>
            ) : (
              <p className={css.notInSync}>
                Status: Publish is NOT in sync with save. <br />
                Publish revision: {bucket.assignedProject?.revision}
                <br /> Save revision: {meta.saveRevision}
              </p>
            )}

            <p>
              <ConfirmButton
                loadingText="Publishing to bucket ..."
                logs={publishLogs}
                hasActionOnConfirm={true}
                successMsg="Publish is done!"
                intent="primary"
                onClose={() => {
                  setPublishLogs((publishLogs) => []);
                }}
                onConfirm={(doneCallback) => {
                  const unsubscribe = subscribeToPublishDetails((details) => {
                    setPublishLogs((publishLogs) => [
                      ...publishLogs,
                      ...details,
                    ]);
                  });

                  publishToStorageObject({
                    bucketId: bucket.id!,
                    projectId: meta.id!,
                    revision: meta.saveRevision,
                  }).then((res) => {
                    unsubscribe();
                    doneCallback?.();

                    if (res.status === "OK") {
                      AppToaster.show({
                        intent: "success",
                        message: "Project is successfully published.",
                      });
                    } else if (res.status === "ERROR") {
                      AppToaster.show({
                        intent: "danger",
                        message:
                          "Project is NOT published. Error: " + res.error,
                      });
                    }
                    reloadAssignedIds();
                    reloadStorageObjects();
                    onChange();
                  });
                }}
                buttonProps={{}}
                dialogProps={{}}
                text="Publish"
                title={"Publish to  bucket: " + bucket.bucketName}
              >
                <>
                  <p>Upload slider configuration file and assets to bucket.</p>
                  <p>
                    Note: Assets urls in the slider configuration file will be
                    updated in order to point to bucket files.
                  </p>
                </>
              </ConfirmButton>{" "}
              <Button
                rightIcon="share"
                onClick={(event: React.MouseEvent) => {
                  openPublishUrl({ bucketId: bucket.id!, projectId: meta.id! });
                }}
              >
                Open in browser
              </Button>
              <Button minimal style={{ float: "right" }}>
                Integration instructions for {bucket.platform}
              </Button>
            </p>

            <p>
              <Button
                minimal
                intent="none"
                icon={
                  integrationDetailsOpen[`${bucket.id}`]
                    ? "caret-up"
                    : "caret-down"
                }
                onClick={() => {
                  setIntegrationDetailsOpen({
                    ...integrationDetailsOpen,
                    [`${bucket.id}`]: !integrationDetailsOpen[`${bucket.id}`],
                  });

                  getPublishDetails({
                    bucketId: bucket.id!,
                    projectId: meta.id!,
                  }).then((response) => {
                    console.log(response);
                    setIntegrationDetails({
                      ...integrationDetails,
                      [`${bucket.id}`]: response,
                    });
                  });
                }}
              >
                {integrationDetailsOpen[`${bucket.id}`] ? "Hide" : "Show"}{" "}
                integration details
              </Button>
            </p>

            {integrationDetailsOpen[`${bucket.id}`] && (
              <>
                <div>
                  <FormGroup label={"Player URL"}>
                    <InputGroup
                      fill
                      readOnly
                      value={integrationDetails[`${bucket.id}`]?.playerUrl}
                      rightElement={
                        <Button
                          icon={"clipboard"}
                          minimal={true}
                          onClick={() => {
                            copyToClipboard(
                              integrationDetails[`${bucket.id}`]?.playerUrl
                            );
                            AppToaster.show({
                              intent: "success",
                              message: "Value has been copied to clipboard",
                            });
                          }}
                        />
                      }
                    ></InputGroup>
                  </FormGroup>
                  <FormGroup label={"Slider URL"}>
                    <InputGroup
                      fill
                      readOnly
                      value={integrationDetails[`${bucket.id}`]?.jsonUrl}
                      rightElement={
                        <Button
                          icon={"clipboard"}
                          minimal={true}
                          onClick={() => {
                            copyToClipboard(
                              integrationDetails[`${bucket.id}`]?.jsonUrl
                            );
                            AppToaster.show({
                              intent: "success",
                              message: "Value has been copied to clipboard",
                            });
                          }}
                        />
                      }
                    ></InputGroup>
                  </FormGroup>
                </div>
              </>
            )}

            <ConfirmButton
              onConfirm={() => {
                removeBucketFromProject({
                  bucketId: bucket.id!,
                  projectId: meta.id!,
                }).then(() => {
                  reloadAssignedIds();
                  reloadStorageObjects();
                  onChange();
                });
              }}
              buttonProps={{
                icon: "trash",
                minimal: true,
                className: css.deleteButton,
              }}
              dialogProps={{}}
              text=""
              title={"Remove bucket settings: " + bucket.bucketName}
            >
              <>
                <p>Remove bucket settings from this project.</p>
              </>
            </ConfirmButton>
          </div>
        ))}
        <div className={css.sectionHeader}>DOWNLOAD</div>
        <div className={css.bucketItem}>
          <p>
            <ConfirmButton
              loadingText="Preparing file for download ..."
              logs={publishLogs}
              hasActionOnConfirm={true}
              successMsg=""
              intent="primary"
              onClose={() => {
                setPublishLogs((publishLogs) => []);
              }}
              onConfirm={async (doneCallback) => {
                const unsubscribe = subscribeToPublishDetails((details) => {
                  setPublishLogs((publishLogs) => [...publishLogs, ...details]);
                });

                const base64Zip = await downloadPackage({
                  projectId: meta.id!,
                });

                const blob = base64ToBlob(base64Zip, "application/zip");
                downloadBlob(
                  blob,
                  `WebSlider-ID-${meta.id!}-REV-${meta.saveRevision}.zip`
                );

                unsubscribe();
                doneCallback?.();
                //reloadAssignedIds();
                //reloadStorageObjects();
                //onChange();
              }}
              buttonProps={{}}
              dialogProps={{}}
              text="Download"
              title={"Prepare and download slider package"}
            >
              <>
                <p>Download ZIP with slider configuration file and assets.</p>
                <p>
                  Note: Assets urls in the slider configuration file will be
                  updated with relative urls in order to point to files in
                  assets directory.
                </p>
              </>
            </ConfirmButton>
            <Button minimal style={{ float: "right" }}>
              Integration instructions
            </Button>
          </p>
        </div>{" "}
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  // TODO: IMPORTANT hardcoded
  const breakpointConfig: BreakpointConfiguration | undefined =
    state.project.settings.breakpoints.breakpointsConfiguration.find(
      (breakpointConfig: any) => breakpointConfig.type === "large-1"
    );

  return {
    project: omit({ ...state.project }, "diff"),
    meta: state.meta,
    slides: state.project.slides,
    layers: state.project.layers,
    objects: state.project.objects,
    breakpointConfig,
    settings: state.project.settings,
  };
};

const mapDispatchToProps = {
  _updateProjectMeta: (meta: Partial<IMeta>) => updateProjectMeta(meta),
  _updateEditor: (editor: Partial<IEditor>) => updateEditor(editor),
};

export default connect(mapStateToProps, mapDispatchToProps)(PublishPanel);
