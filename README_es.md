# @kaytrust/prooftypes

`@kaytrust/prooftypes` es una librería que permite crear y verificar [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/) y Presentations en formato JWT, utilizando el tipo de prueba `JwtProof2020`.

## Características

- **Creación de Verifiable Credentials (VC)** en formato JWT.
- **Creación de Verifiable Presentations (VP)** en formato JWT.
- **Verificación de VC y VP** utilizando resolvers compatibles con DID.
- **Soporte para múltiples métodos DID**, como `did:near` y `did:ethr`.

---

## Instalación

Puedes instalar la librería utilizando `npm` o `yarn`:

```bash
npm install @kaytrust/prooftypes
# o
yarn add @kaytrust/prooftypes
```

---

## Uso

### Introducción

La librería proporciona la clase `ProofTypeJWT` para manejar la creación y verificación de pruebas en formato JWT. A continuación, se explican los pasos necesarios para usarla.

---

### Configuración Inicial

#### Constructor de `ProofTypeJWT`

```typescript
constructor(options: ProofTypeJWTConfig = {}, is_presentation?: boolean)
```

- **`ProofTypeJWTConfig`**: Configuración opcional para el emisor (`Issuer`) o las opciones de verificación (`resolver` y `verifyOptions`).
- **`is_presentation`**: Si es `true`, se trabajará con Verifiable Presentations; de lo contrario, se trabajará con Verifiable Credentials.

##### Tipo `ProofTypeJWTConfig`

```typescript
type ProofTypeJWTConfig = {
    issuer?: Issuer, // Emisor para firmar JWTs
    resolver?: ResolverOrOptions, // Resolver para verificar JWTs
    verifyOptions?: VerifyOptions, // Opciones adicionales de verificación
}
```

---

### Creación de JWTs

#### Prerrequisitos

Antes de crear un JWT, necesitas configurar un objeto `Issuer` para firmar los JWTs. Puedes usar librerías como [`@kaytrust/did-near`](https://github.com/KayTrust/did-near) o [`@kaytrust/did-ethr`](https://github.com/KayTrust/did-ethr).

##### Ejemplo de configuración de un `Issuer`

```typescript
import { NearDID } from '@kaytrust/did-near'
import { EthrDID } from '@kaytrust/did-ethr'

// Configuración de NearDID
const issuer = new NearDID({
    privateKey: 'TU_LLAVE_PRIVADA',
    identifier: 'alice.near', // Opcional
})

// Configuración de EthrDID
const issuerEthr = new EthrDID({
    identifier: '0xf1232f840f3ad7d23fcdaa84d6c66dac24efb198', // Requerido
    privateKey: 'TU_LLAVE_PRIVADA'
})
```

El objeto `Issuer` incluye:
- **`did`**: Identificador del emisor.
- **`alg`**: Algoritmo utilizado en el encabezado del JWT.
- **`signer`**: Función para generar la firma.

---

#### Creación de una Verifiable Credential (VC)

1. Define el payload de la credencial siguiendo la interfaz `JwtCredentialPayload`.
2. Usa el método `generateProof` de la clase `ProofTypeJWT` para generar el JWT.

##### Ejemplo

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
```

---

#### Creación de una Verifiable Presentation (VP)

1. Define el payload de la presentación siguiendo la interfaz `JwtPresentationPayload`.
2. Usa el método `generateProof` de la clase `ProofTypeJWT`, configurando el parámetro `is_presentation` como `true`.

##### Ejemplo

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
```

---

### Verificación de JWTs

#### Prerrequisitos

Para verificar un JWT, necesitas un resolver que pueda resolver los documentos DID. Puedes usar [`did-resolver`](https://github.com/decentralized-identity/did-resolver) con resolvers específicos como `did:near` o `did:ethr`.

##### Ejemplo de configuración de un Resolver

```typescript
import { Resolver } from 'did-resolver'
import { getResolver as getNearResolver } from '@kaytrust/did-near-resolver'
import ethr from 'ethr-did-resolver'

const nearResolver = getNearResolver()
const ethrResolver = ethr.getResolver()

const resolver = new Resolver({
    ...nearResolver,
    ...ethrResolver,
})
```

---

#### Verificación de una Verifiable Credential (VC)

Usa el método `verifyProof` de la clase `ProofTypeJWT` para verificar el JWT.

##### Ejemplo

```typescript
import { ProofTypeJWT } from '@kaytrust/prooftypes'

const proofTypeJwtCredential = new ProofTypeJWT({ resolver })
const verifiedVC = await proofTypeJwtCredential.verifyProof(vcJwt)
console.log(verifiedVC)
```

---

#### Verificación de una Verifiable Presentation (VP)

Usa el método `verifyProof` de la clase `ProofTypeJWT`, configurando el parámetro `is_presentation` como `true`.

##### Ejemplo

```typescript
import { ProofTypeJWT } from '@kaytrust/prooftypes'

const proofTypeJwtPresentation = new ProofTypeJWT({ resolver }, true)
const verifiedVP = await proofTypeJwtPresentation.verifyProof(vpJwt)
console.log(verifiedVP)
```

---

## Notas Adicionales

- El tipo de prueba `JwtProof2020` es un tipo sintético para uso interno y no está registrado en el modelo de datos de W3C.
- Los payloads verificados están alineados con el modelo de datos de W3C, lo que facilita su uso en sistemas que manejan múltiples formatos de credenciales.

---

## Contribuciones

Si deseas contribuir a este proyecto, por favor abre un [issue](https://github.com/KayTrust/prooftypes/issues) o envía un pull request.
