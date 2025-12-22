
export const base64Encode = (data: Buffer | string): string => {
  if (typeof data === 'string') {
    return Buffer.from(data).toString('base64')
  }
  return data.toString('base64')
}

export const base64Decode = (data: string): string => {
  return Buffer.from(data, 'base64').toString('utf-8')
}
