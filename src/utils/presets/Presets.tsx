import React, {
  ChangeEvent,
  FormEvent,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Alert,
  Button,
  Classes,
  Dialog,
  FormGroup,
  HTMLSelect,
  InputGroup,
  Intent,
} from "@blueprintjs/core";
import { v4 as uuid } from "uuid";
import { cloneDeep, isMatch } from "lodash-es";
import { IntegrationContext } from "../../integration";
import { Preset, PresetGroup } from "./i-presets";
import cx from "classnames";
import css from "./Presets.module.scss";

export interface IPresets<T> {
  presetGroup: PresetGroup;
  currentValue: T;
  onChange: (preset: Preset<T>) => void;
}

export const Presets: React.FC<IPresets<any>> = (props) => {
  const { presetGroup, currentValue, onChange } = props;

  const globalContext = useContext(IntegrationContext);
  const { getPresets, addPreset, deletePreset, updatePreset } =
    globalContext.usePresets();

  const [presets, setPresets] = useState<Preset<any>[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [selectedPresetValues, setSelectedPresetValues] = useState<any>({});
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    getPresets(presetGroup).then((response) => {
      setPresets(response);
    });
  }, []);

  useEffect(() => {
    const contain = isMatch(currentValue, selectedPresetValues);
    if (!contain) {
      setSelectedPreset("");
    }
  }, [currentValue]);

  const presetOptions = presets.map((preset) => ({
    label: preset.name,
    value: preset.uid,
  }));

  const onClickAdd = () => {
    setAddDialogOpen(true);
  };

  const addNewPreset = (name: string) => {
    const newPreset: Preset<any> = {
      uid: uuid(),
      name,
      value: currentValue,
    };
    addPreset(presetGroup, newPreset).then((response) => {
      getPresets(presetGroup).then((response) => {
        setPresets(response);
      });
      setSelectedPreset(newPreset.uid);
    });
  };

  //   const onClickUpdate = () => {
  //     const updatedValue = cloneDeep(initalPreset);
  //     updatedValue.name = selectedPreset;
  //     [...updatedValue!.value] = value;
  //     updatePreset(PresetGroup.colors, updatedValue).then((response) => {
  //       response.unshift(initalPreset);
  //       setPresets(response);
  //       setSelectedPreset(updatedValue.name);
  //     });
  //   };

  const deletePresetConfirm = () => {
    deletePreset(presetGroup, selectedPreset).then((response) => {
      getPresets(presetGroup).then((response) => {
        setPresets(response);
      });
      setSelectedPreset("");
      setDeleteOpen(false);
    });
  };

  const renderAddBtn = () => {
    return (
      <Button
        className={css.addNewPreset}
        minimal
        onClick={() => onClickAdd()}
        small={true}
        icon="add"
      ></Button>
    );
  };

  //   const renderUpdateBtn = () => {
  //     return (
  //       <Button
  //         minimal
  //         onClick={() => onClickUpdate()}
  //         small={true}
  //         icon="floppy-disk"
  //       ></Button>
  //     );
  //   };

  const renderDeleteBtn = () => {
    return (
      <Button
        minimal
        onClick={() => setDeleteOpen(true)}
        small={true}
        icon="delete"
      ></Button>
    );
  };

  return (
    <>
      <div className={css.colorRow}>
        <FormGroup label={"Presets"} inline>
          <HTMLSelect
            className={cx({ [css.emptySelect]: selectedPreset === "" })}
            options={
              [
                {
                  label: "Apply preset...",
                  value: "",
                  readOnly: true,
                  disabled: true,
                },
                ...presetOptions,
              ] as any
            }
            value={selectedPreset}
            onChange={(event: ChangeEvent) => {
              const selEl = event.currentTarget as HTMLSelectElement;
              setSelectedPreset(selEl.value);

              const selectedPreset = presets.find(
                (preset) => preset.uid === selEl.value
              );

              setSelectedPresetValues(cloneDeep(selectedPreset?.value!));
              onChange(selectedPreset?.value!);
            }}
          />
        </FormGroup>
        {renderAddBtn()}
        {renderDeleteBtn()}
        {/* {renderUpdateBtn()} */}
      </div>

      <Dialog
        className={cx("bp3-dark", css.dialog)}
        isOpen={addDialogOpen}
        onClose={() => {
          addNewPreset(newPresetName);
          setAddDialogOpen(false);
        }}
        title="Add preset"
        canOutsideClickClose={false}
      >
        <div style={{ margin: "20px" }}>
          <InputGroup
            autoFocus={true}
            onChange={(e: FormEvent<HTMLInputElement>) => {
              setNewPresetName(e.currentTarget.value);
            }}
            placeholder={"Enter preset name..."}
          />
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button
              intent="primary"
              onClick={() => {
                addNewPreset(newPresetName);
                setNewPresetName("");
                setAddDialogOpen(false);
              }}
              disabled={false}
            >
              Add Preset
            </Button>
            <Button
              onClick={() => {
                setNewPresetName("");
                setAddDialogOpen(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Dialog>
      <Alert
        cancelButtonText="Cancel"
        confirmButtonText="Delete"
        canOutsideClickCancel={false}
        icon="trash"
        intent={Intent.DANGER}
        isOpen={deleteOpen}
        onCancel={() => {
          setDeleteOpen(false);
        }}
        onConfirm={deletePresetConfirm}
        className="bp3-dark"
      >
        <p>Are you sure you want to delete preset?</p>
      </Alert>
    </>
  );
};
