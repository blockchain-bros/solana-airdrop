use anchor_lang::prelude::*;
declare_id!("JD1UNr7Nmmg2wGYjJXcACWgPwQHJsqoE2YYWrEbjKmUm");

#[program]
pub mod legends_airdrop {
    use super::*;

    pub fn initialize_claim_account(ctx: Context<InitializeClaimAccount>, amount:u32, _bump:u8) -> Result<()> {
        print!("Initializing claim account");
        ctx.accounts.claim_account.amount=amount;
        ctx.accounts.claim_account.claimed=false;
        ctx.accounts.claim_account.bump=_bump;
        Ok(())
    }
    pub fn claim(ctx: Context<ClaimUserAccount>) -> Result<()> {
        if !ctx.accounts.claim_account.claimed{
            print!("claiming");
            ctx.accounts.claim_account.claimed=true;
        }
        else {
            print!("already claimed");
        }
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

#[derive(Accounts)]
pub struct ClaimUserAccount<'info> {
    #[account(mut)]
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
    pub amount: u32         // 4 bytes
}


/*
#[error]
pub enum ErrorCode {
    #[msg("You've already claimed this.")]
    AlreadyClaimed,
}
*/
