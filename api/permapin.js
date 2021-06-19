const https = require('https');
const arweave = require('./../arweave');
const {fromBuffer} = require('file-type');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const chunks = [];
    const ipfsHash = (req.query.hash||req.params.hash).trim();

    if (!ipfsHash) {
        return res.status(400).send(
            'Error: Empty IPFS hash'
        );
    }

    const txIds = await arweave.search('IPFS-Add', ipfsHash);

    if (txIds.length) {
        return res.status(208).json({
            'arweaveId': txIds[0],
            'ipfsHash': ipfsHash,
            'statusCode': 208
        });
    }

    const ipfsReq = https.get(`https://ipfs.io/ipfs/${ipfsHash}`, {timeout: 10000}, response => {
        if (response.statusCode !== 200)
          return res.status(response.statusCode)
            .send(`https://ipfs.io/ipfs/${ipfsHash} responded with ${response.statusCode} - ${response.statusMessage}`)

        response.setEncoding('binary');

        response.on('data', chunk => {
            chunks.push(Buffer.from(chunk, 'binary'))

            const data = Buffer.concat(chunks);

            if (data.length >= 7340032) {
                ipfsReq.destroy();
                return res.status(400).send(
                    'Error: Max file size of 7 MB reached!'
                );
            }
        });

        response.on('end', async () => {
            const data = Buffer.concat(chunks);

            if (data.length >= 7340032) {
                return res.status(400).send(
                    'Error: Max file size of 7 MB reached!'
                );
            }

            const type = await fromBuffer(data);

            let tags = {
                'IPFS-Add': ipfsHash,
                'Content-Type': (type ? type.mime : '')
            };

            if (req.body) {
                try {
                    Object.assign(tags, JSON.parse(JSON.stringify(req.body)));
                } catch(e) {}
            }

            const {arweaveId, statusCode} = await arweave.transaction(data, tags);

            res.status(statusCode).json({
                arweaveId,
                ipfsHash,
                statusCode
            });
        });
    }).on('error', error => {
        return res.status(400).send(error);
    }).on('timeout', function() {
        this.abort();
    });
};
