export { Issuer } from '@kaytrust/did-base'
import {JwtCredentialPayload} from 'did-jwt-vc'
export {ProofTypeJWT, ResolverOrOptions} from './proof-type-jwt'
export {ProofType} from './proof-type'
export { CredentialPayload, JwtCredentialPayload, VerifiedCredential, PresentationPayload, JwtPresentationPayload, VerifiedPresentation } from 'did-jwt-vc'

export type CredentialStatus = JwtCredentialPayload["vc"]["credentialStatus"]