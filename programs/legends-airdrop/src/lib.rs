use anchor_lang::prelude::*;
use solana_program::pubkey;

declare_id!("JD1UNr7Nmmg2wGYjJXcACWgPwQHJsqoE2YYWrEbjKmUm");
const UPDATE_AUTHORITY: Pubkey  = pubkey!("YoST1LanvgKwpoqEVHGUiH2VhzciRmTTZrukeZkMcMW");

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
        require!(ctx.accounts.claim_account.claimed == false, ErrorCode::AlreadyClaimed);

        if !ctx.accounts.claim_account.claimed{
            print!("claiming");
            ctx.accounts.claim_account.claimed=true;
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
            authority.key().as_ref()
        ],
        bump, 
        payer = authority,
        space = 32 + 32 + 4 + 4 + 8
    )]
    pub claim_account: Account<'info, ClaimAccount>,
    
    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct ClaimUserAccount<'info> {
    #[account(mut, constraint = claim_account.authority == solana_program::pubkey!(UPDATE_AUTHORITY))]
    pub claim_account: Account<'info, ClaimAccount>,
    
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


#[error_code]
pub enum ErrorCode {
    #[msg("You've already claimed this.")]
    AlreadyClaimed,
}

