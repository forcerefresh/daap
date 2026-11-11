export function getImageThumbnailHtml(src?: string) {
  if (!src) {
    return `<div></div>`;
  }

  let style = "width: 100%;";
  style += "height: 100%;";
  style += `background-image:url('${src}');`;
  style += `background-repeat:no-repeat;`;
  style += `background-position: center center;`;

  return `<div class="object-content" style="${style}"></div>`;
}
