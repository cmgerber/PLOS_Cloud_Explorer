PLOS Cloud Explorer
======================

## Problem Statement
The open access (OA) publishing movement promises to enrich the public domain with knowledge and scholarship previously confined to restricted-access journals. Despite the major potential benefits of OA, and of the internet in general, to the public understanding of science, academic journals are still largely inaccessible on a cultural level.
Here we focus on the challenge of getting a summary-level picture of a particular area of research. Our goal is to create an experience that allows both researchers and curious members of the general public to explore research trends and interactions between research topics. We are not aware of any current interactive tool that facilitates such interactions.
 

## Data
Here we used open-access content published in the [Public Library of Science (PLOS)](http://www.plos.org/) journals. The [PLOS Search API](http://api.plos.org/), which provides access to full article data and metadata, allowed us to extract article titles, abstracts, publication dates, and subject areas (keywords) that are part of the [PLOS subject area polyhierarcy](http://www.plosone.org/taxonomy). 

## Our Process

#### Initial Plans
Our initial plan was to present word clouds drawn from aggregated abstract text for a chosen subject area. We thought abstracts, which are summaries of articles, would reflect the research topics in their text. However, we encountered difficulties when we realized that the most frequent words in scientific literature are not necessarily topical. 

#### Change of Course
After exploring the data obtainable through the PLOS API, we saw that each article is associated with a rich set of subject terms, and the position of those terms within the PLOS subject area polyhierarchy is also specified. We realized that these subject terms constitute meaningful and well-organized textual and structural information, which we could work with much more fruitfully than with abstract text.

Since the PLOS website interface currently only allows users to view the subject hierarchy either through a large list or individual branches, we decided to create an interactive tree that illuminates a larger structural context of the relationships between research areas. 

In addition to the tree visualization, we also compute a word cloud for each subject area, which shows what else those articles that are tagged with that subject are *about*. This is computed by counting the frequencies of other subject terms in the set of articles that contain the selected subject area.

The tree and word cloud visualizations can be interactively filtered by restricting the publication date range.

#### Technologies Used
**Python**
* numpy
* pandas
* NLTK

**JSON**

**JavaScript**
* JQuery
* Dimple.js
* D3.js


## Future Plans
Currently, our tool only uses the subset of PLOS article data that is tagged with "Computer and information sciences/Information technology" branch of the polyhierarchy. We plan to expand the tool to include a tree of the full polyhierarchy and a full set of publications across the other subject branches (Biology and life sciences, Earth sciences, Medicine and health sciences, etc.).
