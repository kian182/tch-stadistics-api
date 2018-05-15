let config = {
  API_PATH: '/',
  setPATH: (path) => {
    if (path) {
      config.API_PATH = path
    }
  }
}

module.exports =  config