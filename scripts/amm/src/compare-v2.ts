interface SubgraphItem {
  network: string;
  url1: string;
  url2: string;
}

const fetchGraphQL = async (url: string, query: string, variables: object = {}) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query,
      variables
    })
  });
  const result = await response.json() as any;
  return result.data;
};

const getComparisonPercentage = (value1: number, value2: number): string => {
  return (((value2 - value1) / value1) * 100).toFixed(3);
};

const compareSubgraphs = async (items: SubgraphItem[]) => {
  for (const item of items) {
    const { network, url1, url2 } = item;

    const query1 = `
      {
        uniswapFactories(first: 5) {
          id
          pairCount
          totalVolumeUSD
          totalLiquidityUSD
        }
        bundles {
          ethPrice
        } 
        _meta {
          block {
            number
          }
        }
      }
    `;

    const data1 = await fetchGraphQL(url1, query1);
    const blockNumber = data1._meta.block.number;

    const query2 = `
      {
        factories(first: 5, block: { number: ${blockNumber} }) {
          id
          type
          volumeUSD
          liquidityUSD
        }
        bundles(first: 5, block: { number: ${blockNumber} }) {
          id
          nativePrice
        }
      }
    `;

    const data2 = await fetchGraphQL(url2, query2);

    if (!data1) {
      console.error('No data1 found for:', network, data1);
      continue;
    }

    if (!data2) {
      console.error('No data2 found for:', network, data2);
      continue;
    }

    // Extract variables to compare
    const totalVolumeUSD1 = parseFloat(data1.uniswapFactories[0].totalVolumeUSD);
    const totalVolumeUSD2 = parseFloat(data2.factories[0].volumeUSD);
    const totalLiquidityUSD1 = parseFloat(data1.uniswapFactories[0].totalLiquidityUSD);
    const totalLiquidityUSD2 = parseFloat(data2.factories[0].liquidityUSD);
    const ethPrice1 = parseFloat(data1.bundles[0].ethPrice);
    const nativePrice2 = parseFloat(data2.bundles[0].nativePrice);

    // Calculate percentage differences
    const volumeDifference = getComparisonPercentage(totalVolumeUSD2, totalVolumeUSD1);
    const liquidityDifference = getComparisonPercentage(totalLiquidityUSD2, totalLiquidityUSD1);
    const priceDifference = getComparisonPercentage(nativePrice2, ethPrice1);

    console.log('** Network:', network, 'Block Number:', blockNumber);
    console.log('Volume', data1.uniswapFactories[0].totalVolumeUSD, 'Difference:', volumeDifference, '%');
    console.log('Liquidity', data1.uniswapFactories[0].totalLiquidityUSD, 'Difference:', liquidityDifference, '%');
    console.log('Price', data1.bundles[0].ethPrice, 'Difference:', priceDifference, '%', '\n');
  }
};

const subgraphItems: SubgraphItem[] = [
  {
    network: 'arbitrum',
    url1: 'https://api.studio.thegraph.com/query/32073/v2-arbitrum/version/latest',
    url2: 'https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-arbitrum'
  },
  {
    network: 'ethereum',
    url1: 'https://api.studio.thegraph.com/query/32073/v2-ethereum/version/latest',
    url2: 'https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-ethereum'
  },
  {
    network: 'avalanche',
    url1: 'https://api.studio.thegraph.com/query/32073/v2-avalanche/version/latest',
    url2: 'https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-avalanche'
  },
  {
    network: 'bsc',
    url1: 'https://api.studio.thegraph.com/query/32073/v2-bsc/version/latest',
    url2: 'https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-bsc'
  },
  {
    network: 'celo',
    url1: 'https://api.studio.thegraph.com/query/32073/v2-celo/version/latest',
    url2: 'https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-celo'
  },
  {
    network: 'fantom',
    url1: 'https://api.studio.thegraph.com/query/32073/v2-fantom/version/latest',
    url2: 'https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-fantom'
  },
  {
    network: 'fuse',
    url1: 'https://api.studio.thegraph.com/query/32073/v2-fuse/version/latest',
    url2: 'https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-fuse'
  },
  {
    network: 'gnosis',
    url1: 'https://api.studio.thegraph.com/query/32073/v2-gnosis/version/latest',
    url2: 'https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-gnosis'
  },
  {
    network: 'moonbeam',
    url1: 'https://api.studio.thegraph.com/query/32073/v2-moonbeam/version/latest',
    url2: 'https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-moonbeam'
  },
  {
    network: 'moonriver',
    url1: 'https://api.studio.thegraph.com/query/32073/v2-moonriver/version/latest',
    url2: 'https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-moonriver'
  },
  {
    network: 'harmony',
    url1: 'https://api.studio.thegraph.com/query/32073/v2-harmony/version/latest',
    url2: 'https://api.thegraph.com/subgraphs/name/olastenberg/sushiswap-harmony-fix'
  },
  {
    network: 'optimism',
    url1: 'https://api.studio.thegraph.com/query/32073/v2-optimism/version/latest',
    url2: 'https://api.thegraph.com/subgraphs/name/sushi-subgraphs/sushiswap-optimism'
  },
  {
    network: 'boba',
    url1: 'https://api.studio.thegraph.com/query/32073/v2-boba/version/latest',
    url2: 'https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-boba'
  },
  {
    network: 'polygon',
    url1: 'https://api.studio.thegraph.com/query/32073/v2-polygon/version/latest',
    url2: 'https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-polygon'
  },
  {
    network: 'base',
    url1: 'https://api.studio.thegraph.com/query/32073/v2-base/version/latest',
    url2: 'https://api.studio.thegraph.com/query/32073/sushiswap-base/version/latest',
  },
  {
    network: 'scroll',
    url1: 'https://api.studio.thegraph.com/query/32073/v2-scroll/version/latest',
    url2: 'https://api.studio.thegraph.com/query/32073/sushiswap-scroll/version/latest',
  },
  {
    network: 'linea',
    url1: 'https://api.studio.thegraph.com/query/32073/v2-linea/version/latest',
    url2: 'https://api.studio.thegraph.com/query/32073/sushiswap-linea/version/latest',
  },
  // {
  //   network: 'polygon-zkevm',
  //   url1: 'https://api.studio.thegraph.com/query/32073/v2-polygon-zkevm/version/latest',
  //   url2: 'https://api.studio.thegraph.com/query/32073/v2-polygon-zkevm/v0.0.1',
  // }
];



compareSubgraphs(subgraphItems).catch(error => {
  console.error('Error comparing subgraphs:', error);
});
