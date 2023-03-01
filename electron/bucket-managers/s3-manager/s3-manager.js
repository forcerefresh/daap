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

  async getPublishDetails(bucketConfig, projectId) {
    return {
      bucketUrl: `https://${bucketConfig.bucketName}.s3.${bucketConfig.region}.amazonaws.com/`,
      baseUrl: `https://${bucketConfig.bucketName}.s3.${bucketConfig.region}.amazonaws.com/${projectId}/`,
      indexUrl: `https://${bucketConfig.bucketName}.s3.${bucketConfig.region}.amazonaws.com/${projectId}/index.html`,
      debugUrl: `https://${bucketConfig.bucketName}.s3.${bucketConfig.region}.amazonaws.com/${projectId}/debug.html`,
      jsonUrl: `https://${bucketConfig.bucketName}.s3.${bucketConfig.region}.amazonaws.com/${projectId}/slider.json`,
      playerUrl: `https://${bucketConfig.bucketName}.s3.${bucketConfig.region}.amazonaws.com/wsplayer/2023.02.28/wsplayer.js`,
    };
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
          console.log(putErr);
          reject(putErr);
        } else {
          resolve();
        }
      });
    });

    await p;
  }
}

module.exports = {
  S3Manager,
};
