import { IProtoSchema } from "./proto-schema.interface"

export interface IProtoParser {
  parsers: IProtoSchema[];
  schemas: Buffer[];
}