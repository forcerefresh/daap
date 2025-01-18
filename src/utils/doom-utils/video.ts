import {
  SaaSMediaData,
  VideoItem,
} from "webslider-sdk/lib/common/i-media-types";

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

export async function getImageVideoFromFile(
  file: File
): Promise<{ blob: Blob | null; size: { width: number; height: number } }> {
  return new Promise((resolve, reject) => {
    const video = createVideo(URL.createObjectURL(file));
    video.load();

    const size = { width: 0, height: 0 };

    video.addEventListener("loadedmetadata", function () {
      // Set canvas dimensions same as video dimensions
      size.width = video.videoWidth;
      size.height = video.videoHeight;
    });

    video.addEventListener("seeked", function () {
      const canvas = createCanvas(size!.width, size!.height);
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, size.width, size.height);

      //const image = canvas.toDataURL("image/jpeg", 0.9);
      canvas.toBlob(
        function (blob) {
          resolve({ blob, size });
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

export const textFile2Text = (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
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

export async function blobToBase64(blob: Blob) {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}
