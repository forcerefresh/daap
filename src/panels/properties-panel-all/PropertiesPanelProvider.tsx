import React, { useState } from "react";

export enum PropertiesPanelSection {
  More = "more",
  Layout = "layout",
  Properties = "properties",
  Transform = "transform",
  Basic = "basic",
  Linking = "linking",
  Animation = "animation",
  CommonStyle = "common-style",
}

type UpdateType = React.Dispatch<React.SetStateAction<PropertiesPanelSection>>;
const defaultUpdate: UpdateType = () => [];

export const PropertiesPanelContext = React.createContext({
  activeSection: PropertiesPanelSection.Layout,
  setActiveSection: defaultUpdate,
});

export const PropertiesPanelContextProvider = (
  props: { children?: React.ReactNode }
) => {
  const [activeSection, setActiveSection] = useState<PropertiesPanelSection>(
    PropertiesPanelSection.Properties
  );

  return (
    <PropertiesPanelContext.Provider
      value={{
        activeSection,
        setActiveSection,
      }}
    >
      {props.children}
    </PropertiesPanelContext.Provider>
  );
};
