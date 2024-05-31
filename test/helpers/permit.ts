import { ethers } from "ethers";

export function BuildPermitHash(
  owner: string,
  spender: string,
  amount: bigint,
  nonce: bigint,
  deadline: bigint,
  domain: string,
): string {
  const permitTypeHash = ethers.keccak256(
    ethers.toUtf8Bytes("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"),
  );

  const encodedStruct = ethers.AbiCoder.defaultAbiCoder().encode(
    ["bytes32", "address", "address", "uint256", "uint256", "uint256"],
    [permitTypeHash, owner, spender, amount, nonce, deadline],
  );

  const structHash = ethers.keccak256(encodedStruct);

  const concatenatedData = ethers.concat([
    ethers.toUtf8Bytes("\x19\x01"),
    ethers.getBytes(domain),
    ethers.getBytes(structHash),
  ]);

  return ethers.keccak256(concatenatedData);
}
