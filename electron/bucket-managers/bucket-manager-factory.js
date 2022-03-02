const { S3Manager } = require("./s3-manager/s3-manager");
const { LinodeManager } = require("./linode-manager/linode-manager");

function getBucketManagerClass(platform) {
  switch (platform) {
    case "s3": {
      return S3Manager;
    }
    case "linode": {
      return LinodeManager;
    }
    default: {
      return S3Manager;
    }
    /*case "linode": {
        return new AWS.S3({
          accessKeyId: bucketWithKeys.key,
          secretAccessKey: bucketWithKeys.secretKey,
          endpoint: `http://eu-central-1.linodeobjects.com`,
        });
      }*/
  }
}

module.exports = { getBucketManagerClass };
