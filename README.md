# @kaytrust/prooftypes

`@kaytrust/prooftypes` is a library that allows the creation and verification of [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/) and Presentations in JWT format, using the `JwtProof2020` proof type.

## Features

- **Creation of Verifiable Credentials (VC)** in JWT format.
- **Creation of Verifiable Presentations (VP)** in JWT format.
- **Verification of VC and VP** using DID-compatible resolvers.
- **Support for multiple DID methods**, such as `did:near` and `did:ethr`.

---

## Installation

You can install the library using `npm` or `yarn`:

```bash
npm install @kaytrust/prooftypes
# or
yarn add @kaytrust/prooftypes
```

---

## Usage

### Introduction

The library provides the `ProofTypeJWT` class to handle the creation and verification of proofs in JWT format. Below are the steps required to use it.

---

### Initial Configuration

#### `ProofTypeJWT` Constructor

```typescript
constructor(options: ProofTypeJWTConfig = {}, is_presentation?: boolean)
```

- **`ProofTypeJWTConfig`**: Optional configuration for the issuer (`Issuer`) or verification options (`resolver` and `verifyOptions`).
- **`is_presentation`**: If `true`, it will work with Verifiable Presentations; otherwise, it will work with Verifiable Credentials.

##### `ProofTypeJWTConfig` Type

```typescript
type ProofTypeJWTConfig = {
    issuer?: Issuer, // Issuer to sign JWTs
    resolver?: ResolverOrOptions, // Resolver to verify JWTs
    verifyOptions?: VerifyOptions, // Additional verification options
}
```

---

### Creating JWTs

#### Prerequisites

