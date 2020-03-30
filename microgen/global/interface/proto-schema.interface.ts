export interface IProtoSchema {
  syntax: number
  package: string
  imports: []
  enums: []
  messages: IMessage[]
  options: Object
  extends: []
  services: IService[]
}

interface IMessage {
  name: string
  options: Object
  enums: []
  extends: []
  messages: []
  fields: IField[]
  extensions: any
}

interface IService {
  name: string
  methods: IMethod[]
  options: Object
}

interface IField {
  name: string
  type: string
  tag: number
  map: any
  oneof: any
  required: boolean
  repeated: boolean
  options: Object
}

interface IMethod {
  name: string
  input_type: string
  output_type: string
  client_streaming: boolean
  server_streaming: boolean
  options: Object
}