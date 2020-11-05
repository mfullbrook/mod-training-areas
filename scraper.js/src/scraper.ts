import { EventBridgeHandler } from 'aws-lambda'
import { JSDOM } from 'jsdom'
import LocationRecord from './LocationRecord'
import partition from 'lodash.partition'

const FIRING = 'firing times'
const CLOSURE_TIMES = 'closure times'
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const monthsPattern = months.join('|')
// Note: double backslash needed in template literals
const guidancePageRe = new RegExp(`^(?<name>.+) (?<type>firing times|closure times) (?<month>${monthsPattern}) (?<year>\\d{4})(?: \\(updated (?<updated>.+)\\))?`)
const dateRe = new RegExp(`^(\\d{1,2}) (${monthsPattern})$`)


interface GuidancePage {
  url: string,
  areaName: string,
  name: string,
  type: string, // TODO: make constant
  year: number,
  month: number,
  updated?: Date
}


async function getAttachmentsFromAreaListing(url: string, areaName: string): Promise<GuidancePage[]> {
  const dom = await JSDOM.fromURL(url)
  const links = dom.window.document.querySelectorAll('section.attachment > div.attachment-details > h2 > a')
  return Array.from(links).map((link: HTMLLinkElement) => {
    // split the link name into the info pieces
    const parts = guidancePageRe.exec(link.textContent)
    if (parts === null) {
      console.log('Unable to extract data from attachment: ' + link.textContent)
    }
    let { name, type, month, year } = parts.groups
    const yearInt = Number(year)
    let updated = null

    // parse the updated date
    if (parts.groups.updated) {
      const dateParts = dateRe.exec(parts.groups.updated)
      updated = new Date(yearInt, months.indexOf(dateParts[2]), Number(dateParts[1]))
    }

    return {
      url: link.href,
      areaName,
      name,
      type,
      year: yearInt,
      month: months.indexOf(month),
      updated
    }
  })
}

interface ClosureDay {
  day: number,
  closed: Boolean
  info: string
}

async function fetchAndProcessClosureTimes(page: GuidancePage) {
  const dom = await JSDOM.fromURL(page.url)
  const tables = dom.window.document.querySelectorAll('h2 + table')
  tables.forEach(async table => {
    // fetch the location
    let subAreaName = table.previousElementSibling.textContent
    subAreaName = subAreaName.replace(' closure times', '')
    const locationName = page.name + ' ' + subAreaName
    const location = await LocationRecord.find(page.areaName, locationName)

    // bail if up to date
    if (location.isUpToDate(page.updated)) {
      return
    }

    // get the rows from the table and convert data
    const rows = table.querySelectorAll('tbody > tr')
    const days: ClosureDay[] = Array.from(rows).map((row: HTMLTableRowElement) => {
      return {
        day: parseInt(row.children[0].textContent),
        closed: row.children[1].textContent !== 'Open to Public',
        info: row.children[2].textContent
      }
    })

    

    location.save()
  })
}

async function processFiringTimes(page: GuidancePage) {
  const location = await LocationRecord.find(page.areaName, page.name)
  if (location.isUpToDate(page.updated)) {
    return
  }

}




export const scraperHandler: EventBridgeHandler<string, void, void> = async (event, context) => {
  LocationRecord.init(process.env.LOCATIONS_TABLE || 'InfrastructureStack-LocationsTable963AECFA-180XYBG240JGV')
  //MonthRecord.init(process.env.LOCATIONS_TABLE || 'InfrastructureStack-MonthsTable470D72F7-1E8AS9JPLPWW')

  const attachments = await getAttachmentsFromAreaListing(
    'https://www.gov.uk/government/publications/south-east-training-estate-firing-times',
    'south-east-training-estate'
  )

  // process any closure times separately from firing times
  const [closuresTimes, firingTimes] = partition(attachments, v => v.type === CLOSURE_TIMES)

  await Promise.all(
      closuresTimes.map(async (attachment) => fetchAndProcessClosureTimes(attachment))
  )
  
  await Promise.all(
    firingTimes.map(async (attachment) => processFiringTimes(attachment))
  )  
}
