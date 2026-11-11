export function base64ToBlob(base64: string, mime: string) {
  const byteCharacters = atob(base64);

  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mime });

  return blob;
}

export function downloadBlob(blob: any, name = "file.zip") {
  // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
  const blobUrl = URL.createObjectURL(blob);

  // Create a link element
  const link = document.createElement("a");

  // Set link's href to point to the Blob URL
  link.href = blobUrl;
  link.download = name;

  // Append link to the body
  document.body.appendChild(link);

  // Dispatch click event on the link
  // This is necessary as link.click() does not work on the latest firefox
  link.dispatchEvent(
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    })
  );

  // Remove link from body
  document.body.removeChild(link);
}

export function appendToFileName(fileName: string, appendStr: string) {
  const idx = fileName.lastIndexOf(".");
  if (idx === -1) return fileName + appendStr;
  return fileName.substr(0, idx) + appendStr + fileName.substr(idx);
}

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // The result attribute contains the data as a base64 encoded string
      const base64String = (reader.result as string).split(",")[1]; // Remove the data URL prefix
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function blobToFile(blob: Blob, filename: string, mime: string) {
  return new File([blob], filename, {
    type: mime,
    lastModified: Date.now(),
  });
}
