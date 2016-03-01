'use strict';

// Bithacking

function getByte(bits, i) {
return  ((bits[i]     ? 1 : 0) << 7) +
        ((bits[i + 1] ? 1 : 0) << 6) +
        ((bits[i + 2] ? 1 : 0) << 5) +
        ((bits[i + 3] ? 1 : 0) << 4) +
        ((bits[i + 4] ? 1 : 0) << 3) +
        ((bits[i + 5] ? 1 : 0) << 2) +
        ((bits[i + 6] ? 1 : 0) << 1) +
         (bits[i + 7] ? 1 : 0);
}

function getBits(byte) {
  var bits = [];
  for (var i = 7; i >= 0; i--) {
    bits.push(((byte >> i) & 0x01) === 0x01);
  }
  return bits;
}

// Compression

function compress(bits) {
  var newBits;

  var allNumeric = true;
  for (var i = 0; i < bits.length; i += 8) {
    var byte = getByte(bits, i);
    if (byte < 42 || byte > 57) {
      allNumeric = false;
      break;
    }
  }
  if (allNumeric) {
    newBits = [true, true];
    for (var j = 0; j < bits.length; j += 8) {
      newBits = newBits.concat(getBits(getByte(bits, j) - 42).slice(4));
    }
    return newBits;
  }

  var allAscii = true;
  for (var k = 0; k < bits.length; k += 8) {
    if (bits[k]) {
      allAscii = false;
      break;
    }
  }
  if (allAscii) {
    newBits = [false];
    for (var l = 0; l < bits.length; l++) {
      if (l % 8 !== 0) {
        newBits.push(bits[l]);
      }
    }
    return newBits;
  }

  return [true, false].concat(bits);
}

function decompress(bits) {
  var newBits;

  if (bits[0]) {
    if (bits[1]) {
      newBits = [];
      for (var i = 2; i < bits.length; i += 4) {
        var nibble =
          ((bits[i]     ? 1 : 0) << 3) +
          ((bits[i + 1] ? 1 : 0) << 2) +
          ((bits[i + 2] ? 1 : 0) << 1) +
           (bits[i + 3] ? 1 : 0);
        newBits = newBits.concat(getBits(nibble + 42));
      }
      return newBits;
    } else {
      return bits.slice(2);
    }
  }

  newBits = [];
  for (var j = 1; j < bits.length; j++) {
    if ((j - 1) % 7 === 0) {
      newBits.push(false);
    }
    newBits.push(bits[j]);
  }
  return newBits;
}

// Huffgram

var terminators = [
  'ok',
  'yay',
  'wow',
  'amen',
  'whoa',
  'ahoy',
  'yeah',
  'well',
  'blah',
  'what',
  'thanks',
  'cut',
  'Kim',
  'peg',
  'not',
  'wed',
  'jot',
  'bad',
  'apt',
  'big',
  'sin',
  'cud',
  'pun',
  'cop',
  'bin',
  'pug',
  'con',
  'lid',
  'bag',
  'yet',
  'jab',
  'cap',
  'fan',
  'mom',
  'sun',
  'bid',
  'tag',
  'tap',
  'rat',
  'tan',
  'rug',
  'mop',
  'gab',
  'dad',
  'his',
  'Don',
  'dim',
  'rid',
  'had',
  'hem',
  'dig',
  'gun',
  'lad',
  'pup',
  'leg',
  'rum',
  'bat',
  'tab',
  'cot',
  'pen',
  'hip',
  'fig',
  'got',
  'pod',
  'dab',
  'lag',
  'tot',
  'lip',
  'rut',
  'zit',
  'win',
  'man',
  'him',
  'jib',
  'sub',
  'pet',
  'act',
  'mat',
  'gal',
  'met',
  'Ted',
  'wet',
  'dot',
  'but',
  'bus',
  'fin',
  'let',
  'bun',
  'dip',
  'bug',
  'set',
  'pad',
  'cab',
  'men',
  'fad',
  'jug',
  'rod',
  'lob',
  'did',
  'sum',
  'tip',
  'tin',
  'ran',
  'rot',
  'rig',
  'lug',
  'fog',
  'jet',
  'map',
  'vat',
  'pot',
  'hot',
  'pin',
  'pit',
  'zap',
  'ten',
  'bum',
  'bed',
  'sat',
  'mob',
  'bit',
  'hut',
  'beg',
  'gut',
  'kin',
  'zip',
  'ton',
  'hog',
  'lit',
  'fit',
  'kid',
  'van',
  'hum',
  'pal',
  'log',
  'nun',
  'sag',
  'keg',
  'gel',
  'vet',
  'fun',
  'wit',
  'gum',
  'ram',
  'jig',
  'rip',
  'jut',
  'top',
  'gap',
  'get',
  'Jim',
  'rag',
  'won',
  'jam',
  'net',
  'ham',
  'cup',
  'bet',
  'hen',
  'sod',
  'gig',
  'hug',
  'nod',
  'sad',
  'lot',
  'sip',
  'rim',
  'has',
  'ask',
  'hit',
  'hid',
  'yam',
  'sap',
  'rub',
  'gin',
  'led',
  'pan',
  'lab',
  'red',
  'gem',
  'son',
  'cog',
  'mad',
  'run',
  'fed',
  'bop',
  'den',
  'tad',
  'bud',
  'lop',
  'sit',
  'cat',
  'jog',
  'nip',
  'gas',
  'pig',
  'cod',
  'hat',
  'tug',
  'fat',
  'lap',
  'mug',
  'nut',
  'kit',
  'nap',
  'dog',
  'dug'
];

