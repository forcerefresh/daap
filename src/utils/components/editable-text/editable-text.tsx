import { InputGroup, Text, Tooltip } from "@blueprintjs/core";
import React, { useEffect, useRef, useState } from "react";

interface IEditableText {
  value: string;
  onChange: (value: string) => void;
  maxWidth?: string;
}

export default function EditableText(props: IEditableText) {
  const { value, onChange, maxWidth = "300px" } = props;
  const [isEdit, setIsEdit] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isEdit) {
      inputRef.current?.focus();
    }
  }, [isEdit]);

  return (
    <>
      {isEdit ? (
        <InputGroup
          inputRef={inputRef}
          large
          placeholder="Set document name..."
          value={currentValue}
          onChange={(event: any) => {
            setCurrentValue((event.currentTarget as HTMLInputElement).value);
          }}
          onBlur={() => {
            onChange(currentValue);
            setIsEdit(false);
          }}
          onKeyPress={(event) => {
            if (event.key === "Enter") {
              onChange(currentValue);
              setIsEdit(false);
            }
          }}
        ></InputGroup>
      ) : (
        <Tooltip content={value}>
          <Text
            style={{
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              maxWidth,
            }}
            onClick={() => setIsEdit(true)}
          >
            {value}
          </Text>
        </Tooltip>
      )}
    </>
  );
}
