import React, { PropsWithChildren } from "react";
import cx from "classnames";
import css from "./PanelShell.module.scss";

type IPanelShellProps = {
  title?: string;
  actions?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
  bodyRef?: React.Ref<HTMLDivElement>;
};

/**
 * Standard panel shell: fixed header + scrollable body.
 *
 * Usage:
 *   <PanelShell title="Layers" actions={<Button icon="plus" />}>
 *     <LayerList />
 *   </PanelShell>
 *
 * For panels that need a fully custom header, use PanelHeader directly.
 */
export const PanelShell = (props: PropsWithChildren<IPanelShellProps>) => {
  const { title, actions, children, className, bodyClassName, headerClassName, bodyRef } = props;

  return (
    <div className={cx(css.shell, className)}>
      {(title || actions) && (
        <div className={cx(css.header, headerClassName)}>
          {title && <span className={css.title}>{title}</span>}
          {actions && <div className={css.actions}>{actions}</div>}
        </div>
      )}
      <div ref={bodyRef} className={cx(css.body, bodyClassName)}>{children}</div>
    </div>
  );
};
