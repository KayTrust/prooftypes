import { CredentialPayload, JwtCredentialPayload } from 'did-jwt-vc';
import { ProofType } from './proof-type';
// import { EthCore, IdentityManager } from '@kaytrust/eth-core';
// import { VerificationRegistry } from './verification-registry';
// import { ProofTypeSmartContract } from './proof-type-smart-contract';

export class ProofTypeEthereum implements ProofType {
    generateProof(verifiableObject: JwtCredentialPayload | CredentialPayload, extra?: any): Promise<string> {
        throw new Error('Method not implemented.');
    }
    verifyProof(verifiableObjectWithProof: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    readonly proofType = 'EthereumAttestationRegistry2019';
    // private proofTypeSmartContract: ProofTypeSmartContract;
    static PROOF_TYPE: string = 'EthereumAttestationRegistry2019';

}