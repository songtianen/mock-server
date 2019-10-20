let businessError = ({ res, data = '', msg = '' }) => {
  return res.json({
    statusCode: 500,
    msg: msg,
    data: data,
  });
};

let success = ({ res, data = '', msg = '' }) => {
  return res.json({
    status: 'ok',
    msg: msg,
    data: data,
  });
};
module.exports = {
  success,
  businessError,
};
