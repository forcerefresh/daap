const AWS = require("aws-sdk");
const fs = require("fs");
var mime = require("mime-types");
const fetch = require("node-fetch");
const { downloadToBuffer } = require("../../utils/utils");

class LinodeManager {
  s3;

  constructor(bucketConfig) {
    this.s3 = new AWS.S3({
      accessKeyId: bucketConfig.key,
      secretAccessKey: bucketConfig.secretKey,
      endpoint: `https://${bucketConfig.region}.linodeobjects.com`,
    });
  }

  async getPublishUrl(bucketConfig, projectId) {
    return `https://${bucketConfig.bucketName}.${bucketConfig.region}.linodeobjects.com/${projectId}/index.html`;
  }

  async uploadFileToBucket(bucketConfig, filePath, key) {
    console.log("12345r");
    const p = new Promise((resolve, reject) => {
      // create stream
      const fileStream = fs.createReadStream(filePath);
      var putParams = {
        Bucket: bucketConfig.bucketName,
        Key: key,
        Body: fileStream,
        ContentType: mime.lookup(key),
        ACL: "public-read",
      };

      // upload file to s3
      this.s3.putObject(putParams, function (putErr, putData) {
        if (putErr) {
          console.log(putErr);

          reject(putErr);
        } else {
          resolve();
        }
      });
    });

    await p;

    // return response
    const toUrl = `https://${bucketConfig.bucketName}.${bucketConfig.region}.linodeobjects.com/${key}`;
    return {
      log: `From '${filePath}' to '${toUrl}'`,
      fromUrl: filePath,
      toUrl: toUrl,
    };
  }

  async uploadUrlToBucket(bucketConfig, fromUrl, toKey) {
    // download file
    const bufferStream = await downloadToBuffer(fromUrl);

    // upload file
    await this.uploadBufferToBucket(bucketConfig, bufferStream, toKey);

    // return response
    const toUrl = `https://${bucketConfig.bucketName}.${bucketConfig.region}.linodeobjects.com/${toKey}`;
    return {
      log: `From '${fromUrl}' to '${toUrl}'`,
      fromUrl,
      toUrl,
    };
  }

  async uploadBufferToBucket(bucketConfig, bufferStream, key) {
    console.log(key);
    console.log(mime.lookup(key));

    const p = new Promise((resolve, reject) => {
      var putParams = {
        Bucket: bucketConfig.bucketName,
        Key: key,
        Body: bufferStream,
        ContentType: mime.lookup(key),
        ACL: "public-read",
      };
      console.log("2345tfdssfdbgdfsdafgfhfgfd");
      this.s3.putObject(putParams, function (putErr, putData) {
        console.log(putData);
        if (putErr) {
          console.log(putErr);
          reject(putErr);
        } else {
          console.log("RESOLVE");
          resolve();
        }
      });
    });

    console.log("Aaaa");
    await p;
    console.log("Aaaa");
  }
}

module.exports = {
  LinodeManager,
};
