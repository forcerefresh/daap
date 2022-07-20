const AWS = require("aws-sdk");
const fs = require("fs");
var mime = require("mime-types");
const fetch = require("node-fetch");
const { downloadToBuffer } = require("../../utils/utils");

class S3Manager {
  s3;

  constructor(bucketConfig) {
    this.s3 = new AWS.S3({
      accessKeyId: bucketConfig.key,
      secretAccessKey: bucketConfig.secretKey,
    });
  }

  async getPublishUrl(bucketConfig, projectId) {
    return `https://${bucketConfig.bucketName}.s3.${bucketConfig.region}.amazonaws.com/${projectId}/index.html`;
  }

  async uploadFileToBucket(bucketConfig, filePath, key) {
    const p = new Promise((resolve, reject) => {
      // create stream
      const fileStream = fs.createReadStream(filePath);
      var putParams = {
        Bucket: bucketConfig.bucketName,
        Key: key,
        Body: fileStream,
        ContentType: mime.lookup(key),
      };

      // upload file to s3
      this.s3.putObject(putParams, function (putErr, putData) {
        if (putErr) {
          reject(putErr);
        } else {
          resolve();
        }
      });
    });

    await p;

    // return response
    const toUrl = `https://${bucketConfig.bucketName}.s3.${bucketConfig.region}.amazonaws.com/${key}`;
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
    const toUrl = `https://${bucketConfig.bucketName}.s3.${bucketConfig.region}.amazonaws.com/${toKey}`;
    return {
      log: `From '${fromUrl}' to '${toUrl}'`,
      fromUrl,
      toUrl,
    };
  }

  async uploadBufferToBucket(bucketConfig, bufferStream, key) {
    const p = new Promise((resolve, reject) => {
      var putParams = {
        Bucket: bucketConfig.bucketName,
        Key: key,
        Body: bufferStream,
        ContentType: mime.lookup(key),
      };
      this.s3.putObject(putParams, function (putErr, putData) {
        if (putErr) {
          console.log("putErr");
          reject(putErr);
        } else {
          console.log("123");

          resolve();
        }
      });
    });

    console.log("234321234323453");
    await p;
    console.log("234321234323453");
  }
}

module.exports = {
  S3Manager,
};
