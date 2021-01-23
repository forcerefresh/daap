# Tiles

## TilesZoom

rows: 5
cols: 5
startingPoint: "random" | "center" | "top-left" + 7 (horisonta-center, vertical-center) ....
transformOrigin: {x: "50", y:"50"}

## TilesFade

rows: 5
cols: 5
startingPoint: "random" | "center" | "top-left" + 7 (horisonta-center, vertical-center) ....

## SliceSlide

slices: 5
orientation: "horizontal" | "vertical"
startingPoint: "random" | "center" | "start" | "end"
startFrom: 100% = image.width | image.height

```
100%
             --------------
             >
-------------

200%
                          --------------
                  >
-------------

50%
       --------------
          >
 -------------

       start  end  center
------   1     3     2
------   2     2     1
------   3     1     2

center 2      1       2
end    3      2       1
start  1      2       3
       |      |       |
       |      |       |
       |      |       |
```

---

## SliceSlideInner

Slika se unutra pomera. tj koristi se "background-position" se slika dovode u polozaj.

slices: 5
orientation: "horizontal" | "vertical"
startingPoint: "random" | "center" | "start" | "end"
startFrom: 100% = slice.width | slice.height

## TilesDeploying

Pakiju se boksevi. slicno kao TilesFade + pomeraj. ovaj efekat moze da se kotisti
packDirection: "top2bottom" | "left2right" |

## Tiles rotation

rotacija oko centralne ose (problem 2 slike)
