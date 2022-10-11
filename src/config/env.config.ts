export const EnvConfiguration = () => ({
    enviroment: process.env.NODE_ENV || 'dev',
    mongodb: process.env.MONGODB,
    port: +process.env.PORT,
    apiVersion: process.env.API_VERSION,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN,
    serverUrl: process.env.SERVER_URL || `https://localhost:${ process.env.PORT }`,
    pagination: {
        defaultPage: +process.env.PAGINATION_DEFAULT_PAGE,
        defaultLimit: +process.env.PAGINATION_DEFAULT_LIMIT,
        defaultOrder: { 
            sort: { _id: +process.env.PAGINATION_DEFAULT_ORDER }
        },
    },
    uploadFilesSettings: {
        validExtensions: process.env.FILE_VALID_EXTENSIONS.split(','),
        fileMaxSize: +process.env.FILE_MAX_SIZE,
        fileUploadPlatform: process.env.FILE_UPLOAD_PLATFORM,
    },
    aws: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
        bucketName: process.env.AWS_S3_BUCKET_NAME,
    },
    mailService: {
        host: process.env.MAIL_HOST,
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
        from: process.env.MAIL_FROM,
    },
    smsService: {
        accountSid: process.env.SMS_ACCOUNT_SID,
        authToken: process.env.SMS_AUTH_TOKEN,
        messagingServiceSid: process.env.SMS_MESSAGING_SERVICE_SID,
    }
});