import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { LegendsAirdrop } from "../target/types/legends_airdrop";
import web3 = anchor.web3;
export interface Pda {
  publicKey: web3.PublicKey;
  bump: number;
}

describe("legends-airdrop", async () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.LegendsAirdrop as Program<LegendsAirdrop>;
  const user = web3.Keypair.generate(); //whitelisted user

  async function getUserPda(): Promise<Pda> {
    const [publicKey, bump] = await PublicKey.findProgramAddress(
      [Buffer.from("claim"), user.publicKey.toBuffer()],
      program.programId
    );
    return { publicKey, bump } as Pda;
  }

  it("Initialize whitelist pubkey with amount", async () => {
    //const amount = 69420 * 1e8; // 69420 LEGEND
    const amount = 69420; // 69420 LEGEND
    const { publicKey, bump } = await getUserPda();
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
    const pda = await getUserPda();
    const userdata = await program.account.claimAccount.fetch(pda.publicKey);
    console.log("Claimed", userdata.claimed);
    console.log("Amount", userdata.amount);
  });

  it("Claim", async () => {
    const pda = await getUserPda();

    const tx = await program.methods
      .claim()
      .accounts({
        claimAccount: pda.publicKey,
        user: user.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });

  it("Check claim status after", async () => {
    const pda = await getUserPda();
    const userdata = await program.account.claimAccount.fetch(pda.publicKey);
    console.log("Claimed", userdata.claimed);
    console.log("Amount", userdata.amount);
  });


  it("Claim again", async () => {
    const pda = await getUserPda();

    const tx = await program.methods
      .claim()
      .accounts({
        claimAccount: pda.publicKey,
        user: user.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });
  
});
