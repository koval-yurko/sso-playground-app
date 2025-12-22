import { deflateRawSync } from 'node:zlib'

export const deflateRaw = (str: string): Buffer => {
  return deflateRawSync(Buffer.from(str, 'utf-8'))
}
