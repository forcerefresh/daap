import { Document } from "../../hooks/useDocumentType";

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

      // return acc2;
    }, acc);
  }, []);

  industriesOptions.unshift({ label: "All", value: "" });

  return industriesOptions;
}

// useEffect(() => {
//   try {
//     const parsed = JSON.parse(iaColorSetResponse);
//     setColorSets(parsed);
//   } catch (ex) {
//     console.log(ex);
//   }
// }, [iaColorSetResponse]);
// const documentsOptions = documents.reduce<
//   {
//     label: string;
//     value: string;
//   }[]
// >((acc, cur, idx) => {
//   acc.push({ label: idx + 1 + ". " + cur.category, value: cur.category });

//   return cur.items.reduce((acc2, cur2, idx2) => {
//     acc2.push({
//       label:
//         "  " +
//         (idx + 1) +
//         "." +
//         (idx2 + 1) +
//         ". " +
//         // cur.name +
//         // " - " +
//         cur2.category,
//       value: cur.category + " - " + cur2.category,
//     });

//     return cur2.items.reduce((acc3, cur3, idx3) => {
//       acc2.push({
//         label:
//           "    " +
//           (idx + 1) +
//           "." +
//           (idx2 + 1) +
//           "." +
//           (idx3 + 1) +
//           ". " +
//           //+ cur.name + " - " + cur2.name + " - "
//           cur3.name,
//         value: cur.category + " - " + cur2.category + " - " + cur3.name,
//       });
//       return acc3;
//     }, acc2);

//     // return acc2;
//   }, acc);
// }, []);
