export type BankTransferDetails = {
  bankName: string;
  accountName: string;
  bsb: string;
  accountNumber: string;
};

export const getBankTransferDetails = (): BankTransferDetails => ({
  bankName: process.env.NEXT_PUBLIC_BANK_TRANSFER_BANK_NAME?.trim() ?? "",
  accountName: process.env.NEXT_PUBLIC_BANK_TRANSFER_ACCOUNT_NAME?.trim() ?? "",
  bsb: process.env.NEXT_PUBLIC_BANK_TRANSFER_BSB?.trim() ?? "",
  accountNumber: process.env.NEXT_PUBLIC_BANK_TRANSFER_ACCOUNT_NUMBER?.trim() ?? "",
});

export const hasBankTransferDetails = (details: BankTransferDetails) =>
  Boolean(details.accountName && details.bsb && details.accountNumber);
