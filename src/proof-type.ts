import { CredentialPayload, JwtCredentialPayload } from "did-jwt-vc";

export abstract class ProofType<T extends {[key: string]: any} = JwtCredentialPayload | CredentialPayload, GenRes = string, Extra = any, VeriRes = boolean|Record<string,any>, ExtraVeri = any> {
    abstract readonly proofType: string;
    abstract generateProof(verifiableObject: T, extra?: Extra): Promise<GenRes>;
    abstract verifyProof(verifiableObjectWithProof: GenRes, extra?: ExtraVeri): Promise<VeriRes>;
}