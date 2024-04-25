import db from "../models/index.js";
const { nft: nft } = db;

export function getAll(req, res) {
  try {
    nft.findAll().then(founded => {
      res.status(200).send(founded);
    });
  }
  catch {
    res.status(500).send({ message: 'Ни одного NFT не найдено :(' });
  };
}