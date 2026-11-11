import React, { useState } from "react";
import { DevelopmentItem } from "../../panels/development-panel/i-development-types";

type UpdateType = React.Dispatch<React.SetStateAction<DevelopmentItem[]>>;
const defaultUpdate: UpdateType = () => [];

export const DevelopmentContext = React.createContext({
  developmentItems: [] as DevelopmentItem[],
  setDevelopmentItems: defaultUpdate,
});

export const DevelopmentContextProvider = (
  props: { children?: React.ReactNode }
) => {
  const [developmentItems, setDevelopmentItems] = useState<DevelopmentItem[]>(
    []
  );
  return (
    <DevelopmentContext.Provider
      value={{
        developmentItems,
        setDevelopmentItems,
      }}
    >
      {props.children}
    </DevelopmentContext.Provider>
  );
};
