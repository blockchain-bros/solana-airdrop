import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { LegendsAirdrop } from "../target/types/legends_airdrop";
import web3 = anchor.web3;
import { assert } from "chai";
export interface Pda {
  publicKey: web3.PublicKey;
  bump: number;
}

describe("legends-airdrop", async () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.LegendsAirdrop as Program<LegendsAirdrop>;
  const user = web3.Keypair.generate(); //whitelisted user
  const other_user = web3.Keypair.generate(); //non_whitelisted user

  async function getUserPda(userPublickey: PublicKey): Promise<Pda> {
    const [publicKey, bump] = await PublicKey.findProgramAddress(
      [Buffer.from("claim"), userPublickey.toBuffer()],
      program.programId
    );
    return { publicKey, bump } as Pda;
  }

  it("Initialize whitelisted pubkey with amount", async () => {
    //const amount = 69420 * 1e8; // 69420 LEGEND
    const amount = 69420; // 69420 LEGEND
    const { publicKey, bump } = await getUserPda(user.publicKey);
    const tx = await program.methods
      .initializeClaimAccount(amount, bump)
      .accounts({
        claimAccount: publicKey,
        user: user.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
    // Fix: Add 'dom' library to the 'lib' compiler option
    console.log("Your transaction signature", tx);
  });

  it("Check claim status before", async () => {
    const pda = await getUserPda(user.publicKey);
    const userdata = await program.account.claimAccount.fetch(pda.publicKey);
    assert.ok(userdata.claimed === false, "Expect not claimed");
    assert.ok(userdata.amount === 69420, "Expect amount to be 69420");
  });

  it("Claim", async () => {
    const pda = await getUserPda(user.publicKey);

    const tx = await program.methods
      .claim()
      .accounts({
        claimAccount: pda.publicKey,
        user: user.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
    assert.ok(tx.length > 40, "Expected success message");
  });

  it("Check claim status after", async () => {
    const pda = await getUserPda(user.publicKey);
    const userdata = await program.account.claimAccount.fetch(pda.publicKey);
    assert.ok(userdata.claimed === true, "Expect claimed");
    assert.ok(userdata.amount === 69420, "Expect amount to be 69420");
  });

  it("Claim again", async () => {
    const pda = await getUserPda(user.publicKey);
    let tx = {};

    try {
      tx = await program.methods
        .claim()
        .accounts({
          claimAccount: pda.publicKey,
          user: user.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
      console.log("Your transaction signature", tx);
      throw new Error("Test should have failed for double claim but did not.");
    } catch (error) {
      assert.ok(
        error.message.includes("AlreadyClaimed"),
        "Expected error message"
      );
    }
  });
  it("Check claim status for non-whitelisted user", async () => {
    const pda = await getUserPda(other_user.publicKey);
    let response = {};

    try {
      response = await program.account.claimAccount.fetch(pda.publicKey);
      // If the program reaches this point, the test should fail because it's expected to throw an error.
      throw new Error(
        "Test should have failed for non-whitelisted user but did not."
      );
    } catch (error) {
      assert.ok(
        error.message.includes("Account does not exist or has no data"),
        "Expected error message"
      );
    }
  });
});
