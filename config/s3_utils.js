const fs = require('fs');
const AWS = require('aws-sdk');

const s3bucket = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const fileUpload = async (file, questionId) => {
    try {
        let fileContentType = file.mimetype;
        let contentType = 'application/octet-stream';
        contentType = fileContentType;
        const fileName = file.fieldname + '.' + file.originalname.split('.')[1];
        let data = fs.readFileSync(file.path);
        let bucketName = process.env.AWS_BUCKET + '/images' + `/${questionId}`;
        let originalUpload = await uploadImageToS3(`${fileName}`, data, bucketName, contentType);
        fs.unlinkSync(file.path);
        return originalUpload;
    } catch (error) {
        console.log(error);
    }
}

const fileRemove = async (fileName, questionId) => {
    try {
        const bucketName = process.env.AWS_BUCKET + '/images' + `/${questionId}`;
        await removeImageToS3(`${fileName}`, bucketName);
    } catch (error) {
        return error;
    }
}

const uploadImageToS3 = (key, data, bucketName, contentType) => new Promise((resolve, reject) => {
    const params = {
        Key: key,
        Body: data,
        ContentType: contentType,
        Bucket: bucketName,
        ACL: 'public-read',
    };
    s3bucket.upload(params, async (error, fileInfo) => {
        if (error) {
            return reject(error);
        }
        return resolve(fileInfo.Location);
    });
});


const removeImageToS3 = (key, bucketName) => new Promise((resolve, reject) => {
    const params = {
        Key: key,
        Bucket: bucketName,
    };
    s3bucket.deleteObject(params, function (error, data) {
        if (error) {
            return reject(error);
        }
        return resolve(data);
    })
});

module.exports = {
    fileUpload,
    fileRemove
}
