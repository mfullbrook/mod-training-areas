import requests
from lxml import html
from collections import namedtuple
import re
import boto3

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


def closure_times(page):
    print("Closure:" + page.name)


def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    locations_table = dynamodb.Table('InfrastructureStack-LocationsTable963AECFA-180XYBG240JGV')
    """ :type : pyboto3.dynamodb """
    pages = read_guidance_index('https://www.gov.uk/government/publications/south-east-training-estate-firing-times')

    for page in pages:
        locations_table.put_item(
            Item={
                'locationId': page.name,
                'type': page.type,
            }
        )
        print(page)
        if page.type == 'closure times':
            closure_times(page)

# http://www.jramoyo.com/2017/03/upserting-items-into-dynamodb.html

if __name__ == '__main__':
    lambda_handler(None, None)
