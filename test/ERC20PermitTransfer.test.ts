import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { Reverter } from "@/test/helpers/reverter";
import { ERC20PermitMock, ERC20PermitTransfer } from "@ethers-v6";
import { BuildPermitHash } from "@/test/helpers/permit";
import { Signature, SigningKey } from "ethers";

describe("ERC20PermitTransfer", () => {
  const reverter = new Reverter();

  let OWNER: SignerWithAddress;
  let RECIPIENT: SignerWithAddress;
  let SENDER: SignerWithAddress;

  let OWNER_PK: SigningKey;

  let erc20: ERC20PermitMock;
  let erc20PermitTransfer: ERC20PermitTransfer;

  let transferAmount: number;
  let feeAmount: number;
  let deadline: number;

  let nonce: bigint;

  let domain: string;
  let permitHash: string;

  let permitSignature: Signature;

  function addHours(date: Date, hours: number) {
    const hoursToAdd = hours * 60 * 60 * 1000;
    date.setTime(date.getTime() + hoursToAdd);
    return date;
  }

  before(async () => {
    [OWNER, RECIPIENT, SENDER] = await ethers.getSigners();
    OWNER_PK = new ethers.SigningKey("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");

    const ERC20PermitMock = await ethers.getContractFactory("ERC20PermitMock");
    erc20 = await ERC20PermitMock.deploy("Mock", "Mock", 1000);

    const ERC20PermitTransfer = await ethers.getContractFactory("ERC20PermitTransfer");
    erc20PermitTransfer = await ERC20PermitTransfer.deploy(SENDER);

    transferAmount = 7;
    feeAmount = 3;
    deadline = Math.floor(addHours(new Date(), 1).getTime() / 1000);
    nonce = await erc20.nonces(SENDER.address);

    domain = await erc20.DOMAIN_SEPARATOR();
    permitHash = BuildPermitHash(
      OWNER.address,
      await erc20PermitTransfer.getAddress(),
      BigInt(transferAmount + feeAmount),
      nonce,
      BigInt(deadline),
      domain,
    );

    permitSignature = OWNER_PK.sign(permitHash);

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  describe("#transferWithPermit", () => {
    it("should revert for not owner", async () => {
      await expect(
        erc20PermitTransfer
          .connect(RECIPIENT)
          .transferWithPermit(
            await erc20.getAddress(),
            OWNER.address,
            RECIPIENT.address,
            transferAmount,
            feeAmount,
            deadline,
            permitSignature.v,
            permitSignature.r,
            permitSignature.s,
          ),
      ).to.be.revertedWithCustomError(erc20PermitTransfer, `OwnableUnauthorizedAccount`);
    });

    it("should transfer correctly", async () => {
      const tx = await erc20PermitTransfer
        .connect(SENDER)
        .transferWithPermit(
          await erc20.getAddress(),
          OWNER.address,
          RECIPIENT.address,
          transferAmount,
          feeAmount,
          deadline,
          permitSignature.v,
          permitSignature.r,
          permitSignature.s,
        );

      await expect(tx).to.changeTokenBalance(erc20, OWNER, -(transferAmount + feeAmount));
      await expect(tx).to.changeTokenBalance(erc20, RECIPIENT, transferAmount);
      await expect(tx).to.changeTokenBalance(erc20, SENDER, feeAmount);
    });
  });
});
