import { Location } from "graphql"

export interface IGraphqlSchema {
  kind: 'Document'
  definitions: IDefinition[]
  loc: Location
}

export interface IDefinition {
  kind: string
  description: any
  name: IName
  interface: []
  directives: []
  fields: IField[]
}

interface IField {
  kind: string
  description: any
  name: IName
  arguments: []
  type: IType
  directives: []
  loc: ILoc
}

interface IType {
  kind: string,
  name: IName,
  loc: ILoc,
  type: IType
}

interface IName {
  kind: string
  value: string
  loc: ILoc
}

interface ILoc {
  start: number
  end: number
}