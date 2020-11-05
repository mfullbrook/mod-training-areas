const { JSDOM } = jest.requireActual('jsdom')


const urls = {
  'https://www.gov.uk/government/publications/south-east-training-estate-firing-times': 'south_east_times.html'
}

let currentFile = null;

// mockJSDOM.__setFile = name => {
//   currentFile = name
// }

JSDOM.fromURL = (url) => {
  if (!urls[url]) {
    throw `URL ${url} is not mocked for JSDOM.fromUrl()`
  }
  console.info('Mocked fromURL called')
  return JSDOM.fromFile('./__mocks__/' + urls[url])
}

console.log('jsdom MOCKs')

module.exports = { 
  JSDOM
}
