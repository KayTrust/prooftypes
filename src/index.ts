export { Issuer } from '@kaytrust/did-base'
export { CredentialPayload, JwtCredentialPayload, JwtPresentationPayload, PresentationPayload, VerifiedCredential, VerifiedPresentation } from 'did-jwt-vc'
export { ProofType } from './proof-type'
export { ProofTypeJWT, ResolverOrOptions } from './proof-type-jwt'
export { ProofTypeNear } from './proof-type-near'
import { JwtCredentialPayload } from 'did-jwt-vc'

export type CredentialStatus = JwtCredentialPayload["vc"]["credentialStatus"]