import { useState, useEffect, useRef } from "react";
import { Card, Button, Icon, H4, Text } from "@blueprintjs/core";
import styles from "./MobileRestriction.module.scss";

const MobileRestriction = () => {
  const [isMobile, setIsMobile] = useState(false);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 782);
      checkedRef.current = true;
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isMobile) return null;

  const handleForceDesktop = () => {
    setIsMobile(false);
  };

  return (
    <div className={styles.mobileContainer}>
      <Card className={styles.mobileCard}>
        <Icon icon="desktop" size={48} className={styles.mobileIcon} />

        <H4 className={styles.title}>Switch to Desktop</H4>

        <Text className={styles.message}>
          DAAP requires larger screens for comfortable work. While the UI may be
          visible, it will not look or behave properly on small devices.
        </Text>

        <div className={styles.actions}>
          <Button intent="primary" icon="desktop" onClick={handleForceDesktop}>
            Continue Anyway
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default MobileRestriction;
