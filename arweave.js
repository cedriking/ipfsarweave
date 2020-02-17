const Arweave = require('arweave/node');

export const arweave = Arweave.init({
    host: 'arweave.net',
    protocol: 'https',
    timeout: 10000,
    port: 443
});

export const search = async (key, value) => {
    return await arweave.transactions.search(key, value);
};

export const transaction = async (data, tags) => {
    const wallet = JSON.parse(process.env.ARWEAVE_WALLET);
    const tx = await arweave.createTransaction({data}, wallet);

    tx['last_tx'] = await arweave.api.get('/tx_anchor').then(x => x.data);

    for (const [tagKey, tagValue] of Object.entries(tags)) {
        if (tagValue) {
            tx.addTag(tagKey, tagValue);
        }
    }

    await arweave.transactions.sign(tx, wallet);
    const response = await arweave.transactions.post(tx);

    return {
        'arweaveId': tx.id,
        'statusCode': response.status
    };
};
