export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')

  if (!key) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Key parameter is required',
    })
  }

  const config = useRuntimeConfig()
  const baseUrl = config.public.baseUrl
  const entityId = baseUrl
  const acsUrl = `${baseUrl}/api/auth/saml/${key}/callback`

  // Generate SAML SP metadata XML
  const metadata = `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor
  xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
  entityID="${entityId}"
>
  <md:SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:NameIDFormat>
      urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress
    </md:NameIDFormat>
    <md:AssertionConsumerService
      Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
      Location="${acsUrl}"
      index="0"
    />
  </md:SPSSODescriptor>
</md:EntityDescriptor>`

  // Set appropriate headers for XML response
  setResponseHeader(event, 'Content-Type', 'application/xml')
  return metadata
})
