const http = require('http');
const handler = require('serve-handler');

const port = Number(process.env.PORT || 8080);

const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: __dirname,
    cleanUrls: false,
    directoryListing: false,
    rewrites: [
      { source: '/', destination: '/index.html' },
    ],
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`FilaZero-WebSite running on port ${port}`);
});