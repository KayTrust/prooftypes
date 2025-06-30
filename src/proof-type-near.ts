// 📁 ProofTypeNear.ts
import { CredentialPayload, JwtCredentialPayload } from 'did-jwt-vc';
import { connect, keyStores, WalletConnection } from 'near-api-js';
import { ProofType } from './proof-type';

export class ProofTypeNear implements ProofType {
  readonly proofType = 'NearAttestationRegistry2025';
  static PROOF_TYPE: string = 'NearAttestationRegistry2025';

  private config = {
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://testnet.mynearwallet.com',
    helperUrl: 'https://helper.testnet.near.org',
    keyStore: new keyStores.InMemoryKeyStore(),
  };

  private contractId = 'neardtiprooftype.testnet';

  async generateProof(verifiableObject: JwtCredentialPayload | CredentialPayload, extra?: { wallet: WalletConnection, cid: string }) {
    if (!extra?.wallet || !extra?.cid || !verifiableObject.issuer) {
      throw new Error('Missing wallet, cid, or issuer');
    }

    const subjectDid = verifiableObject.credentialSubject?.id;
    if (!subjectDid) {
      throw new Error('Missing credentialSubject.id');
    }

    const account = extra.wallet.account();
    await account.functionCall({
      contractId: this.contractId,
      methodName: 'issue_credential',
      args: {
        subject_did: subjectDid,
        cid: extra.cid,
        expires_at: null,
      },
      gas: BigInt("30000000000000")
    });

    return `${subjectDid}|${extra.cid}`;
  }

  async verifyProof(verifiableObjectWithProof: string): Promise<boolean> {
    const near = await connect(this.config);
    const account = await near.account('nearprooftype.testnet');

    const parts = verifiableObjectWithProof.split('|');
    const subjectDid = parts[0];
    const cid = parts[1];

    const result = await account.viewFunction({
      contractId: this.contractId,
      methodName: 'is_valid',
      args: { subject_did: subjectDid, cid }
    });

    return result as boolean;
  }
}
