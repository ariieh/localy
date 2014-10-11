var projectDir = __dirname;

module.exports = GLOBAL.projRequire = function(module) {
  return require(projectDir + module);
}
