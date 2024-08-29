import { NextFunction, Request, Response  } from "express"

const { validationResult } = require("express-validator")

export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)

    if(errors.isEmpty()) {
        return next()
    }

    const extractedErrors: any[] = []

    errors.array().map((err: { msg: any; }) => extractedErrors.push(err.msg)) 

    return res.status(400).json({
        error_code: "INVALID_DATA",
        error_description: extractedErrors
    })
}




