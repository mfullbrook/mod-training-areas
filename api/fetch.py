import requests
from lxml import html

page = requests.get('https://www.gov.uk/government/publications/south-east-training-estate-firing-times')
tree = html.fromstring(page.content)
links = tree.xpath('//section[@class="attachment embedded"]/div[2]/h2/a')

for link in links:
    print(link.get('href'))
    print(link.text())

