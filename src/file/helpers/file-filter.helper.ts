import { HttpException, HttpStatus } from '@nestjs/common';

export const fileFilter = ( req: Express.Request, file: Express.Multer.File, callback: Function ) => {

    if ( !file ) callback( new Error('File is empty'), false );
    
    const fileExtension = file.mimetype.split('/')[1];
    const validExtensions = process.env.FILE_VALID_EXTENSIONS.split(',');
    
    if ( validExtensions.includes( fileExtension ) ) {
        callback( null, true );
    } else {
        callback( new HttpException({
            statusCode: HttpStatus.BAD_REQUEST,
            message: "Format not allowed, allow types: ['jpg','jpeg','png','gif']",
        }, HttpStatus.BAD_REQUEST), false );
    }

    
}

export const maxSize: number = 1000000;