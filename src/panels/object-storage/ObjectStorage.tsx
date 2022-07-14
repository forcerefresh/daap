import { Button, Card, Checkbox, Elevation, Icon } from "@blueprintjs/core";
import React, { FormEvent, useContext, useEffect, useState } from "react";
import { ObjectStorageItemForm } from "./ObjectStorageItemForm";
import css from "./ObjectStorage.module.scss";
import cx from "classnames";
import { getSelectField } from "../../inputs/input-utils";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import ConfirmButton from "../../utils/components/confirm-button/confirm-button";
import {
  getObjectStorageValidationFunc,
  getPlatformList,
  getPlatformName,
} from "./form-definition-factory";
import { IntegrationContext } from "../../integration";
import { ObjectStorageItem } from "../../integration/hooks/object-storage-hook/i-object-storage-hook";

export type ObjectStorageProps = {};

export const ObjectStorage: React.FC<ObjectStorageProps> = (props) => {
  const [enableValidation, setEnableValidation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<any>({});
  const [openAdd, setOpenAdd] = useState(false);
  const [platform, setPlatform] = useState("");
  const [externalErrors, setExternalErrors] = useState<any>({});
  const [list, setList] = useState<ObjectStorageItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [uploadingPlayer, setUploadingPlayer] = useState("-1");

  const globalContext = useContext(IntegrationContext);
  const {
    listStorageObjects,
    addStorageObject,
    deleteStorageObject,
    uploadPlayerToStorageObject,
  } = globalContext.useObjectStorageHook();

  useEffect(() => {
    reload();
  }, []);

  const reload = () => {
    listStorageObjects({}).then((result) => {
      setList(result);
    });
  };

  const bucketToDeleteName = list.find(
    (item) => item.id === selectedId
  )?.bucketName;

  const validateFunc = getObjectStorageValidationFunc(platform);

  return (
    <div className={css.main}>
      <Card
        interactive={false}
        elevation={Elevation.TWO}
        className={cx(css.sectionCard)}
      >
        {!openAdd && (
          <Button
            intent="primary"
            icon={"plus"}
            onClick={() => {
              setOpenAdd(!openAdd);
            }}
          >
            Add bucket
          </Button>
        )}
        {openAdd && (
          <>
            {getSelectField(
              "Platform",
              platform,
              [
                { label: "Select platform ...", value: "" },
                ...getPlatformList(),
              ],
              setPlatform,
              { placeholder: "Select platform" }
            )}
            <ObjectStorageItemForm
              type={platform}
              values={values}
              onChange={(newValues) => {
                setValues(newValues);
                if (enableValidation) {
                  const res = validateFunc(newValues);
                  setExternalErrors(res.errors);
                }
              }}
              externalErrors={externalErrors}
            />
            <div className={css.actionHolder}>
              <Button
                loading={loading}
                disabled={!platform}
                intent={"primary"}
                onClick={() => {
                  const res = validateFunc(values);
                  setExternalErrors(res.errors);
                  setEnableValidation(true);

                  if (res.valid) {
                    setLoading(true);
                    addStorageObject({ ...values, platform }).then(() => {
                      setLoading(false);
                      setOpenAdd(false);
                      setValues({});
                      AppToaster.show({
                        intent: "success",
                        message: "Bucket is successfully added.",
                      });
                      reload();
                    });
                  }
                }}
              >
                Add bucket
              </Button>
              <Button
                intent={"none"}
                onClick={() => {
                  setOpenAdd(false);
                  setValues({});
                }}
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </Card>

      {!openAdd && (
        <div className={css.listHolder}>
          <div className={css.header}>
            <ConfirmButton
              disabled={!selectedId}
              onConfirm={() => {
                deleteStorageObject({ id: selectedId! }).then((result) => {
                  setSelectedId(undefined);
                  AppToaster.show({
                    intent: "success",
                    message: "Bucket is successfully deleted.",
                  });
                  reload();
                });
              }}
              buttonProps={{}}
              dialogProps={{}}
              text="Delete selected bucket"
              title={"Delete bucket setup: " + bucketToDeleteName}
              confirmText={bucketToDeleteName || ""}
              placeholder={"Type bucket name here"}
            >
              <>
                <p>Deleting a bucket setup is permanent and can't be undone.</p>
                <p>
                  Important: Publishing to this bucket will be removed from
                  Project that are using it.
                </p>
                <p>
                  Please note: Only bucket setting in this app will be deleted.
                  Bucket and bucket files will NOT be deleted. Data can be
                  deleted directly through bucket provider console.
                </p>
                <p>
                  To confirm deletion, type the name of the bucket
                  {` "${bucketToDeleteName}" `} in the field below:
                </p>
              </>
            </ConfirmButton>
          </div>

          <div className={cx(css.listHeader)}>
            <div className={css.cb}></div>
            <div className={css.content}>Bucket</div>
            <div className={css.status}>Status</div>
          </div>

          <div className={css.list}>
            {list.map((item) => {
              const isUploaded =
                item.playerStatus && item.playerStatus === "uploaded";

              return (
                <div className={css.listItem}>
                  <div className={css.cb}>
                    <Checkbox
                      checked={item.id === selectedId}
                      onChange={(e: FormEvent<HTMLInputElement>) => {
                        setSelectedId(
                          e.currentTarget.checked ? item.id : undefined
                        );
                      }}
                    ></Checkbox>
                  </div>
                  <div className={css.content}>
                    Platform: <strong>{getPlatformName(item.platform)}</strong>
                    <br />
                    Name: <strong>{item.bucketName}</strong>
                    <br />
                    Description: <strong>{item.description}</strong>
                    <br />
                    Environment: <strong>{item.environment}</strong>
                  </div>
                  <div className={css.status}>
                    {!isUploaded ? (
                      <>
                        <p>
                          <Icon icon="warning-sign" intent="warning" /> Player
                          is NOT uploaded to this bucket.
                        </p>
                      </>
                    ) : (
                      <p>
                        <Icon icon="tick" intent="success" /> Player is uploaded
                        to this bucket.
                      </p>
                    )}
                    <Button
                      loading={uploadingPlayer === item.id}
                      intent={isUploaded ? "none" : "success"}
                      onClick={() => {
                        setUploadingPlayer(item.id!);
                        uploadPlayerToStorageObject({ id: item.id! }).then(
                          (result: any) => {
                            setUploadingPlayer("-1");
                            if (result.status === "ERROR") {
                              AppToaster.show({
                                intent: "danger",
                                message:
                                  "Something went wrong. Error: " +
                                  result.error,
                              });
                            } else if (result.status === "OK") {
                              AppToaster.show({
                                intent: "success",
                                message: "Player is uploaded to bucket.",
                              });
                            }
                            reload();
                          }
                        );
                      }}
                    >
                      {isUploaded ? "Upload Player Again" : "Upload Player"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
