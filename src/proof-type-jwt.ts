import { CredentialPayload, JwtCredentialPayload, VerifiedCredential, JwtPresentationPayload, VerifiedPresentation, createVerifiableCredentialJwt, createVerifiablePresentationJwt, verifyCredential, verifyPresentation } from 'did-jwt-vc'
import { Issuer as IssuerBase } from '@kaytrust/did-base'
import { ProofType } from "./proof-type";
import { Resolver } from 'did-resolver'
import { getResolver } from 'ethr-did-resolver'

import type {CreatePresentationOptions, Issuer as IssuerDid, PresentationPayload, VerifyPresentationOptions} from 'did-jwt-vc'
import { EthrDID } from '@kaytrust/did-ethr';

type VerifyOptions = VerifyPresentationOptions

type Issuer = IssuerBase | IssuerDid | EthrDID

interface InfuraConfiguration {
    infuraProjectId: string
}

// type MultiProviderConfiguration = Exclude<Parameters<typeof getResolver>[0], InfuraConfiguration>

// type ProviderConfiguration = Exclude<MultiProviderConfiguration["networks"], undefined>[number]
type ResolverOptions = Parameters<typeof getResolver>[0]
type Resolvable = Exclude<VerifyOptions["resolver"], undefined>

export type ResolverOrOptions = Resolver | {rpcUrl: string, registry: string} | Partial<ResolverOptions>

export type VerifyOptionsProofTypeJWT = {
    resolver: Partial<Resolvable> | ResolverOrOptions,
} & Omit<VerifyOptions, 'resolver'>

type ProofTypeJWTConfig = {
    issuer?: Issuer,
    resolver?: ResolverOrOptions,
    verifyOptions?: VerifyOptions,
}

export class ProofTypeJWT<
    IP extends boolean = false, 
    D extends (IP extends true ? (JwtPresentationPayload | PresentationPayload) : (JwtCredentialPayload | CredentialPayload)) = (IP extends true ? (JwtPresentationPayload | PresentationPayload) : (JwtCredentialPayload | CredentialPayload)),
    VR extends (IP extends true ? VerifiedPresentation : VerifiedCredential) = (IP extends true ? VerifiedPresentation : VerifiedCredential),
> extends ProofType<D, string, Issuer, VR> {
    private issuer?: Issuer;
    private resolver?: ResolverOrOptions;
    private verifyOptions?: VerifyOptions;
    readonly is_presentation: IP

    constructor(options: ProofTypeJWTConfig = {}, is_presentation?: IP) {
        super();
        this.issuer = options.issuer;
        this.resolver = options.resolver;
        this.verifyOptions = options.verifyOptions;
        this.is_presentation = is_presentation!;
    }

    verifyProof(verifiableObjectWithProof: string, options?: VerifyOptionsProofTypeJWT): Promise<VR> {
        let {resolver: resolverBase, ...verifyOptionsCustom} = options||{}
        const verifyOptions = {...this.verifyOptions, ...verifyOptionsCustom};
        let resolver: Resolver;
        if (!resolverBase) resolverBase = this.resolver;
        if (!resolverBase) throw new Error("missing_resolver: No DID resolver has been configured")
        if (resolverBase instanceof Resolver || !!(resolverBase as Resolvable).resolve) {
            resolver = resolverBase as Resolver;
        } else {
            resolver = new Resolver(getResolver(resolverBase))
        }
        if (this.is_presentation) return verifyPresentation(verifiableObjectWithProof, resolver, verifyOptions) as Promise<VR>
        return verifyCredential(verifiableObjectWithProof, resolver, verifyOptions) as Promise<VR>
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    generateProof(verifiableObject: D, issuer?: any, options?: CreatePresentationOptions): Promise<string> {
        if (!issuer) issuer = this.issuer;
        if (!issuer) throw new Error("missing_issuer: No issuer has been configured");
        if (this.is_presentation) return createVerifiablePresentationJwt(verifiableObject as any, issuer as IssuerBase, {...options, header: {kid: verifiableObject.iss||verifiableObject.issuer||this.issuer?.did, ...options?.header}})
        return createVerifiableCredentialJwt(verifiableObject as any, issuer as IssuerBase, {...options, header: {kid: verifiableObject.iss||verifiableObject.issuer, ...options?.header}})
    }

    readonly proofType = 'JwtProof2020';
    static PROOF_TYPE: string = 'JwtProof2020';
}