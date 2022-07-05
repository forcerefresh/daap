const AWS = require("aws-sdk");
const fs = require("fs");
var mime = require("mime-types");
const { downloadToBuffer } = require("../../utils/utils");

class DigitalOceanManager {
  s3;

  constructor(bucketConfig) {
    this.s3 = new AWS.S3({
      endpoint: `https://${bucketConfig.region}.digitaloceanspaces.com`,
      region: "us-east-1",
      credentials: {
        accessKeyId: bucketConfig.key,
        secretAccessKey: bucketConfig.secretKey,
      },
      accessKeyId: bucketConfig.key,
      secretAccessKey: bucketConfig.secretKey,
    });
  }

  async getPublishUrl(bucketConfig, projectId) {
    return `https://${bucketConfig.bucketName}.${bucketConfig.region}.digitaloceanspaces.com/${projectId}/index.html`;
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
        ACL: "public-read",
      };

      console.log(putParams);
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
    const toUrl = `https://${bucketConfig.bucketName}.${bucketConfig.region}.digitaloceanspaces.com/${key}`;
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
    const toUrl = `https://${bucketConfig.bucketName}.${bucketConfig.region}.digitaloceanspaces.com/${toKey}`;
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
        ACL: "public-read",
      };
      this.s3.putObject(putParams, function (putErr, putData) {
        if (putErr) {
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
  DigitalOceanManager,
};
