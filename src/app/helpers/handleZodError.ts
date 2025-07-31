import { TErrorSources, TGenericErrorResponse } from "../interfaces/error.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleZodError  =(err : any) : TGenericErrorResponse => {
    const errorSources: TErrorSources[] = [];

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   err.issues.forEach((issue: any) => { errorSources.push({
        path : issue.path[issue.path.length - 1],
        message: issue.message
    })})

    return {
        statusCode: 400,
        message: "Validation Error",
        errorSources

    }

}