Before creating a JWT, you need to configure an `Issuer` object to sign the JWTs. You can use libraries such as [`@kaytrust/did-near`](https://github.com/KayTrust/did-near) or [`@kaytrust/did-ethr`](https://github.com/KayTrust/did-ethr).

##### Example of Configuring an `Issuer`

```typescript
import { NearDID } from '@kaytrust/did-near'
import { EthrDID } from '@kaytrust/did-ethr'

// NearDID Configuration
const issuer = new NearDID({
    privateKey: 'YOUR_PRIVATE_KEY',
    identifier: 'alice.near', // Optional
})

// EthrDID Configuration
const issuerEthr = new EthrDID({
    identifier: '0xf1232f840f3ad7d23fcdaa84d6c66dac24efb198', // Required
    privateKey: 'YOUR_PRIVATE_KEY'
})
```

The `Issuer` object includes:
- **`did`**: Identifier of the issuer.
- **`alg`**: Algorithm used in the JWT header.
- **`signer`**: Function to generate the signature.

---

#### Creating a Verifiable Credential (VC)

1. Define the credential payload following the `JwtCredentialPayload` interface.
2. Use the `generateProof` method of the `ProofTypeJWT` class to generate the JWT.

##### Example

```typescript
import { JwtCredentialPayload, ProofTypeJWT } from '@kaytrust/prooftypes'

const vcPayload: JwtCredentialPayload = {
  sub: 'did:near:...',
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

const proofTypeJwtCredential = new ProofTypeJWT({ issuer })
const vcJwt = await proofTypeJwtCredential.generateProof(vcPayload)
console.log(vcJwt)
// eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQi...0CQmqB14NnN5XxD0d_glLRs1Myc_LBJjnuNwE
```

#### Creating a Verifiable Presentation (VP)

1. Define the presentation payload following the `JwtPresentationPayload` interface.
2. Use the `generateProof` method of the `ProofTypeJWT` class, setting the `is_presentation` parameter to `true`.

##### Example

```typescript
import { JwtPresentationPayload, ProofTypeJWT } from '@kaytrust/prooftypes'

const vpPayload: JwtPresentationPayload = {
  vp: {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiablePresentation'],
    verifiableCredential: [vcJwt]
  }
}

const proofTypeJwtPresentation = new ProofTypeJWT({ issuer }, true)
const vpJwt = await proofTypeJwtPresentation.generateProof(vpPayload)
console.log(vpJwt)
// eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1ODI1NDc...JNMUzZ6naacuWNGdZGuU0ZDwmgpUMUqIzMqFFRmge0R8QA
```

---

### Verifying JWTs

#### Prerequisites

To verify a JWT, you need a resolver that can resolve DID documents. You can use [`did-resolver`](https://github.com/decentralized-identity/did-resolver) with specific resolvers such as `did:near` or `did:ethr`.

##### Example of Configuring a Resolver

```typescript
import { ResolverOrOptions } from '@kaytrust/prooftypes'
import { Resolver } from 'did-resolver'
import { getResolver as getNearResolver } from '@kaytrust/did-near-resolver'
import ethr from 'ethr-did-resolver'

const nearResolver = getNearResolver()
const ethrResolver = ethr.getResolver()

//If you are using multiple methods you need to flatten them into one object
const resolver:ResolverOrOptions = new Resolver({
    ...nearResolver,
    ...ethrResolver,
})
//If you are using one method you can simply pass the result of getResolver( into the constructor
const resolver:ResolverOrOptions = new Resolver(nearResolver);
```

##### EthrDID **resolver options** example

Setting **resolver options** for [ethr-did-resolver](https://github.com/decentralized-identity/ethr-did-resolver)

```typescript
import { ResolverOrOptions, ProofTypeJWT } from '@kaytrust/prooftypes'
const RPC_AMOY = "<RPC_AMOY>";
const AMOY_CHAIN_ID = 80002;

const resolver:ResolverOrOptions = {registry: '0xBC56d0883ef228b2B16420E9002Ece0A46c893F8', rpcUrl: RPC_AMOY, chainId: AMOY_CHAIN_ID}
```


---

#### Verifying a Verifiable Credential (VC)

Use the `verifyProof` method of the `ProofTypeJWT` class to verify the JWT.

##### Example

```typescript
import { ProofTypeJWT } from '@kaytrust/prooftypes'

const proofTypeJwtCredential = new ProofTypeJWT({ resolver })
const verifiedVC = await proofTypeJwtCredential.verifyProof(vcJwt)
console.log(verifiedVC)
```

---

#### Verifying a Verifiable Presentation (VP)

Use the `verifyProof` method of the `ProofTypeJWT` class, setting the `is_presentation` parameter to `true`.

##### Example

```typescript
import { ProofTypeJWT } from '@kaytrust/prooftypes'

const proofTypeJwtPresentation = new ProofTypeJWT({ resolver }, true)
const verifiedVP = await proofTypeJwtPresentation.verifyProof(vpJwt)
console.log(verifiedVP)
```

---

## Additional Notes

- The `JwtProof2020` proof type is a synthetic type for internal use and is not registered in the W3C data model.
- Verified payloads are aligned with the W3C data model, making them easier to use in systems that handle multiple credential formats.

---

## Contributions

If you want to contribute to this project, please open an [issue](https://github.com/KayTrust/prooftypes/issues) or submit a pull request.
---

## 🟣 ProofTypeNear

This proof type allows you to register and verify verifiable credentials directly on the [NEAR](https://near.org) blockchain using a smart contract.

### Contract

- **Network**: testnet
- **Contract ID**: `neardtiprooftype.testnet`
- **CID**: The proof is the base64-encoded SHA-256 hash of the VC payload

### Installation

Make sure `near-api-js` is available in your project.

```bash
npm install near-api-js
```

### Usage

```ts
import { ProofTypeNear } from './proof-type-near';
import { connect, keyStores, WalletConnection } from 'near-api-js';
import CryptoJS from 'crypto-js';

const proofType = new ProofTypeNear();
const wallet: WalletConnection = /* your connected wallet */;
const vcPayload = {
  issuer: 'did:near:issuer.testnet',
  credentialSubject: {
    id: 'did:near:user.testnet',
    name: 'Alice'
  },
  issuanceDate: new Date().toISOString(),
  type: ['VerifiableCredential']
};

// Generate CID from VC payload
const cid = CryptoJS.SHA256(JSON.stringify(vcPayload)).toString(CryptoJS.enc.Base64);

// Generate on-chain proof
const proof = await proofType.generateProof(vcPayload, {
  wallet,
  cid
});

// Verify
const valid = await proofType.verifyProof(proof);
console.log(valid); // true or false
```

### Notes

- The contract only allows a `(did, cid)` pair to be used once.
- The proof is linked to the NEAR account that issues the credential.
