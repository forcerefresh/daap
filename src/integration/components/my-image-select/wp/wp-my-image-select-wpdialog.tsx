import React, { useCallback, useEffect, useMemo } from "react";
import { getMyUploadComponentProps } from "../../../../integration";
import { Button } from "@blueprintjs/core";
import { forOwn } from "lodash-es";
import axios from "axios";

async function uploadImages(images: any[], type: string) {
  const response = await axios.post(
    `${daapForcerefreshSettings.root}daap/v1/medias/${type}/link`,
    { images },
    {
      headers: {
        "X-WP-Nonce": daapForcerefreshSettings.nonce,
      },
    }
  );

  return response.data.data;
}

async function processImages(attachments: any[], type: string) {
  return attachments.map((image) => {
    const mediaSizes: any[] = [];

    forOwn(image.sizes, (oneImage, key) => {
      mediaSizes.push({
        sizeType: key,
        width: oneImage.width,
        height: oneImage.height,
        sourceFilename: oneImage.url,
      });
    });

    mediaSizes.push({
      sizeType: "original",
      width: image.width,
      height: image.height,
      sourceFilename: image.url,
    });

    const retImg = {
      type,
      name: image.title,
      description: image.description,
      tags: [],
      filename: image.filename,
      format: image.subtype,
      width: image.width,
      height: image.height,
      mediaSizes: mediaSizes,
      previewSizes: mediaSizes,
    };

    return retImg;
  });
}

export const WpMyImageSelect_WpDialog: React.FC<getMyUploadComponentProps> = (
  props
) => {
  const { onStop, onComplete, type } = props;

  const wpType =
    type === "image"
      ? ["image/jpeg", "image/png", "image/gif"]
      : type === "vector"
      ? ["image/svg+xml"]
      : undefined;

  const onSelect = useCallback(
    async (attachments: any) => {
      const images = await processImages(attachments, type);
      await uploadImages(images, type);

      onComplete();
    },
    [type]
  );

  useEffect(() => {
    initWP(onSelect, wpType);
    return () => {
      clearWP();
    };
  }, [onSelect]);

  return (
    <div>
      <Button
        outlined
        style={{ marginBottom: "15px", width: "100%", padding: "20px" }}
        type="button"
        id="dapp-upload-wp-image-button"
      >
        Open WP media library to select images
      </Button>
    </div>
  );
};

function clearWP() {
  jQuery("#dapp-upload-wp-image-button").off();
}

function initWP(onSelect: (attachments: any) => void, wpType?: string[]) {
  jQuery(document).ready(function ($: any) {
    $("#dapp-upload-wp-image-button").click(function (e: Event) {
      e.preventDefault();

      var imageUploader = wp.media({
        title: "Select Image",
        button: {
          text: "Use image in DAAP",
        },
        multiple: true,
        frame: "select",
        library: {
          type: wpType, // Restrict to images
          // mimeType: ["image/svg+xml"], // Restrict to JPEG and PNG images
        },
        theme: "dark", // Set the theme to 'dark' or 'light'
      });

      imageUploader.on("select", function () {
        var attachment = imageUploader
          .state()
          .get("selection")
          // .first()
          .toJSON();

        onSelect(attachment);
      });

      imageUploader.on("open", function () {
        jQuery(".media-modal").addClass("is-dark");
      });

      imageUploader.open();
    });
  });
}
