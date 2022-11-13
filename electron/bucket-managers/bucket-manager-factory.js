const { S3Manager } = require("./s3-manager/s3-manager");
const { LinodeManager } = require("./linode-manager/linode-manager");
const {
  DigitalOceanManager,
} = require("./digital-ocean-manager/digital-ocean-manager");
const { info } = require("../utils/logger");

function getBucketManagerClass(platform) {
  switch (platform) {
    case "s3": {
      info("Using S3 bucket manager");
      return S3Manager;
    }
    case "linode": {
      info("Using Linode bucket manager");
      return LinodeManager;
    }
    case "digital-ocean": {
      info("Using DigitalOcean bucket manager");
      return DigitalOceanManager;
    }
    default: {
      return S3Manager;
    }
  }
}

module.exports = { getBucketManagerClass };
