// *** implementation for WP

declare const tb_show: any;
declare const tb_remove: any;

export const useMediaHook = () => {
  const requestMedia = (type: "image" | "video"): Promise<{ url: string }> => {
    if (type !== "image" && type !== "video") {
      throw "Media type is not valid";
    }

    return new Promise((resolve, reject) => {
      (window as any).send_to_editor = function (html: any) {
        const holder = document.createElement("div");
        holder.innerHTML = html;
        const url = (holder.firstChild as HTMLImageElement).src;
        tb_remove();
        resolve({ url });
      };

      tb_show("", "media-upload.php?" + type + "=image&amp;TB_iframe=true");
    });
  };
  return { requestMedia };
};
