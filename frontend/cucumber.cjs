module.exports = {
  default: {
    require: ['features/step_definitions/**/*.js'],
    format: ['@cucumber/pretty-formatter'],
    paths: ['features/**/*.feature']
  }
};