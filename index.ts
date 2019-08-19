type DotElasticType = Record<string, any>;
type Options = Partial<{
  clone: boolean,
}>;

let uniqIdCnt = 0;
const uniqId = () => `!!__dot-es__${++uniqIdCnt}__!!`;
const reUniqId = /^!!__dot-es__\d+__!!/;
const reMatchNodes = /(?<!\\)\./;
const reMatchArray = /(?<!\\)\[(\d*)(?<!\\)\]$/;

function matchArray (node: string) {
  return node.indexOf('[') && reMatchArray.exec(node);
}

function tidyNode (node: string | undefined): string {
  node = (node || '');
  if (node.indexOf('[')) {
    node = node.replace(reMatchArray, '');
  }
  if (node.indexOf('\\') >= 0) {
    node = node.replace(/\\/g, '');
  }
  if (reUniqId.test(node)) {
    node = node.replace(reUniqId, '');
  }
  return node;
}

export function u (strings: TemplateStringsArray): string {
  return `${uniqId()}${strings.raw[0]}`;
}

function walkPath (path: string, ptr: DotElasticType, skipLast = false): any {
  const nodes: string[] = path.split(reMatchNodes);

  for (let node of nodes.slice(0, skipLast ? -1 : nodes.length)) {
    const idx = matchArray(node);

    node = tidyNode(node);

    if (!ptr[node]) {
      ptr[node] = idx ? [] : {};
    }

    if (!idx) {
      ptr = ptr[node];
    } else {
      const nIdx = Number(idx[1]) || ptr[node].length;
      if (typeof ptr[node][nIdx] === 'undefined') {
        ptr[node][nIdx] = {};
      }

      ptr = ptr[node][nIdx];
    }
  }

  return skipLast ? [ ptr, nodes[nodes.length - 1] ] : ptr;
}

function dot (input: DotElasticType, base: DotElasticType = {}, opts: Options = {}): DotElasticType {
  const retval = base && opts.clone ? JSON.parse(JSON.stringify(base)) : base;

  Object.keys(input).forEach((key) => {
    let [ ptr, leafNode ]: [ any, string ] = walkPath(key, retval, true);

    const tidyLeafNode = tidyNode(leafNode);

    const idx = matchArray(leafNode);
    if (!idx) {
      ptr[tidyLeafNode] = input[key];
    } else {
      if (!ptr[tidyLeafNode]) {
        ptr[tidyLeafNode] = [];
      }

      ptr = ptr[tidyLeafNode];

      const nIdx = Number(idx[1]) || ptr.length;
      ptr[nIdx] = input[key];
    }
  });

  return retval;
}

dot.u = u;
dot.ln = walkPath;

export default dot;
