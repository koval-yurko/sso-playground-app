export default defineEventHandler((event) => {
  const name = getRouterParam(event, 'name')



  return {
    //event: event.method,
    hello: 'world',
    name: name || 'void',
  }
})
