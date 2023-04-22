import { ERC721, Transfer } from "../generated/ERC721/ERC721";
import { Contract, Owner, OwnerContract, Token } from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  const address = event.address;
  const block = event.block;
  const params = event.params;
  const erc721 = ERC721.bind(address);

  let contract = Contract.load(address.toHexString());
  if (!contract) {
    contract = new Contract(address.toHexString());
    contract.name = erc721.name();
    contract.symbol = erc721.symbol();
    contract.createdBlock = block.number;
    contract.createdAt = block.timestamp;
  }

  contract.updatedBlock = block.number;
  contract.updatedAt = block.timestamp;
  contract.save();

  let owner = Owner.load(params.to.toHexString());
  if (!owner) {
    owner = new Owner(params.to.toHexString());
    owner.createdBlock = block.number;
    owner.createdAt = block.timestamp;
  }

  owner.updatedBlock = block.number;
  owner.updatedAt = block.timestamp;
  owner.save();

  let ownerContract = OwnerContract.load(owner.id + "-" + contract.id);
  if (!ownerContract) {
    ownerContract = new OwnerContract(owner.id + "-" + contract.id);
    ownerContract.owner = owner.id;
    ownerContract.contract = contract.id;
    ownerContract.createdBlock = block.number;
    ownerContract.createdAt = block.timestamp;
  }

  ownerContract.updatedBlock = block.number;
  ownerContract.updatedAt = block.timestamp;
  ownerContract.save();

  let token = Token.load(params.tokenId.toString());
  if (!token) {
    token = new Token(params.tokenId.toString());
    token.contract = contract.id;
    token.uri = erc721.tokenURI(params.tokenId);
    token.createdBlock = block.number;
    token.createdAt = block.timestamp;
  }

  token.updatedBlock = block.number;
  token.updatedAt = block.timestamp;
  token.owner = owner.id;
  token.save();
}
