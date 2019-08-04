dot-elastic
===================

[![Build Status](https://travis-ci.org/snorkypie/dot-elastic.svg?branch=master)](https://travis-ci.org/snorkypie/dot-elastic)
[![npm version](https://badge.fury.io/js/dot-elastic.svg)](https://badge.fury.io/js/dot-elastic)

Dot object syntax for creating elasticsearch queries

Install with [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/):

```bash
# via npm
$ npm install dot-elastic

# via yarn (automatically saves the package to your `dependencies` in package.json)
$ yarn add dot-elastic
```

## Usage

```javascript
import dot from 'dot-elastic';
```

```javascript
dot({ 'a.b.c': 1, 'a.b.d': 2 });
dot([ [ 'a.b.c', 1 ], [ 'a.b.d', 2 ] ]);
```

```json
{ "a": { "b": { "c": 1, "d": 2 } } }
{ "a": { "b": { "c": 1, "d": 2 } } }
```

In elasticsearch we often add on stuff to arrays (bool queries and similar). So it's important we have an easy syntax for this, we solve this duplicate key problem by using `.u` on the default import or by using the named export `u`. This is the biggest change from most other dot notation libs.

```javascript
import dot, { u } from 'dot-elastic';

log(dot({
  [dot.u`a[].b`]: 1,
  [dot.u`a[].b`]: 2,
}));

log(dot({
  [u`a[]`]: 1,
  [u`a[]`]: 2,
}));
```

```json
{ "a": [ { "b": 1 }, { "b": 2 } ] }
{ "a": [ 1, 2 ] }
```

Example queries shamelessly copied from [Tim Ojo's article "23 Useful Elasticsearch Example Queries"](https://dzone.com/articles/23-useful-elasticsearch-example-queries)

```javascript
dot({
  'query.term.publisher': 'manning',
  '_source': [ 'title', 'publish_date', 'publisher' ],
  'sort[].publish_date.order': 'desc',
});
```

```json
{
    "query": {
        "term": {
            "publisher": "manning"
        }
    },
    "_source": [
        "title",
        "publish_date",
        "publisher"
    ],
    "sort": [
        {
            "publish_date": {
                "order": "desc"
            }
        }
    ]
}
```

```javascript
dot({
  [dot.u`query.bool.must.bool.should[].match.title`]: 'Elasticsearch',
  [dot.u`query.bool.must.bool.should[].match.title`]: 'Solr',
  'query.bool.must_not.match.authors': 'radu gheorge',
});
```

```json
{
    "query": {
        "bool": {
            "must": {
                "bool": {
                    "should": [
                        { "match": { "title": "Elasticsearch" } },
                        { "match": { "title": "Solr" } }
                    ]
                }
            },
            "must_not": {
                "match": { "authors": "radu gheorge" }
            }
        }
    }
}
```

When dealing with multiple keys on the same level it sometimes makes it cleaner to use the second syntax:

```javascript
dot({
  'query.function_score.query.multi_match.query': 'search engine',
  'query.function_score.query.multi_match.fields': [ 'title', 'summary' ],
  'query.function_score.field_value_factor.field': 'num_reviews',
  'query.function_score.field_value_factor.modifier': 'log1p',
  'query.function_score.field_value_factor.factor': 2,
  '_source': [ 'title', 'summary', 'publish_date', 'num_reviews' ],
});

dot({
  'query.function_score.query.multi_match': {
    query: 'search engine',
    fields: [ 'title', 'summary' ],
  },
  'query.function_score.field_value_factor': {
    field: 'num_reviews',
    modifier: 'log1p',
    factor: 2,
  },
  '_source': [ 'title', 'summary', 'publish_date', 'num_reviews' ],
});
```

```json
{
    "query": {
        "function_score": {
            "query": {
                "multi_match": {
                    "query": "search engine",
                    "fields": [ "title", "summary" ]
                }
            },
            "field_value_factor": {
                "field": "num_reviews",
                "modifier": "log1p",
                "factor": 2
            }
        }
    },
    "_source": [ "title", "summary", "publish_date", "num_reviews" ]
}
```

## Contribute!

This code is not optimized at all right now but it's not really slow either but any improvements are very welcome!
