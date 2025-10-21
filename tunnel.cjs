const localtunnel = require('localtunnel');

(async () => {
  const tunnel = await localtunnel({
    port: 3000,
    subdomain: 'jantec-erp'
  });

  console.log('\n========================================');
  console.log('✅ JANTEC ERP is now accessible at:');
  console.log(tunnel.url);
  console.log('========================================\n');
  console.log('Press Ctrl+C to stop the tunnel');

  tunnel.on('close', () => {
    console.log('Tunnel closed');
  });
})();
