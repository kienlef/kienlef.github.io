---
title: Data science for personalized trend detection
tags: BestPractices
article_header:
  type: cover
  image:
    src: /screenshot.png
---





During my work as a data scientist I carefully follow the trends in the ﬁeld of artificial intelligence. This post describes one task I regularly perform to analyze the value proposition of different companies
<!--more-->
During the last years I collected data and the value proposition of more than 2k data science companies.


When playing with the data pool I do most of the time fast prototyping while working with new service in the market to see if they meet my expectations. In part, I have tested different Machine Learning Service from different providers (mainly SAP and Azure) for topic detection. As a data scientists I always try to combine a purpose (business understanding) with IT and machine learning know-how.

Since data science is more than machine learning I would like to point out the different techniques I used in the background for the rapid prototyping. Rapid prototyping or hacking is just like playing 'LEGO' - you have to know the right libraries / services. Please remember the rule of thumb:

**from prototype to production requires x100 more effort**
{:.warning}

Data Science work should always follow a certain iterative data science process: value -> model -> evaluation -> usage. Otherwise, you get lost in time spent by falling in love with real fun - machine learning.

One overall summary of this snapshot: 80% of the time is spent for data crawling / cleaning. I changed my own business objective of this exercise 3 times :-)

* Business Objective (personal): always being up to with new data science trends, checking value propositions, and perform automated ,digital maturity' test of companies
* Data Crawling / Cleaning: I realized to my surprise that twitter and of cause ,[hacker news](https://news.ycombinator.com/)' could be a good starting point to learn the latest trends. Most of the time I use available python packages (example description) for web crawling or a local tika server (launched via docker) to extract metadata and text from different file types (such as PPT, XLS, and PDF).
* Model Building / Value Enrichment: Google geocoding API to convert raw addresses to Lat & Lng Coordinates, machine learning services for topic detection and translation service. One technique / library I like a lot from natural language processing is automated text summarization. Note, that all these techniques are using machine learning techniques to extract or enrich value information.
* Data Visualization: often I use Leaflet maps (see figure, only 100 locations), it gives me a dynamic mapping of company locations, their value messages and the direct link for more information. In the background I implemented search options to filter companies on specific topics ( e.g. Supply Chain + Data Science).
* Usage: most of the time I explain these techniques in my data science lecture at the Technical University of Kaiserslautern. Additionally, in the last year I realize more and more the real value and great possibilities of the already cleaned and analyzed data.
For any questions or comments, just reply to this post or send me a message.

### Leaflet example
* Zoom out to see all companies
* Click on location to see the extracted text from web Crawling (done in 2018)
* Only 200 companies are included
<iframe src="/assets/data/leaflet_small.html" width="100%" height="400"></iframe>

### Some Python snippets
Popup via [folium](https://python-visualization.github.io/folium/) wrapper.
Manipulating the data in python and visualize interactive maps via [leaflet](https://leafletjs.com/)  
{% highlight python  linenos %}
  import folium
  import json
  from pprint import pprint

  m = folium.Map(location=[45.5236, -122.6750])
  folium.Marker([45.5236, -122.6750], popup='<i>Mt. Hood Meadows</i>').add_to(m)
{% endhighlight %}
