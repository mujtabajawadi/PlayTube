//Promises method:
const asyncHandler = (requestFunction) => async (req, res, next) => {
  (req, res, next) => {
    Promise.resolve(requestFunction(req, res, next)).catch((error) =>
      next(error)
    );
  };
};

//Try-catch block method:
// const asyncHandler = (requestFunction) => async (req, res, next) => {
//   try {
//     await requestFunction(req, res, next); 
//   } catch (error) {
//     res.status(error.code || 500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

export { asyncHandler };
