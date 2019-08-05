type DotElasticType = Record<string, any>;

let uniqIdCnt = 0;
const uniqId = () => `!__dot-elastic__${++uniqIdCnt}!`;
const reUniqId = /^!__dot-elastic__\d+!/;
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

function dot (input: DotElasticType, base?: DotElasticType): DotElasticType {
  const retval = base ? JSON.parse(JSON.stringify(base)) : {};

  Object.keys(input).forEach((key) => {
    let ptr = retval;
    const _nodes = key.split(reMatchNodes),
      nodes = _nodes.slice(0, -1),
      leafNode = _nodes[_nodes.length - 1];

    for (let node of nodes) {
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

export default dot;
