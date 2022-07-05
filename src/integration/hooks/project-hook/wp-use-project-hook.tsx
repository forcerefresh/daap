import React from "react";

// TODO: implement this !
export const useProjectHook = () => {
  const getProjects = (type: "image" | "video"): Promise<any> => {
    return new Promise((resolve) => {
      resolve({
        id: "3",
        name: "Name 3",
        description: "Name 3",
        thumbnail: "thumb.jpg",
      });
    });
  };
  return { getProjects };
};
