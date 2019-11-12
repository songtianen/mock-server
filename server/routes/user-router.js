/* eslint-disable handle-callback-err */
const express = require('express');
const jwt = require('jsonwebtoken');
const { UserModel } = require('../model/model'); // 引入模型
const { md5PWD, secretKey } = require('../util/md5');
const { businessError, success } = require('../lib/responseTemplate');
const { PermissionCheck } = require('../middleware/PermissionCheck');
const { checkRegister } = require('../middleware/CheckRegisterInfo');
const { randomNum } = require('../util/util');
const { postRegister } = require('../controllers/user');

const {
  getUserInfo,
  getUserPagelist,
  postEditRoleuser,
  getAllUser,
} = require('../controllers/user');

const User = UserModel;
const router = express.Router();

// 获取用户列表

// 用户登录接口
router.post('/login', (req, res) => {
  console.log('user/login', req.body);
  const { username, password, type } = req.body;
  const phone = req.body.mobile || '';
  const captcha = req.body.captcha || '';
  // User.create({ userName: req.body.username, pwd: md5PWD(req.body.password) })
  // User.update({ userName: username }, { $set: { userRole: [ 'role_test', 'role_website_admin' ] } }, function(err, doc) {
  //   console.log('更新数据库测试', doc)
  // })
  // User.update({ userName: username }, { $set: { isAdmin: true } }, function (err, doc) {
  //   console.log('更新数据库测试', doc)
  // })
  if (type === 'account') {
    User.findOne(
      {
        // 判断密码是否正确
        userName: username,
        pwd: md5PWD(password),
      },
      (err, user) => {
        console.log('user--', user);
        if (user !== null) {
          const tokenObj = {
            username: user.userName,
            currentAuthority: user.isAdmin,
            userId: user._id,
          };
          // 用户登录成功过后生成token返给前端
          let token = jwt.sign(tokenObj, secretKey, {
            expiresIn: '24h', // 授权时效24小时
          });
          success({
            res,
            data: { accessToken: token, currentAuthority: user.isAdmin },
          });
        } else {
          businessError({
            res,
            msg: '用户名或密码错误',
            data: { type: 'account' },
          });
        }
      },
    );
  }
  if (type === 'mobile') {
    // 验证手机验证码
    if (phone && captcha) {
      businessError({ res, msg: '请使用用户名登陆', data: { type: 'mobile' } });
    }
  }
});
// 注册
router.post('/register', checkRegister(), (req, res) => {
  postRegister({ req, res });
});
router.post('/logout', (req, res) => {
  return success({ res, data: { logout: true } });
});
// 用户注册接口
router.get('/currentUser', (req, res) => {
  console.log('getuserinfo user=====', req.user);
  getUserInfo({ req, res });
});
// 获取验证码
router.get('/capcha', (req, res) => {
  console.log('获取验证码');
  success({ res, msg: '获取验证码成功', data: randomNum(1000, 9999) });
  // getUserPagelist({ req, res });
});
router.get('/pagedlist', (req, res) => {
  getUserPagelist({ req, res });
});
router.post(
  '/editroleuser',
  PermissionCheck({
    permission: ['role_user_edit', 'user_role_edit'],
  }),
  (req, res) => {
    postEditRoleuser({ req, res });
  },
);
router.post(
  '/getalluser',
  PermissionCheck({
    permission: ['role_user_edit', 'user_role_edit'],
  }),
  (req, res) => {
    getAllUser({ req, res });
  },
);

module.exports = router;
