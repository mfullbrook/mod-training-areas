import requests
from lxml import html
from collections import namedtuple
import re

months = 'January|February|March|April|May|June|July|August|September|October|November|December'
pageLinkRe = re.compile(rf'^(.+) (firing times|closure times) ({months}) (\d{{4}})(?: \(updated (.+)\))?')
GuidancePage = namedtuple('GuidancePage', ['url', 'name', 'type', 'month', 'year', 'updated'])


def read_guidance_index(url):
    page = requests.get(url)
    tree = html.fromstring(page.content)
    links = tree.xpath('//section[@class="attachment embedded"]/div[2]/h2/a')

    def link_extractor(link):
        match = pageLinkRe.match(link.text)
        return GuidancePage(
            url=link.get('href'),
            name=match[1],
            type=match[2],
            month=match[3],
            year=match[4],
            updated=match[5]
        )

    return map(link_extractor, links)


if __name__ == '__main__':
    pages = read_guidance_index('https://www.gov.uk/government/publications/south-east-training-estate-firing-times')
    for page in pages:
        print(page.name)
        
