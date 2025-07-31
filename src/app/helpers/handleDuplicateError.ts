import { TGenericErrorResponse } from "../interfaces/error.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleDuplicateError = (error: any): TGenericErrorResponse => {
    const matchedArray = error.message.match(/"([^"]*)"/);

    return {
        statusCode : 400,
        message: `${matchedArray ? matchedArray[1] : 'Duplicate entry'} already exists`,
    }


}