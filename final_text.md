# PLOS Cloud Explorer

## Problem Statement
The open access (OA) publishing movement promises to enrich the public domain with knowledge and scholarship previously confined to restricted-access journals. Despite the major potential benefits of OA, and of the internet in general, to the public understanding of science, academic journals are still largely inaccessible on a cultural level.
Here we focus on the challenge of getting a summary-level picture of a particular area of research. Our goal is to create an experience that allows both researchers and curious members of the general public to explore research trends and interactions between research topics. We are not aware of any current interactive tool that facilitates such interactions.

## Data
Here we used open-access content published in the [Public Library of Science (PLOS)](http://www.plos.org/) journals. The [PLOS Search API](http://api.plos.org/), which provides access to full article data and metadata, allowed us to extract article titles, abstracts, publication dates, and subject areas (keywords) that are part of the [PLOS Thesaurus](http://www.plosone.org/taxonomy). 

## Our Process

### Initial Plans
Our initial plan was to present word clouds drawn from aggregated abstract text for a chosen subject area. We thought abstracts, which are summaries of articles, would reflect the research topics in their text. However, we encountered difficulties when we realized that the most frequent words in scientific literature are not necessarily topical. 

### Change of Course
After exploring the data obtainable through the PLOS API, we saw that each article is associated with a rich set of subject terms, and the position of those terms within the PLOS subject area polyhierarchy (i.e., thesaurus) is also specified. We realized that these subject terms constitute meaningful and well-organized textual and structural information, which we could work with much more fruitfully than with abstract text.

Since the PLOS website interface currently only allows users to view the subject hierarchy either through a large list or individual branches, we decided to create an interactive tree that illuminates a larger structural context of the relationships between research areas. 

In addition to the tree visualization, we also compute a word cloud for each subject area, which shows what else those articles that are tagged with that subject are *about*. This is computed by counting the frequencies of other subject terms in the set of articles that contain the selected subject area.

The tree and word cloud visualizations can be interactively filtered by restricting the publication date range.

## What's behind the scenes

> Note: for an overview our entire process with code examples for every step, see [this notebook](http://nbviewer.ipython.org/github/cmgerber/PLOS_Cloud_Explorer/blob/master/ipython_notebooks/Explanation.ipynb).

### We downloaded bulk data from PLOS API

> [Notebook link](!!!!!!)

In order to collect a full dataset from the PLOS Search API, we used a Python script to download data for 115489 acticles -- all articles ever published in PLOS journals and accessible through the API -- while respecting the limits on the frequency and number of API calls. After some trial and error, a successful bulk download took only three hours.

The resulting dataset contains the following for each article:
* article DOI
* title
* authors
* journal name
* publication date
* abstract text (not all articles)
* subject areas

#### Subject areas

These data describe article subject areas in a very useful way. The "subject area" field is a list of strings, and each string encodes a path through the polyhierarchy. For example:

```
[u'/Computer and information sciences/Information technology/Data processing',
 u'/Computer and information sciences/Information technology/Data reduction',
 u'/Biology and life sciences/Ecology/Biodiversity',
 u'/Ecology and environmental sciences/Sustainability science',
 u'/Biology and life sciences/Organisms/Animals/Vertebrates/Mammals',
 u'/Computer and information sciences/Computer networks',
 u'/Computer and information sciences/Computing methods/Cloud computing',
 u'/Ecology and environmental sciences/Ecology/Biodiversity',
 u'/Biology and life sciences/Organisms/Animals/Vertebrates']
```

The entire PLOS polyhierarchy was kindly provided to us as a spreadsheet with thousands of rows, one node per row. 


### We transformed the data into two JSON objects

> [Notebook link](!!!!!!) [link TBA]

#### Article data
We transformed the article data (a 400 MB pickled DataFrame) into a JSON object containing a list of articles (indexed by DOI) and the data about them. Due to the large file size, we excluded several pieces of information that we weren't immediately using in our data visualization (though we could add these back later). Currently, each article in the JSON object has the publication date (truncated to year only) and the list of subject area paths that were provided by the API. In addition, for each article, we calculated the set of top-level (root) and lowest-level (leaf) terms that appear in its subject area field. We explain how these are used below.

#### Subject tree
We transformed the PLOS Polyhierarchy from its spreadsheet representation into a JSON object with a tree structure. For each node in the tree, we also calculated the number of articles that include that node in their subject area paths (using string search). This allows us to visualize the "size" of each node in the tree.


### We used JavaScript to interactively visualize the data

We used D3.js, JQuery, and Dimple.js to create a dashboard for interactive exploration of the PLOS data. This dashboard presents two control elements:

* an interactive SVG visualization of the subject area tree, allowing sub-trees to be selected;
* a graph of the total number of articles over the time, allowing a specific time span to be selected. 

For the selected time span and subject area, the dashboard displays:

* a bar graph of the number of articles per year matching any of the subjects under that node;
* a histogram of the distribution of top-level subject terms;
* a word cloud composed of the leaf-level subject terms associated with all the articles.


## Results
> a clear description of your results and how to reproduce your results. if you were to continue your project beyond the course, what would you do

> [Try the web app!](!!!!!!) [link TBA]

Our visualization reveals interesting things about the research articles in PLOS journals. By selecting a subject area node, you can see from the word cloud and the histogram that research areas are highly interconnected. You can observe and explore trends in the number of articles over time for a given set of subjects (using the time series graphs), and also trends in the associations among subjects (using the histogram and word cloud).

### Reproducing our results

You can reproduce this by cloning the [Git repository](https://github.com/cmgerber/PLOS_Cloud_Explorer), and running the Python code in `ipython_notebooks/Explanation.ipynb` if desired. To run the web app, in a shell from the root directory of the repository, execute `python -m SimpleHTTPServer` and visit [http://localhost:8000/](http://localhost:8000/) in your browser.

### Future Plans
We would like to be able to show users specific articles that match the subject areas and time ranges that they are exploring. We would need to reintroduce some of the article metadata that we filtered out to reduce the size of the dataset: article titles, authors, and journals. 


### List of technologies/packages used

**Python**
* IPython notebook
* requests
* numpy
* pandas
* NLTK
* json

**JavaScript**
* JQuery
* Dimple.js
* D3.js

**CSS**


## Distribution of work

Anna worked on bulk data download, communication with PLOS staff, web app coding, and web app design. Colin worked on bulk data download, article data analysis, web app coding, and web app design. Akos worked on article data analysis, article & thesaurus data transformation, and documentation.