function findBestWord(subtree) {
  if (typeof subtree === 'string') {
    return [subtree, 0];
  } else {
    var first = findBestWord(subtree[0]);
    var second = findBestWord(subtree[1]);
    return (first[1] > second[1]) ? [second[0], second[1] + 1] : [first[0], first[1] + 1];
  }
}

function findWordBits(subtree, word) {
  if (typeof subtree === 'string') {
    if (subtree === word) {
      return [];
    } else {
      return null;
    }
  } else {
    var first = findWordBits(subtree[0], word);
    var second = findWordBits(subtree[1], word);
    if (first !== null) {
      return [false].concat(first);
    } else if (second !== null) {
      return [true].concat(second);
    } else {
      return null;
    }
  }
}

function encode(str) {
  if (str === '') {
    return '';
  }

  // convert the input to a bit array
  var strUtf8 = utf8.encode(str);
  var bits = [];
  for (var i = 0; i < strUtf8.length; i++) {
    bits = bits.concat(getBits(strUtf8.charCodeAt(i)));
  }

  // compression
  bits = compress(bits);

  // perform the encoding
  var huffgram = '';
  var subtree = tree['^'];
  for (var k = 0; k < bits.length; k++) {
    while (typeof subtree === 'string') {
      if (huffgram !== '') {
        huffgram += ' ';
      }
      huffgram += subtree;
      if (tree.hasOwnProperty(subtree)) {
        subtree = tree[subtree];
      } else {
        subtree = tree['^'];
      }
    }
    subtree = subtree[bits[k] ? 1 : 0];
  }
  if (huffgram !== '') {
    huffgram += ' ';
  }
  var bestWord = findBestWord(subtree);
  huffgram += bestWord[0];
  if (huffgram !== '') {
    huffgram += ' ';
  }
  huffgram += terminators[bestWord[1]];
  return huffgram;
}

function decode(str) {
  // split the input into words
  var words = str.toLowerCase().replace(/[^a-z]/g, ' ').replace(/ +/g, ' ').replace(/^\s+|\s+$/g, '').split(' ');
  if (words.length === 1 && words[0] === '') {
    return '';
  }

  // perform the decoding
  var bits = [];
  var prevWord = '^';
  for (var i = 0; i < words.length - 1; i++) {
    if (!tree.hasOwnProperty(prevWord)) {
      prevWord = '^';
    }
    var wordBits = findWordBits(tree[prevWord], words[i]);
    if (wordBits === null) {
      throw 'Invalid huffgram';
    }
    bits = bits.concat(wordBits);
    prevWord = words[i];
  }
  var terminatorFound = false;
  for (var j = 0; j < terminators.length; j++) {
    if (words[words.length - 1] === terminators[j]) {
      terminatorFound = true;
      if (j > 0) {
        bits.splice(-j);
      }
      break;
    }
  }
  if (!terminatorFound) {
    throw 'Invalid huffgram';
  }

  // decompression
  bits = decompress(bits);

  // convert the bit array into a string
  if (bits.length % 8 !== 0) {
    throw 'Invalid huffgram';
  }
  var strUtf8 = '';
  for (var k = 0; k < bits.length; k += 8) {
    strUtf8 += String.fromCharCode(getByte(bits, k));
  }
  try {
    return utf8.decode(strUtf8);
  } catch (e) {
    throw 'Invalid huffgram';
  }
}

// UI

function debounce(callback) {
  var timeout = null;
  return function() {
    var args = arguments;
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(function() {
      if (timeout !== null) {
        callback.apply(this, args);
        timeout = null;
      }
    }, 100);
  };
}

function watchInput(element, callback) {
  var oldVal = '';
  $(element).bind('propertychange change click keyup input paste', debounce(function(e) {
    var newVal = $(element).val();
    if (oldVal !== newVal) {
      oldVal = newVal;
      callback(newVal);
    }
  }));
}

$(function() {
  watchInput($('#original'), function(val) {
    $('#natural').val(encode(val));
    $('#error').text('');
  });

  watchInput($('#natural'), function(val) {
    $('#error').text('');
    try {
      $('#original').val(decode(val));
    } catch (e) {
      $('#error').text(e);
      $('#original').val('');
    }
  });

  $('#original').change();
  $('.loading').fadeOut();
});
