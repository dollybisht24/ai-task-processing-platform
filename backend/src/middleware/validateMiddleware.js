const { errorResponse } = require('../utils/apiResponse');

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const result = schema.safeParse(dataToValidate);

      if (!result.success) {
        const formattedErrors = result.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return errorResponse(res, 'Validation failed', 400, formattedErrors);
      }

      // Assign parsed/transformed data back
      req[source] = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = validate;
