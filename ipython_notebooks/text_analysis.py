import nltk
from nltk.corpus import stopwords
import string
from numpy import nan
from pandas import Series

# Globally define a set of stopwords.
stops = set(stopwords.words('english'))
# We can add science-y stuff to it as well. Just an example:
stops.add('conclusions')


def wordify(abs_list, min_word_len=2):
    '''
    Convert the abstract field from PLoS API data to a filtered list of words.
    '''

    # The abstract field is a list. Make it a string.
    text = ' '.join(abs_list).strip(' \n\t')

    if text == '':
        return nan

    else:
        # Remove punctuation & replace with space,
        # because we want 'metal-contaminated' => 'metal contaminated'
        # ...not 'metalcontaminated', and so on.
        for c in string.punctuation:
            text = text.replace(c, ' ')

        # Now make it a Series of words, and do some cleaning.
        words = Series(text.split(' '))
        words = words.str.lower()
        # Filter out words less than minimum word length.
        words = words[words.str.len() >= min_word_len]
        words = words[~words.str.contains(r'[^#@a-z]')]  # What exactly does this do?

        # Filter out globally-defined stopwords
        ignore = stops & set(words.unique())
        words_out = [w for w in words.tolist() if w not in ignore]

        return words_out
