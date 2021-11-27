import React, { useState } from "react";
import { Button, ButtonGroup } from "@blueprintjs/core";
import { IButtonGroupInput, IUpdateInput } from "../types";
// import css from "./button-group-input.module.scss";

export const ButtonGroupInputForm: React.FC<IButtonGroupInput & IUpdateInput> =
  (props) => {
    const { value, options, onChange } = props;

    const [selectedIndex, setSelectedIndex] = useState(0);

    const changeTab = (index: number) => {
      setSelectedIndex(index);
    };

    const renderTabContent = () => {
      return <div>{options[selectedIndex].value}</div>;
    };

    return (
      <div>
        <ButtonGroup>
          {options.map((el, idx) => (
            <Button
              className={selectedIndex === idx ? "bp3-active" : ""}
              onClick={() => changeTab(idx)}
            >
              {el.label}
            </Button>
          ))}
        </ButtonGroup>
        {renderTabContent()}
      </div>
    );
  };
