// tool to throw app error 
class AppError extends Error{
    constructor(message, statusCode){
        super()
        this.message = message
        this.statusCode = statusCode
    }
}

module.exports = AppError