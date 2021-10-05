import { Player } from "./player/player/Player";

require("./effects/effects");

(window as any).WebSliderPlayer = Player;

const divEl = document.createElement("div");
divEl.style.overflow = "visible";

document.body.appendChild(divEl);

//window.addEventListener("load", function () {
console.log("PAAAAAAA");

const data = {
  html: '<div class=\'slidesHolder\'>  <div style=\'position: absolute;\' class=\'slide-d2895d21-f996-4d14-839d-e972d3ee4b3b\'>    <div class="layer-29a54d38-990c-4f2e-8ad2-57534fb3e1a9" style="width:1000px; height: 500px">      <div class="object" style=\'left:100px;top:100px;width:300px;height:200px;position: absolute;overflow: visible;\'>      <div class="object object-7da628ba-e2cf-4995-87d3-f413da2f69cc" style=\'left:100px;top:100px;width:300px;height:200px;position: absolute;overflow: visible;position: relative; left:initial; top: initial; overflow: visible\'><p class="object-content" style="font-family: Courier New;font-size: 45px;color: rgba(51,76,206,1);font-weight: 400;width: 300px;height:200px;position: absolute;">Sample test</p>      </div>      </div>      <div class="object" style=\'left:180px;top:338px;width:669px;height:133px;position: absolute;overflow: visible;\'>      <div class="object object-db29c649-7435-4078-92cd-3d34190f897d" style=\'left:180px;top:338px;width:669px;height:133px;position: absolute;overflow: visible;position: relative; left:initial; top: initial; overflow: visible\'><p class="object-content" style="font-family: Courier New;font-size: 8em;color: rgba(221,27,27,1);font-weight: 900;width: 669px;height:133px;position: absolute;">Sample test</p>      </div>      </div>    </div>  </div></div>',
  slideDataArr: [
    {
      slide: {
        id: "d2895d21-f996-4d14-839d-e972d3ee4b3b",
        slideType: "normal",
        slideTransition: {
          duration: 2000,
          overlap: 1000,
          effect: {
            id: "none",
            values: {},
          },
        },
        duration: {
          inheritFrom: "custom",
          customValue: 5000,
        },
      },
      transitionsData: [
        {
          objectClass: "layer-29a54d38-990c-4f2e-8ad2-57534fb3e1a9",
          transitions: {
            layer: {
              relativeTo: "stage",
              delay: 0,
              duration: 1000,
              ease: "none",
              timeDistribution: 50,
              effect: {
                id: "none",
                values: {},
              },
            },
          },
          events: [],
          data: {
            slideDuration: {
              inheritFrom: "custom",
              customValue: 5000,
            },
            objectWidth: 1000,
            objectHeight: 500,
            objectLeft: 0,
            objectTop: 0,
            overflow: "",
            objectHtml: " ",
          },
        },
        {
          objectClass: "object-7da628ba-e2cf-4995-87d3-f413da2f69cc",
          transitions: {
            in: {
              relativeTo: "stage",
              delay: 0,
              duration: 1000,
              ease: "none",
              timeDistribution: 50,
              effect: {
                id: "zoomIn",
                values: {
                  scaleX: 100,
                  scaleY: 100,
                },
              },
            },
            out: {
              relativeTo: "stage",
              delay: 0,
              duration: 1000,
              ease: "none",
              timeDistribution: 50,
              effect: {
                id: "none",
                values: {},
              },
            },
            effect: {
              relativeTo: "stage",
              delay: 0,
              duration: -1,
              ease: "none",
              timeDistribution: 50,
              effect: {
                id: "none",
                values: {},
              },
            },
          },
          events: [],
          data: {
            slideDuration: {
              inheritFrom: "custom",
              customValue: 5000,
            },
            objectWidth: 300,
            objectHeight: 200,
            objectLeft: 100,
            objectTop: 100,
            overflow: "visible",
            objectHtml:
              '<p class="object-content" style="font-family: Courier New;font-size: 45px;color: rgba(51,76,206,1);font-weight: 400;width: 300px;height:200px;position: absolute;">Sample test</p>',
          },
        },
        {
          objectClass: "object-db29c649-7435-4078-92cd-3d34190f897d",
          transitions: {
            in: {
              relativeTo: "stage",
              delay: 0,
              duration: 3000,
              ease: "none",
              timeDistribution: 50,
              effect: {
                id: "splitText",
                values: {
                  columns: 10,
                  rows: 10,
                  startFrom: {
                    startFrom: "start",
                    customOrder:
                      "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20",
                    fromCharacter: 1,
                  },
                  transformOrigin: {
                    x: 50,
                    y: 50,
                  },
                  durationPerChar: 1000,
                  delayBetweenChar: 500,
                  opacity: {
                    value: 0,
                    hasTimelineProperties: false,
                    delay: 0,
                    duration: 1000,
                  },
                  blur: {
                    value: 0,
                    hasTimelineProperties: false,
                    delay: 0,
                    duration: 1000,
                  },
                  scaleX: {
                    value: 1,
                    hasTimelineProperties: false,
                    delay: 0,
                    duration: 1000,
                  },
                  scaleY: {
                    value: 1,
                    hasTimelineProperties: false,
                    delay: 0,
                    duration: 1000,
                  },
                  rotationPerChar: {
                    value: 0,
                    hasTimelineProperties: false,
                    delay: 0,
                    duration: 1000,
                  },
                  positionX: {
                    value: 0,
                    hasTimelineProperties: false,
                    delay: 0,
                    duration: 1000,
                  },
                  positionY: {
                    value: 0,
                    hasTimelineProperties: false,
                    delay: 0,
                    duration: 1000,
                  },
                },
              },
            },
            out: {
              relativeTo: "stage",
              delay: 0,
              duration: 1000,
              ease: "none",
              timeDistribution: 50,
              effect: {
                id: "none",
                values: {},
              },
            },
            effect: {
              relativeTo: "stage",
              delay: 0,
              duration: -1,
              ease: "none",
              timeDistribution: 50,
              effect: {
                id: "none",
                values: {},
              },
            },
          },
          events: [],
          data: {
            slideDuration: {
              inheritFrom: "custom",
              customValue: 5000,
            },
            objectWidth: 669,
            objectHeight: 133,
            objectLeft: 180,
            objectTop: 338,
            overflow: "visible",
            objectHtml:
              '<p class="object-content" style="font-family: Courier New;font-size: 8em;color: rgba(221,27,27,1);font-weight: 900;width: 669px;height:133px;position: absolute;">Sample test</p>',
          },
        },
      ],
    },
  ],
};

const player = new Player(data as any, divEl);
player.playSlide(0);
//});

//
//
//
//
//
