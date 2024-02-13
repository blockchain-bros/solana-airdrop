use anchor_lang::prelude::*;
declare_id!("JD1UNr7Nmmg2wGYjJXcACWgPwQHJsqoE2YYWrEbjKmUm");

#[program]
pub mod legends_airdrop {
    use super::*;

    pub fn initialize_claim_account(ctx: Context<InitializeClaimAccount>, _bump:u8) -> Result<()> {
        print!("Initializing claim account");
        ctx.accounts.claim_account.amount=100;
        ctx.accounts.claim_account.claimed=false;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(_bump: u8)]
pub struct InitializeClaimAccount<'info> {
    #[account(
        init,
        seeds = [
            b"claim".as_ref(),
            user.key().as_ref()
        ],
        bump, 
        payer = authority,
        space = 32 + 32 + 4 + 4 + 8
    )]
    pub claim_account: Account<'info, ClaimAccount>,
    
    /// CHECK: ref user
    pub user: AccountInfo<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>
}

#[account]
pub struct ClaimAccount {
    pub authority: Pubkey,  // 32 bytes
    pub user: Pubkey,       // 32 bytes
    pub bump: u8,           // 4 byte
    pub claimed: bool,      // 4 byte 
    pub amount: u8          // 1 byte
}


/*
#[error]
pub enum ErrorCode {
    #[msg("You've already claimed this.")]
    AlreadyClaimed,
}
*/
