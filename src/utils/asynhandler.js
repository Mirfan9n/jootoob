const asynchandler= (requestHandler)=>{
    return (req, res, next)=>{
        Promise
        .resolve(requestHandler(req, res, next))
        .catch((err)=> next(err))
    }
}
export {asynchandler}


// const asyncHandler = (fn) => () => { }  
// normally 
// const asyncHandler = (  Func pass hora H YHA  to uske arguments ?? ) => { }
// const asyncHandler = (fn) => { async( arguments yha aaenge ) => { } }
                        // uper Promise use kra h isilie async ni lagaya
                        // no need for try catch