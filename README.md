# prooftypes

## Create a Verified Credential

```ts
import { JwtCredentialPayload } from '@kaytrust/prooftypes'
import { createDidEthrFromPrivateKey } from '@kaytrust/did-ethr'

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

const privateKey = "<PRIVATE_KEY>";
const AMOY_CHAIN_ID = 80002;
const issuer = createDidEthrFromPrivateKey(privateKey, {chainNameOrId: AMOY_CHAIN_ID})
const proofTypeJwtCredential = new ProofTypeJWT({issuer})

const vcJwt = await proofTypeJwtCredential.generateProof(vcPayload)
console.log(vcJwt)
// eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQi...0CQmqB14NnN5XxD0d_glLRs1Myc_LBJjnuNwE
```

## Verifying JWTs 
```ts
import { ResolverOrOptions, ProofTypeJWT } from '@kaytrust/prooftypes'
const RPC_AMOY = "<RPC_AMOY>";
const AMOY_CHAIN_ID = 80002;
const resolver:ResolverOrOptions = {registry: '0xBC56d0883ef228b2B16420E9002Ece0A46c893F8', rpcUrl: RPC_AMOY, chainId: AMOY_CHAIN_ID}
const proofTypeJwtCredential = new ProofTypeJWT({resolver})

const verifiedVC = await proofTypeJwtCredential.verifyProof(vcJwt)
console.log(verifiedVC)
/*
{
  "payload": {
    // the original payload of the signed credential
  },
  "doc": {
    // the DID document of the credential issuer (as returned by the `resolver`)
  },
  "issuer": "did:ethr:0xf1232f840f3ad7d23fcdaa84d6c66dac24efb198", //the credential issuer
  "signer": {
    //the publicKey entry of the `doc` that has signed the credential
  },
  "jwt": "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NjY...Sx3Y2IdWaUpatJQA", // the original credential
  
  //parsed payload aligned to the W3C data model
  "verifiableCredential": {
    "@context": [Array],
    "type": [ "VerifiableCredential", "UniversityDegreeCredential" ],
    "issuer": {
      "id": "did:ethr:0xf1232f840f3ad7d23fcdaa84d6c66dac24efb198"
    },
    "issuanceDate": "2019-07-12T16:51:22.000Z",
    "credentialSubject": {
      "id": "did:ethr:0x435df3eda57154cf8cf7926079881f2912f54db4"
      "degree": {
        "type": "BachelorDegree",
        "name": "Baccalauréat en musiques numériques"
      },
    },
    "proof": {
      //  proof type for internal use, NOT a registered vc-data-model type
      "type": "JwtProof2020",
      "jwt": "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NjY...Sx3Y2IdWaUpatJQA"
    }
  }
}
*/
```