import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { LegendsAirdrop } from "../target/types/legends_airdrop";
import web3 = anchor.web3;


describe("legends-airdrop", async () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.LegendsAirdrop as Program<LegendsAirdrop>;


  it("Is initialized!", async () => {
    // Add your test here.
    const authority = web3.Keypair.generate();
    const user = web3.Keypair.generate();
    const [_claimAccount, bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from("claim"),
       user.publicKey.toBuffer()],
      program.programId
    );
    const tx = await program.methods.initializeClaimAccount(bump)
    .accounts({
      claimAccount: _claimAccount,
      user: user.publicKey, 
      systemProgram: web3.SystemProgram.programId, 
    })
    .rpc();
    console.log("Your transaction signature", tx);
  });
});
