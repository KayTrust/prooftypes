import { ProofTypeJWT, ResolverOrOptions } from '#src/proof-type-jwt';
import {test, expect, describe} from 'vitest'
import { createDidEthr } from '@kaytrust/did-ethr'
import { Wallet } from 'ethers'
import { JwtCredentialPayload, JwtPresentationPayload } from 'did-jwt-vc';

const privateKey = process.env.TEST_KEY!
const wallet = privateKey ? new Wallet(privateKey) : Wallet.createRandom()
const RPC_AMOY = process.env.RPC_AMOY!;
const AMOY_CHAIN_ID = 80002;
const issuer = createDidEthr(wallet.address, {chainNameOrId: AMOY_CHAIN_ID, privateKey: wallet.privateKey, rpcUrl: RPC_AMOY})
const resolver:ResolverOrOptions = {registry: '0xBC56d0883ef228b2B16420E9002Ece0A46c893F8', rpcUrl: RPC_AMOY, chainId: AMOY_CHAIN_ID}
const proofTypeCredential = new ProofTypeJWT({issuer, resolver})
const proofTypePresentation = new ProofTypeJWT({issuer, resolver}, true)

const vcPayload: JwtCredentialPayload = {
    sub: 'did:ethr:0x435df3eda57154cf8cf7926079881f2912f54db4',
    nbf: 1562950282,
    vc: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential'],
        credentialSubject: {
        degree: {
            type: 'BachelorDegree',
            name: 'Baccalauréat en musiques numériques'
        }
        }
    }
}

const vpPayload: JwtPresentationPayload = {
    vp: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      verifiableCredential: []
    }
}

describe('create vc with proofType', () => {
    test('create with isser constructor', async () => {
        const jwt = await proofTypeCredential.generateProof(vcPayload)
        expect(jwt).toMatch(/(^[\w-]*\.[\w-]*\.[\w-]*$)/);
    });

    test('create with isser method', async () => {
        const proofTypeCredentialEmpty = new ProofTypeJWT()
        const jwt = await proofTypeCredentialEmpty.generateProof(vcPayload, issuer)
        expect(jwt).toMatch(/(^[\w-]*\.[\w-]*\.[\w-]*$)/);
    });

    test('compare both creations', async () => {
        const proofTypeCredentialEmpty = new ProofTypeJWT()
        const jwt1 = await proofTypeCredentialEmpty.generateProof(vcPayload, issuer)
        const jwt0 = await proofTypeCredential.generateProof(vcPayload)
        expect(jwt1).toBe(jwt0);
    });

    test('thow error no issuer', async () => {
        const proofTypeCredentialEmpty = new ProofTypeJWT()
        expect(() => proofTypeCredentialEmpty.generateProof(vcPayload)).toThrow('missing_issuer: No issuer has been configured');
    });
});

describe('create vp with proofType', () => {
    test('vp with isser constructor', async () => {
        const jwt = await proofTypePresentation.generateProof(vpPayload)
        expect(jwt).toMatch(/(^[\w-]*\.[\w-]*\.[\w-]*$)/);
    });

    test('vp with isser method', async () => {
        const proofTypePresentationEmpty = new ProofTypeJWT({}, true)
        const jwt = await proofTypePresentationEmpty.generateProof(vpPayload, issuer)
        expect(jwt).toMatch(/(^[\w-]*\.[\w-]*\.[\w-]*$)/);
    });

    test('vp both creations', async () => {
        const proofTypePresentationEmpty = new ProofTypeJWT({}, true)
        const jwt1 = await proofTypePresentationEmpty.generateProof(vpPayload, issuer)
        const jwt0 = await proofTypePresentation.generateProof(vpPayload)
        expect(jwt1).toBe(jwt0);
    });

    test('vp thow error no issuer', async () => {
        const proofTypePresentationEmpty = new ProofTypeJWT({}, true)
        expect(() => proofTypePresentationEmpty.generateProof(vpPayload)).toThrow('missing_issuer: No issuer has been configured');
    });
});


if (RPC_AMOY) {
    describe('validate vc jwt', () => {
        test('validate issuer constructor', async () => {
            const jwt = await proofTypeCredential.generateProof(vcPayload)
            const verified = await proofTypeCredential.verifyProof(jwt)
            expect(verified.verified).toBeTruthy();
        }, {timeout: 30000});
    });
}