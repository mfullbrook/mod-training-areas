jest.mock('jsdom')
import { scraperHandler } from '../compiled/scraper.js';
import { JSDOM } from 'jsdom'


describe('Test for Scraper handler', function () {

  

  it('Fetches the page', async () => {
    return await scraperHandler({}, null)

  });
});
