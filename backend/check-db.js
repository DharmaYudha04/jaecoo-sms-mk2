const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Just12345678@localhost:5434/jaecoo_service_system'
});

async function checkDatabase() {
  try {
    await client.connect();
    console.log('✅ Database connected successfully\n');

    const tables = ['User', 'Pemilik', 'Kendaraan', 'WorkOrder', 'Servis'];

    for (const table of tables) {
      try {
        const res = await client.query(`SELECT * FROM "${table}" LIMIT 5`);
        console.log(`📋 ${table}: ${res.rows.length} records`);
        if (res.rows.length > 0) {
          console.log('Sample data:', JSON.stringify(res.rows, null, 2));
        } else {
          console.log('(empty table)');
        }
        console.log('---');
      } catch (err) {
        console.log(`❌ ${table}: Error - ${err.message}`);
      }
    }

  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  } finally {
    await client.end();
  }
}

checkDatabase();