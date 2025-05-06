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
    iss: 'did:ethr:0x435df3eda57154cf8cf7926079881f2912f54db4',
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
        console.log("vp.jwt", jwt)
        expect(jwt).toMatch(/(^[\w-]*\.[\w-]*\.[\w-]*$)/);
    });

    test('vp with isser method', async () => {
        const proofTypePresentationEmpty = new ProofTypeJWT({}, true)
        const jwt = await proofTypePresentationEmpty.generateProof(vpPayload, issuer)
        expect(jwt).toMatch(/(^[\w-]*\.[\w-]*\.[\w-]*$)/);
    });

    test('vp both creations', async () => {
        const proofTypePresentationEmpty = new ProofTypeJWT({}, true)
        const payload = {...vpPayload, iss: issuer.did};
        const jwt1 = await proofTypePresentationEmpty.generateProof(payload, issuer)
        const jwt0 = await proofTypePresentation.generateProof(payload)
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
            console.log("jwt", jwt)
            const verified = await proofTypeCredential.verifyProof(jwt)
            expect(verified.verified).toBeTruthy();
        }, {timeout: 30000});
    });
}


if (RPC_AMOY) {
    describe('validate vc jwt', () => {
        test('empty ', async () => {
            const proofTypeCredentialEmpty = new ProofTypeJWT({verifyOptions: {policies: {aud: false}}}, false)
            const jwt = "eyJraWQiOiJkaWQ6ZXRocjoweDEzODgyOjB4NmRmOTRGMjc3OTM3Y2VBOTg5MzczNTljN0ZhZDg0MTU4ZTUzNTE2NSIsImFsZyI6IkVTMjU2Sy1SIiwidHlwIjoiSldUIn0.eyJpYXQiOjE3NDY1MjM2MDMsInZjIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sImlkIjoidmM6bWVsb25fdW5pdmVyc2l0eSM5ZTMwOGI2Yi0zMWEzLTQ1OGUtOGEwMC0xNDYyMjhkNTZhNWIiLCJ0eXBlIjpbIkFjbWVBY2NyZWRpdGF0aW9uIiwiVmVyaWZpYWJsZUNyZWRlbnRpYWwiXSwiaXNzdWVyIjoiZGlkOmV0aHI6MHgxMzg4MjoweDZkZjk0RjI3NzkzN2NlQTk4OTM3MzU5YzdGYWQ4NDE1OGU1MzUxNjUiLCJjcmVkZW50aWFsU3ViamVjdCI6eyJrbm93c0Fib3V0Ijp7InByb3ZpZGVyIjp7IkB0eXBlIjoiRWR1Y2F0aW9uYWxPcmdhbml6YXRpb24iLCJuYW1lIjoiTWVsb24gVW5pdmVyc2l0eSJ9LCJAdHlwZSI6IkNvdXJzZSIsIm5hbWUiOiJCYWNoZWxvcidzIERlZ3JlZSBpbiBCbG9ja2NoYWluIFRlY2hub2xvZ2llcyIsImFib3V0IjoiV2ViMyIsImRlc2NyaXB0aW9uIjoiQW4gaW50ZW5zaXZlIGNvdXJzZSBvbiBCbG9ja2NoYWluIFRlY2hub2xvZ2llcywgdG9rZW5zLCBuZXR3b3JrcyBhbmQgbW9yZSJ9LCJAdHlwZSI6IlBlcnNvbiIsIm5hbWUiOiJHZWluZXIgR3JhbmRleiIsIkBpZCI6ImRpZDpldGhyOjB4MTM4ODI6MHgwMmFkMzAyM2RmNGI1Y2Y0YjYzNTNmYWQ0YmE1OGYyNzk4MTQ0MWYzMTkzYzNhYWMwOTBkMzA5ZDEzZGE0ZDI3YmMiLCJlbWFpbCI6ImdlaW5lcjEyMDMwMEBnbWFpbC5jb20iLCJpZCI6ImRpZDpldGhyOjB4MTM4ODI6MHgwMmFkMzAyM2RmNGI1Y2Y0YjYzNTNmYWQ0YmE1OGYyNzk4MTQ0MWYzMTkzYzNhYWMwOTBkMzA5ZDEzZGE0ZDI3YmMifSwiaXNzdWFuY2VEYXRlIjoiMjAyNS0wNS0wNlQwOToyNjo0M1oifSwianRpIjoidmM6bWVsb25fdW5pdmVyc2l0eSM5ZTMwOGI2Yi0zMWEzLTQ1OGUtOGEwMC0xNDYyMjhkNTZhNWIiLCJzdWIiOiJkaWQ6ZXRocjoweDEzODgyOjB4MDJhZDMwMjNkZjRiNWNmNGI2MzUzZmFkNGJhNThmMjc5ODE0NDFmMzE5M2MzYWFjMDkwZDMwOWQxM2RhNGQyN2JjIiwiaXNzIjoiZGlkOmV0aHI6MHgxMzg4MjoweDZkZjk0RjI3NzkzN2NlQTk4OTM3MzU5YzdGYWQ4NDE1OGU1MzUxNjUiLCJuYmYiOjE3NDY1MjM2MDMsImF1ZCI6Imh0dHBzOi8vZnJ1dGFzLmRlbW8ua2F5dHJ1c3QuaWQifQ.c9mwZQ2VzwriWVGJDNp1LvBOhMXQ3X9gDYWmSH80mUohc7WAboU6GU0gudVpOngxL6HM1pabFQFDm25P8qAOBQE"
            const verified = await proofTypeCredentialEmpty.verifyProof(jwt, {resolver: {registry: "0xBC56d0883ef228b2B16420E9002Ece0A46c893F8", rpcUrl: RPC_AMOY, chainId: AMOY_CHAIN_ID}})
            expect(verified.verified).toBeTruthy();
        }, {timeout: 30000});
    });
}