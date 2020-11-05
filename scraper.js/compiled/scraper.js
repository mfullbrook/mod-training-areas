"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scraperHandler = void 0;
const jsdom_1 = require("jsdom");
const LocationRecord_1 = __importDefault(require("./LocationRecord"));
const lodash_partition_1 = __importDefault(require("lodash.partition"));
const FIRING = 'firing times';
const CLOSURE_TIMES = 'closure times';
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const monthsPattern = months.join('|');
// Note: double backslash needed in template literals
const guidancePageRe = new RegExp(`^(?<name>.+) (?<type>firing times|closure times) (?<month>${monthsPattern}) (?<year>\\d{4})(?: \\(updated (?<updated>.+)\\))?`);
const dateRe = new RegExp(`^(\\d{1,2}) (${monthsPattern})$`);
async function getAttachmentsFromAreaListing(url, areaName) {
    const dom = await jsdom_1.JSDOM.fromURL(url);
    const links = dom.window.document.querySelectorAll('section.attachment > div.attachment-details > h2 > a');
    return Array.from(links).map((link) => {
        // split the link name into the info pieces
        const parts = guidancePageRe.exec(link.textContent);
        if (parts === null) {
            console.log('Unable to extract data from attachment: ' + link.textContent);
        }
        let { name, type, month, year } = parts.groups;
        const yearInt = Number(year);
        let updated = null;
        // parse the updated date
        if (parts.groups.updated) {
            const dateParts = dateRe.exec(parts.groups.updated);
            updated = new Date(yearInt, months.indexOf(dateParts[2]), Number(dateParts[1]));
        }
        return {
            url: link.href,
            areaName,
            name,
            type,
            year: yearInt,
            month: months.indexOf(month),
            updated
        };
    });
}
async function fetchAndProcessClosureTimes(page) {
    const dom = await jsdom_1.JSDOM.fromURL(page.url);
    const tables = dom.window.document.querySelectorAll('h2 + table');
    tables.forEach(async (table) => {
        // fetch the location
        let subAreaName = table.previousElementSibling.textContent;
        subAreaName = subAreaName.replace(' closure times', '');
        const locationName = page.name + ' ' + subAreaName;
        const location = await LocationRecord_1.default.find(page.areaName, locationName);
        // bail if up to date
        if (location.isUpToDate(page.updated)) {
            return;
        }
        // get the rows from the table and convert data
        const rows = table.querySelectorAll('tbody > tr');
        const days = Array.from(rows).map((row) => {
            return {
                day: parseInt(row.children[0].textContent),
                closed: row.children[1].textContent !== 'Open to Public',
                info: row.children[2].textContent
            };
        });
        location.save();
    });
}
async function processFiringTimes(page) {
    const location = await LocationRecord_1.default.find(page.areaName, page.name);
    if (location.isUpToDate(page.updated)) {
        return;
    }
}
exports.scraperHandler = async (event, context) => {
    LocationRecord_1.default.init(process.env.LOCATIONS_TABLE || 'InfrastructureStack-LocationsTable963AECFA-180XYBG240JGV');
    //MonthRecord.init(process.env.LOCATIONS_TABLE || 'InfrastructureStack-MonthsTable470D72F7-1E8AS9JPLPWW')
    const attachments = await getAttachmentsFromAreaListing('https://www.gov.uk/government/publications/south-east-training-estate-firing-times', 'south-east-training-estate');
    // process any closure times separately from firing times
    const [closuresTimes, firingTimes] = lodash_partition_1.default(attachments, v => v.type === CLOSURE_TIMES);
    await Promise.all(closuresTimes.map(async (attachment) => fetchAndProcessClosureTimes(attachment)));
    await Promise.all(firingTimes.map(async (attachment) => processFiringTimes(attachment)));
};
//# sourceMappingURL=scraper.js.map