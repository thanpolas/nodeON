
var userfix = module.exports = {};

userfix.one = {
  firstName: 'John',
  lastName: 'Doe',
  company: 'Slack Corp.',
  email: 'pleasant@hq.com',
  password: '123456',
};

userfix.oneFull = {
  firstName: 'John',
  lastName: 'Doe',
  company: 'Slack Corp.',
  email: 'pleasant@hq.com',
  password: '123456',
  policy: 'free',
  // Roles and access
  isVerified: true,
  isDisabled: false,
  isAdmin: false,
};

userfix.two = {
  firstName: 'Mark',
  lastName: 'Danna',
  company: 'Acme inc',
  email: 'pleasant@acme.com',
  password: '098',
};

userfix.three = {
  firstName: 'Maria',
  lastName: 'Dancer',
  company: 'Pink Corp.',
  email: 'pink@pink.com',
  password: '098',
  policy: 'free',
  // Roles and access
  isVerified: true,
  isDisabled: false,
  isAdmin: false,
};
