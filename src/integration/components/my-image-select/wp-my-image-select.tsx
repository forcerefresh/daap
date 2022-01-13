import React from "react";

interface MyImageSelectProps {
  onSelect: (data: any) => void;
}
export const WPMyImageSelect: React.FC<MyImageSelectProps> = (props) => {
  const { onSelect } = props;

  return (
    <div
      onClick={() => {
        onSelect("WP");
      }}
    >
      WP
    </div>
  );
};
