if (process.env.ELECTRON_ENV === "development") {
  global.WebSlider_GlobalScope = {
    loggerLevel: {
      electron: 0,
    },
  };
} else {
  global.WebSlider_GlobalScope = {
    loggerLevel: {
      electron: 60,
    },
  };
}
