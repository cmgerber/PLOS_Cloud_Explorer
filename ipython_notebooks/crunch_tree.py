from __future__ import unicode_literals
import json
import numpy as np
import pandas as pd
from pandas import DataFrame, Series
import xlrd
from collections import defaultdict

# Just in case we need to regenerate the subject hierarchy.
# Don't forget to update the filename of the thesaurus spreadsheet in main().

def get_subj_top(subjects):
    subj_top = set()
    for s in subjects:
        # the string gets split at its first character, so not [0] here:
        subj_top.add(s.split('/')[1])
    return subj_top


def get_subj_leaf(subjects):
    subj_top = set()
    for s in subjects:
        subj_top.add(s.split('/')[-1])
    return subj_top


def count_articles(df, subject_path):
    s = df.subject.apply(lambda s: str(s))
    matching = s[s.str.contains(subject_path)]
    return len(matching)


def tree_from_spreadsheet(f, df, verbose=False):
    
    subjects = df.subject.apply(lambda s: str(s))
    
    book = xlrd.open_workbook(f)
    pt = book.sheet_by_index(0)
    # spreadsheet cells : (row, col) :: cell A1 : (0, 0)

    # Initialize a list to contain the thesaurus.
    # Our test case will only have one item in this list.
    pt_list = []

    # Keep track of the path in the tree.
    cur_path = Series([np.nan]*10)

    for r in range(1, pt.nrows):
        # Start on row two.

        # Columns: the hierarchy goes up to 10 tiers.
        for c in range(10):
            if pt.cell_value(r, c):
                # If this condition is satisfied, we are at the node that's in this line.

                # Construct the path to this node.
                # Clean strings because some terms (RNA nomenclature) cause unicode error
                text = pt.cell_value(r, c).replace(u'\u2019', "'")
                cur_path[c] = text
                cur_path[c+1:] = np.nan
                path_list = list(cur_path.dropna())
                tier = len(path_list)
                path_str = '/'.join(path_list)
                if verbose:
                    print tier, path_str

                # Add the node to the JSON-like tree structure.
                node = defaultdict(list)
                node['name'] = text
                node['count']=  len(subjects[subjects.str.contains(path_str)])

                # This part is completely ridiculous. But it seems to work.
                if tier == 1:
                    pt_list.append(node)
                elif tier == 2:
                    pt_list[-1]['children'].append(node)
                elif tier == 3:
                    pt_list[-1]['children'][-1]['children'].append(node)
                elif tier == 4:
                    pt_list[-1]['children'][-1]['children'][-1]['children'].append(node)
                elif tier == 5:
                    pt_list[-1]['children'][-1]['children'][-1]['children'][-1]['children'].append(node)
                elif tier == 6:
                    pt_list[-1]['children'][-1]['children'][-1]['children'][-1]['children'][-1]['children'].append(node)
                elif tier == 7:
                    pt_list[-1]['children'][-1]['children'][-1]['children'][-1]['children'][-1]['children'][-1]['children'].append(node)
                elif tier == 8:
                    pt_list[-1]['children'][-1]['children'][-1]['children'][-1]['children'][-1]['children'][-1]['children'][-1]['children'].append(node)
                elif tier == 9:
                    pt_list[-1]['children'][-1]['children'][-1]['children'][-1]['children'][-1]['children'][-1]['children'][-1]['children'][-1]['children'].append(node)
                elif tier == 10:
                    pt_list[-1]['children'][-1]['children'][-1]['children'][-1]['children'][-1]['children'][-1]['children'][-1]['children'][-1]['children'][-1]['children'].append(node)

                # Go to next row after finding a term. There is only one term listed per row.
                break

    # Make a single JSON object to contain all the branches.
    pt_obj = {'count': len(df), 'name': 'PLOS', 'children': pt_list}

    return pt_obj


def main():
    # Import data
    df = pd.read_pickle('../data/all_plos_df.pkl')

    # Drop unused data
    df.drop(['author', 'title_display', 'journal', 'abstract', 'publication_date', 'score'], axis=1, inplace=True)
    df.set_index('id', inplace=True)

    # Update this filename if you use a newer version!
    plosthes_full_file = '../data/plosthes.2014-2.full.xlsx'

    # Generate tree structure
    plos_tree = tree_from_spreadsheet(plosthes_full_file, df, verbose=True)

    # Export tree structure as JSON
    # Note: this script won't overwrite the JSON file used by
    # the D3 tree visualization code (plos_tree.json).
    with open('../data/plos_hierarchy_full.json', 'wb') as f:
        json.dump(plos_tree, f)


if __name__ == '__main__':
    main()
