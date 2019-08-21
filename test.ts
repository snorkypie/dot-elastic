/* eslint-disable no-undef, @typescript-eslint/no-unused-vars */
import { expect } from 'chai';

import dot, { u } from './index';

describe('handles dot syntax', () => {
  it('can do simple dots', () => {
    expect(dot({
      'foo.bar.one': '100',
    })).to.deep.equal({
      foo: { bar: { one: '100' } },
    });

    expect(dot({
      'foo.bar.one': 100,
    })).to.deep.equal({
      foo: { bar: { one: 100 } },
    });
  });

  it('can handle more than one path', () => {
    expect(dot({
      'foo.bar.one': 100,
      'foo.bar.two': 200,
    })).to.deep.equal({
      foo: { bar: { one: 100, two: 200 } },
    });

    expect(dot({
      'foo.bar.one': 100,
      'foo.bar.two': 200,
      'foo.bar.three': 300,
    })).to.deep.equal({
      foo: { bar: { one: 100, two: 200, three: 300 } },
    });
  });

  it('correctly clones input object when clone options is passed', () => {
    const initial = dot({ a: 100 });
    expect(dot({
      b: 200,
    }, initial, { clone: true })).to.deep.equal({
      a: 100,
      b: 200,
    });
    expect(initial).to.deep.equal({
      a: 100,
    })
  });

  it('can handle escaped dots', () => {
    expect(dot({
      'foo.bar\\.one': 500,
      'foo\\.bar.two': 500,
      'foo\\.bar\\.three': 500,
    })).to.deep.equal({
      'foo': { 'bar.one': 500 },
      'foo.bar': { two: 500 },
      'foo.bar.three': 500,
    });
  });

  it('can generate lists with objects', () => {
    expect(dot({
      'foo[].one': 100,
      'foo[].two': 100,
      'foo[1].three': 100,
      'foo[2].four': 100,
    })).to.deep.equal({
      foo: [ { one: 100 }, { two: 100, three: 100 }, { four: 100 } ],
    });
  });


  it('can handle nested lists', () => {
    expect(dot({
      [u`a[].b[].c`]: 10,
      [u`a[].b[].c`]: 20,
    })).to.deep.equal({
      a: [ {
        b: [ {
          c: 10,
        } ],
      }, {
        b: [ {
          c: 20,
        } ],
      } ],
    });
  });

  it('can handle escaped lists', () => {
    expect(dot({
      'foo\\.a\\[\\]': 100,
      'foo\\.b[\\]': 100,
      'foo\\.c\\[]': 100,
      'foo\\[\\]\\.a': 100,
    })).to.deep.equal({
      'foo.a[]': 100,
      'foo.b[]': 100,
      'foo.c[]': 100,
      'foo[].a': 100,
    });
  });

  it('can handle non-unique strings with dot.u tagged template', () => {
    expect(dot({
      [dot.u`foo[]`]: 1,
      [dot.u`foo[]`]: 2,
      [dot.u`foo[]`]: 3,
    })).to.deep.equal({
      foo: [ 1, 2, 3 ],
    });
  });

  it('can handle initial object data', () => {
    const initial = dot({
      [dot.u`foo[].a`]: 10,
      [dot.u`foo[].a`]: 20,
    });

    expect(dot({
      'foo[].a': 30,
      'bar.a': 40,
    }, initial)).to.deep.equal({
      foo: [ { a: 10 }, { a: 20 }, { a: 30 } ],
      bar: { a: 40 },
    });
  });

  it('works with nested dot-elastic calls', () => {
    expect(dot({
      'foo.a': 10,
      'foo.b': dot({
        'c': 20
      }),
    })).to.deep.equal({
      foo: { a: 10, b: { c: 20 } },
    });
  });

  it('can handle shortcuts', () => {
    const obj = {};

    const shortcut = dot.ln('query.bool.must[].bool', obj);
    dot({ 'should[].term.aid': 10 }, shortcut);
    dot({ 'should[].term.bid': 20 }, shortcut);

    expect(obj).to.deep.equal({
      query: {
        bool: {
          must: [
            {
              bool: {
                should: [
                  {
                    term: { aid: 10 },
                  }, {
                    term: { bid: 20 },
                  },
                ],
              },
            },
          ],
        },
      },
    });
  });
});
