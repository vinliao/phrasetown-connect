# Phrasetown connect

A lil' app to connect your Farcaster account to Phrasetown, a Farcaster web client.

Client: https://phrasetown.com

Connector: https://connect.phrasetown.com

Under the hood, if you sign, it generates a Merkle Hub API key with your Ethereum address. The Hub key is stored in your browser, and doesn't go to any server. All Farcaster action (like, recast, cast, comment) are done with this Hub key.

Experimental feature, please proceed with caution :)