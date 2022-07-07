import { VideoItem } from "../../webslider-sdk/src/common/i-media-types";

function createCanvas(w: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.style.display = "none";
  document.body.appendChild(canvas);
  return canvas;
}

function createVideo(src: string) {
  const video = document.createElement("video");
  video.style.display = "none";
  var sourceMP4 = document.createElement("source");
  sourceMP4.type = "video/mp4";
  sourceMP4.src = src;
  video.appendChild(sourceMP4);
  document.body.appendChild(video);
  return video;
}

export async function getImageFromFile(
  file: File
): Promise<{ blob: Blob | null; videoItem: VideoItem }> {
  return new Promise((resolve, reject) => {
    const video = createVideo(URL.createObjectURL(file));
    video.load();

    const videoItem: VideoItem = {
      size: { width: 0, height: 0, type: "jpg" },
      url: "",
    };

    video.addEventListener("loadedmetadata", function () {
      // Set canvas dimensions same as video dimensions
      videoItem.size!.width = video.videoWidth;
      videoItem.size!.height = video.videoHeight;
      console.log(video.videoWidth);
      console.log(video.videoHeight);
    });

    video.addEventListener("seeked", function () {
      console.log(videoItem);
      const canvas = createCanvas(
        videoItem.size!.width,
        videoItem.size!.height
      );
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(
        video,
        0,
        0,
        videoItem.size!.width,
        videoItem.size!.height
      );

      //const image = canvas.toDataURL("image/jpeg", 0.9);
      canvas.toBlob(
        function (blob) {
          resolve({ blob, videoItem });
        },
        "image/jpeg",
        1
      );
    });

    video.currentTime = 1;
  });
}

export const file2Base64 = (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result?.toString() || "");
    reader.onerror = (error) => reject(error);
  });
};
/*
var _CANVAS = document.querySelector("#video-canvas");
var _CTX = _CANVAS.getContext("2d");
var _VIDEO = document.querySelector("#main-video");

document.querySelector("#file").addEventListener("change", function () {
  // Object Url as the video source
  document
    .querySelector("#main-video source")
    .setAttribute(
      "src",
      URL.createObjectURL(document.querySelector("#file").files[0])
    );

  // Load the video and show it
  _VIDEO.load();

  // Load metadata of the video to get video duration and dimensions
  _VIDEO.addEventListener("loadedmetadata", function () {
    // Set canvas dimensions same as video dimensions
    _CANVAS.width = _VIDEO.videoWidth;
    _CANVAS.height = _VIDEO.videoHeight;
  });

  setTimeout(() => {
    _CTX.drawImage(_VIDEO, 0, 0, _VIDEO.videoWidth, _VIDEO.videoHeight);
  }, 9000);
  _VIDEO.addEventListener("canplay", function () {
    _CANVAS.style.display = "inline";
    _CTX.drawImage(_VIDEO, 0, 0, _VIDEO.videoWidth, _VIDEO.videoHeight);
  });
});
*/
