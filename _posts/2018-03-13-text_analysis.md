




---------------
# Extract content from blog posts

For me, one of the best python packages to crawl article based content is [goose](https://github.com/goose3/goose3)

```
from goose3 import Goose
from pprint import pprint

g = Goose({'strict': False, 'http_timeout' : 2.})
article = g.extract(url='https://en.wikipedia.org/wiki/Web_crawler')
data=article.infos # get all infos in json format
pprint(data)
```



---

# Extract content from files

1. Launch tika server

[Tika] (http://tika.apache.org) is a toolkit that detects and extracts metadata and text from over a thousand different file types (such as PPT, XLS, and PDF)


The most simple way to launch a local tika server is via a prepared docker file. [Docker](https://www.docker.com) is a full development platform for creating containerized apps.

```
    docker pull logicalspark/docker-tikaserver # only on initial download/update
    docker run --rm -p 9998:9998 logicalspark/docker-tikaserver
```

the tika server is now up on port 9998

2. Send content to local server
By using the python tika [package] (https://pypi.python.org/pypi/tika) we can send request to the local server by just a view lines

```
from tika import parser
tika.TikaClientOnly = True
server_path='http://0.0.0.0:9998/'

parsed = parser.from_file(<filename>,server_path)

print(parsed["metadata"])
print(parsed["content"])
```
The retun value is a json file the extracted content
