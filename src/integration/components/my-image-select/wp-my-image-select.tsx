import React, { useCallback, useEffect, useMemo } from "react";
import { getMyUploadComponentProps } from "../../../integration";
import { Button } from "@blueprintjs/core";

// interface MyImageSelectProps {
//   onSelect: (data: any) => void;
// }
// export const WPMyImageSelect: React.FC<MyImageSelectProps> = (props) => {
//   const { onSelect } = props;

//   return (
//     <div
//       onClick={() => {
//         onSelect("WP");
//       }}
//     >
//       WP
//     </div>
//   );
// };

// {
//   "id": 18,
//   "title": "slider-2-wireframes-3",
//   "filename": "slider-2-wireframes-3.jpeg",
//   "url": "http://localhost:8888/wordpress/wp-content/uploads/2025/02/slider-2-wireframes-3.jpeg",
//   "link": "http://localhost:8888/wordpress/slider-2-wireframes-3/",
//   "alt": "",
//   "author": "1",
//   "description": "",
//   "caption": "",
//   "name": "slider-2-wireframes-3",
//   "status": "inherit",
//   "uploadedTo": 0,
//   "date": "2025-02-26T21:03:46.000Z",
//   "modified": "2025-02-26T21:03:46.000Z",
//   "menuOrder": 0,
//   "mime": "image/jpeg",
//   "type": "image",
//   "subtype": "jpeg",
//   "icon": "http://localhost:8888/wordpress/wp-includes/images/media/default.svg",
//   "dateFormatted": "February 26, 2025",
//   "nonces": {
//       "update": "bddc9a5c34",
//       "delete": "69076db37a",
//       "edit": "67fefd537a"
//   },
//   "editLink": "http://localhost:8888/wordpress/wp-admin/post.php?post=18&action=edit",
//   "meta": false,
//   "authorName": "root",
//   "authorLink": "http://localhost:8888/wordpress/wp-admin/profile.php",
//   "filesizeInBytes": 171088,
//   "filesizeHumanReadable": "167 KB",
//   "context": "",
//   "height": 800,
//   "width": 1200,
//   "orientation": "landscape",
//   "sizes": {
//       "thumbnail": {
//           "height": 150,
//           "width": 150,
//           "url": "http://localhost:8888/wordpress/wp-content/uploads/2025/02/slider-2-wireframes-3-150x150.jpeg",
//           "orientation": "landscape"
//       },
//       "medium": {
//           "height": 200,
//           "width": 300,
//           "url": "http://localhost:8888/wordpress/wp-content/uploads/2025/02/slider-2-wireframes-3-300x200.jpeg",
//           "orientation": "landscape"
//       },
//       "large": {
//           "height": 683,
//           "width": 1024,
//           "url": "http://localhost:8888/wordpress/wp-content/uploads/2025/02/slider-2-wireframes-3-1024x683.jpeg",
//           "orientation": "landscape"
//       },
//       "full": {
//           "url": "http://localhost:8888/wordpress/wp-content/uploads/2025/02/slider-2-wireframes-3.jpeg",
//           "height": 800,
//           "width": 1200,
//           "orientation": "landscape"
//       }
//   },
//   "compat": {
//       "item": "",
//       "meta": ""
//   }
// }

async function uploadImages(images: any[]) {}

async function processImages(images: any[]) {
  return images;
}

export const WpMyImageSelect: React.FC<getMyUploadComponentProps> = (props) => {
  const { onStop, onComplete, type } = props;

  const onSelect = useCallback(async (attachments: any) => {
    console.log(attachments, "ovde123");
    const images = await processImages(attachments);
    await uploadImages(images);

    onComplete();
  }, []);

  useEffect(() => {
    initWP(onSelect);
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

function initWP(onSelect: (attachments: any) => void) {
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
          type: ["application/x-font-ttf", "font/woff", "image"], // Restrict to images only
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

        console.log(attachment); // You can see all the attachment details in the console
      });

      imageUploader.open();
    });
  });
}
