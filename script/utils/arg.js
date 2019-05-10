module.exports.argv2option = () =>
  process.argv.reduce((param, arg) => {
    const argArray = arg.split('=')
    if (argArray.length !== 2) return param
    const [option, value] = argArray
    return {
      ...param,
      [option]: value
    }
  }, {})

module.exports.getArgOption = (option, key, defaultValue) =>
  option && option.hasOwnProperty(key) ? option[key] : defaultValue
