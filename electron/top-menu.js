const { app, Menu } = require("electron");

if (process.platform === "darwin") {
  const template = [
    {
      label: app.getName(),
      submenu: [
        // { role: "about" },
        // { type: "separator" },
        { role: "hide" },
        { role: "hideothers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "View",
      submenu: [{ role: "togglefullscreen" }],
    },

    {
      label: "Edit",
      submenu: [
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        // {
        //   label: "Select All",
        //   accelerator: "CmdOrCtrl+A",
        //   selector: "selectAll:",
        // },
      ],
    },

    {
      role: "window",
      submenu: [{ role: "minimize" }, { role: "close" }],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
} else {
  Menu.setApplicationMenu(null);
}
