#!/usr/bin/python -O

from __future__ import print_function
import collections, json, re, sys

# get the corpus filename
if len(sys.argv) != 3:
  print('Usage: generate_tree.py corpus.txt output.js')
  sys.exit(1)
corpus_filename = sys.argv[1]
output_filename = sys.argv[2]
wordlist_filename = '/usr/share/dict/words'

# read the file
print('Loading the corpus...')
try:
  with open(corpus_filename) as file:
    corpus_data = file.read()
except IOError:
  print('Unable to open corpus:', corpus_filename)
  sys.exit(1)

# get a list of words
print('Loading the word list...')
try:
  with open(wordlist_filename) as file:
    wordlist_words = set(line.strip() for line in file.readlines())
except IOError:
  print('Unable to open word list:', wordlist_filename)
  sys.exit(1)

# convert to lowercase and whitelist letters and periods
print('Normalizing the corpus...')
corpus_data = re.sub(r'[^a-z.\']', ' ', corpus_data.lower())

# split the file into sentences
print('Splitting the corpus into sentences...')
sentences = corpus_data.replace('!', '.').replace('?', '.').replace(';', '.').split('.')

# map from word (or '^' for the beginning of a sentence) to successor to probability
probabilities = collections.defaultdict(lambda: collections.defaultdict(float))

# populate the map
print('Populating the transition probabilities...')
for sentence in sentences:
  words = [word for word in sentence.split() if word in wordlist_words and '\'' not in word]
  if len(words) == 0:
    continue
  probabilities['^'][words[0]] += 1.0
  for i in range(1, len(words)):
    probabilities[words[i - 1]][words[i]] += 1.0

# make sure we have some words
if len(probabilities) == 0:
  print('Insufficient corpus.')
  sys.exit(1)

# normalize the probabilities
print('Normalizing the transition probabilities...')
for first in probabilities:
  total = sum([probabilities[first][second] for second in probabilities[first]])
  for second in probabilities[first]:
    probabilities[first][second] /= total

# map from word (or '^' for the beginning of a sentence) to successor to code
codes = {}

# generate the huffman trees
print('Generating Huffman trees...')
max_depth = 0
for first in probabilities:
  tree = [[second, probabilities[first][second], 0] for second in probabilities[first]]
  while len(tree) > 1:
    tree.sort(key=lambda pair: pair[1])
    tree = [[[tree[0][0], tree[1][0]], tree[0][1] + tree[1][1], max(tree[0][2], tree[1][2]) + 1]] + tree[2:]
  codes[first] = tree[0][0]
  max_depth = max(max_depth, tree[0][2])

# write the output to a file
print('Saving the output...')
try:
  with open(output_filename, 'w') as file:
    file.write('var tree = ' + json.dumps(codes, sort_keys=True, indent=2) + ';')
except IOError:
  print('Unable to open output file:', output_filename)
  sys.exit(1)

print("Done. Client requires at least %d terminators." % max_depth)
