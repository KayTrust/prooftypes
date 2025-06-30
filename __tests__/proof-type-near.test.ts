import { connect, KeyPair, keyStores } from 'near-api-js';
import { beforeAll, describe, expect, it } from 'vitest';
import { ProofTypeNear } from '../src/proof-type-near';

const accountId = "hacknear.testnet";
const privateKey = "ed25519:ZD75nydUKTxRWK6dWuMVZ5SLMSxb1Wet4SMSbCq9LGQcDuPbMyWqet2vqfLEWWEUa3diwkjvMJZq1DeUah7dreq";
const keyStore = new keyStores.InMemoryKeyStore();
const proofType = new ProofTypeNear();

let walletAccount: any;

beforeAll(async () => {
  const keyPair = KeyPair.fromString(privateKey);
  await keyStore.setKey('testnet', accountId, keyPair);

  const near = await connect({
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://testnet.mynearwallet.com',
    keyStore,
  });

  walletAccount = await near.account(accountId);
});

describe('ProofTypeNear integration (testnet)', () => {
    const timestamp = Date.now();
    const subjectDid = `did:near:usuario${timestamp}.testnet`;
    const cid = `bafy-${timestamp}`;


  it('should issue a credential and verify it', async () => {
    const payload = {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        type: ["VerifiableCredential"],
        issuer: "did:near:issuer.testnet",
        issuanceDate: new Date().toISOString(),
        credentialSubject: { id: subjectDid }
    };
    const proof = await proofType.generateProof(
      payload,
      {
        wallet: {
          account: () => walletAccount,
        } as any,
        cid,
      }
    );

    expect(proof).toBe(`${subjectDid}|${cid}`);

    const isValid = await proofType.verifyProof(proof);
    expect(isValid).toBe(true);
  });
});
