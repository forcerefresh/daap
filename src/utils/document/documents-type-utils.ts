import { Document } from "../../template-generator/hooks/useDocumentType";

export function getDocumentsOptionFromThree(document: Document[]) {
  const industriesOptions = document.reduce<
    {
      label: string;
      value: string;
      disabled?: boolean;
    }[]
  >((acc, cur, idx) => {
    acc.push({
      label: idx + 1 + ". " + cur.name,
      value: cur.id,
      disabled: true,
    });

    return cur.children.reduce((acc2, cur2, idx2) => {
      acc2.push({
        label:
          "  " +
          (idx + 1) +
          "." +
          (idx2 + 1) +
          ". " +
          // cur.name +
          // " - " +
          cur2.name,
        value: cur2.id,
        disabled: true,
      });

      return cur2.children.reduce((acc3, cur3, idx3) => {
        acc2.push({
          label:
            "    " +
            (idx + 1) +
            "." +
            (idx2 + 1) +
            "." +
            (idx3 + 1) +
            ". " +
            //+ cur.name + " - " + cur2.name + " - "
            cur3.name +
            (cur3._count?.layouts
              ? " (LAYOUTS: " + cur3._count?.layouts + ")"
              : ""),
          value: cur3.id,
        });
        return acc3;
      }, acc2);
    }, acc);
  }, []);

  industriesOptions.unshift({ label: "All", value: "" });

  return industriesOptions;
}
