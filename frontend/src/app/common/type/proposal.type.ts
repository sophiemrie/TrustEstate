export type Proposal = {
    proposalId: number;
    plotId: number;
    hasToApprove: string[];
    approvers: string[];
    proposalType: BigInt;
    executed: boolean;
    proposalData: string;

    proposalTypeName?: string;
}

export enum ProposalType {
    Split = 0,
    Merge = 1,
    Transfer = 2
}
