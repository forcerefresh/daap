import { PropsWithChildren } from "react";
import cx from "classnames";
import css from "./SectionHeader.module.scss";

type ISectionHeaderProps = {
  className?: string;
  onClick?: () => void;
};

export const SectionHeader = (props: PropsWithChildren<ISectionHeaderProps>) => {
  const { children, className, onClick } = props;
  return (
    <div
      className={cx(css.sectionHeader, { [css.clickable]: !!onClick }, className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
