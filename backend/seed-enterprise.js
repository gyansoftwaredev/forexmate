const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
  console.log('--- ENTERPRISE CORE DB SEEDING STARTED ---');

  // 1. Seed Roles & Permissions
  const ROLES = [
    'CUSTOMER',
    'AGENT',
    'STAFF',
    'BRANCH_MANAGER',
    'COMPLIANCE',
    'DEALER',
    'ACCOUNTANT',
    'SUPER_ADMIN',
  ];

  const PERMISSIONS = [
    'orders:read:own',
    'orders:read:all',
    'orders:update:status',
    'rates:read',
    'rates:update',
    'kyc:upload:own',
    'kyc:review:all',
    'vault:read:branch',
    'vault:write:branch',
    'vault:read:global',
    'reports:financial',
    'users:manage:all',
  ];

  const ROLE_PERMISSIONS = {
    CUSTOMER: ['orders:read:own', 'rates:read', 'kyc:upload:own'],
    AGENT: ['orders:read:own', 'rates:read', 'kyc:upload:own'],
    STAFF: [
      'orders:read:all',
      'orders:update:status',
      'rates:read',
      'vault:read:branch',
      'vault:write:branch',
    ],
    BRANCH_MANAGER: [
      'orders:read:all',
      'orders:update:status',
      'rates:read',
      'kyc:review:all',
      'vault:read:branch',
      'vault:write:branch',
      'users:manage:all',
    ],
    COMPLIANCE: ['orders:read:all', 'rates:read', 'kyc:review:all'],
    DEALER: ['orders:read:all', 'rates:read', 'rates:update', 'vault:read:global'],
    ACCOUNTANT: ['orders:read:all', 'rates:read', 'vault:read:global', 'reports:financial'],
    SUPER_ADMIN: PERMISSIONS,
  };

  const dbRoles = {};
  for (const roleName of ROLES) {
    dbRoles[roleName] = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }
  console.log('Roles seeded.');

  const dbPermissions = {};
  for (const action of PERMISSIONS) {
    dbPermissions[action] = await prisma.permission.upsert({
      where: { action },
      update: {},
      create: { action },
    });
  }
  console.log('Permissions seeded.');

  await prisma.rolePermission.deleteMany({});
  for (const [roleName, actions] of Object.entries(ROLE_PERMISSIONS)) {
    const role = dbRoles[roleName];
    for (const action of actions) {
      const permission = dbPermissions[action];
      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }
  console.log('RolePermissions mapped.');

  // 2. Seed Company
  const company = await prisma.company.upsert({
    where: { gst: '07AAAAA1111A1Z1' },
    update: {},
    create: {
      name: 'Forexmate Global Services Pvt Ltd',
      gst: '07AAAAA1111A1Z1',
      cin: 'U11111DL2026PTC111111',
      address: '101-104, Connaught Place, New Delhi, 110001',
      licenseNumber: 'RBI-FFMC-2026-0001',
      email: 'hq@forexmate.com',
      phone: '+911145678900',
    },
  });
  console.log(`Company "${company.name}" seeded.`);

  // 3. Seed Branch
  const branch = await prisma.branch.upsert({
    where: { branchCode: 'DEL-01' },
    update: {},
    create: {
      companyId: company.id,
      branchCode: 'DEL-01',
      branchName: 'Delhi Central Vault Branch',
      branchAddress: 'Ground Floor, CP Outer Circle, Delhi',
      branchCity: 'Delhi',
      workingHours: '09:00 - 18:00',
    },
  });
  console.log(`Branch "${branch.branchName}" seeded.`);

  // 4. Seed Countries
  const countries = [
    { name: 'India', iso2: 'IN', iso3: 'IND', nationality: 'Indian' },
    { name: 'United States', iso2: 'US', iso3: 'USA', nationality: 'American' },
    { name: 'Eurozone', iso2: 'EU', iso3: 'EUR', nationality: 'European' },
    { name: 'United Kingdom', iso2: 'GB', iso3: 'GBR', nationality: 'British' },
    { name: 'Singapore', iso2: 'SG', iso3: 'SGP', nationality: 'Singaporean' },
    { name: 'Australia', iso2: 'AU', iso3: 'AUS', nationality: 'Australian' },
  ];
  for (const c of countries) {
    await prisma.country.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
  }
  console.log('Countries seeded.');

  // 5. Seed Currencies
  const currencies = [
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 2 },
    { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
    { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
    { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2 },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimals: 2 },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimals: 2 },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimals: 2 },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimals: 2 },
    { code: 'THB', name: 'Thai Baht', symbol: '฿', decimals: 2 },
  ];
  const dbCurrencies = {};
  for (const curr of currencies) {
    dbCurrencies[curr.code] = await prisma.currency.upsert({
      where: { code: curr.code },
      update: {},
      create: curr,
    });
  }
  console.log('Currencies seeded.');

  // 6. Seed Forex Products
  const products = [
    { name: 'Foreign Currency Cash', code: 'CASH' },
    { name: 'Multi-Currency Forex Card', code: 'FOREX_CARD' },
    { name: 'Outward Remittance Wire', code: 'REMITTANCE' },
  ];
  for (const prod of products) {
    await prisma.forexProduct.upsert({
      where: { name: prod.name },
      update: {},
      create: prod,
    });
  }
  console.log('Forex Products seeded.');

  // 7. Seed Branch Vaults & Note Denominations
  const testVaultCurrencies = ['USD', 'EUR', 'GBP', 'SGD', 'AUD', 'AED', 'CAD', 'THB'];
  const notes = [100, 50, 20, 10, 5];

  for (const code of testVaultCurrencies) {
    const currency = dbCurrencies[code];
    const vault = await prisma.branchVault.upsert({
      where: {
        branchId_currencyId: {
          branchId: branch.id,
          currencyId: currency.id,
        },
      },
      update: {},
      create: {
        branchId: branch.id,
        currencyId: currency.id,
        totalAmount: 0.00, // Starts at 0, updated by note increments
      },
    });

    let vaultTotal = 0;
    for (const note of notes) {
      const noteCount = 100; // Seed 100 notes of each denomination
      vaultTotal += note * noteCount;

      await prisma.vaultDenomination.upsert({
        where: {
          vaultId_denomination: {
            vaultId: vault.id,
            denomination: note,
          },
        },
        update: { noteCount },
        create: {
          vaultId: vault.id,
          denomination: note,
          noteCount,
        },
      });
    }

    // Update vault totalAmount
    await prisma.branchVault.update({
      where: { id: vault.id },
      data: { totalAmount: vaultTotal },
    });
    console.log(`Vault for ${code} seeded with total: ${vaultTotal}`);
  }

  // 8. Seed API Providers
  await prisma.apiProvider.upsert({
    where: { name: 'FastForex' },
    update: {},
    create: {
      name: 'FastForex',
      apiUrl: 'https://api.fastforex.io',
      apiKey: process.env.FASTFOREX_API_KEY || 'demo-api-key',
      isActive: true,
    },
  });
  console.log('API Providers seeded.');

  // 9. Seed System Settings
  const settings = [
    { key: 'SMTP_HOST', value: 'smtp.mailtrap.io' },
    { key: 'SMTP_PORT', value: '2525' },
    { key: 'LRS_LIMIT_USD', value: '250000' },
    { key: 'DEFAULT_GST_RATE', value: '0.18' },
    { key: 'TCS_THRESHOLD_INR', value: '700000' },
    { key: 'TCS_UNDER_THRESHOLD_PCT', value: '0.00' },
    { key: 'TCS_ABOVE_THRESHOLD_PCT', value: '0.05' },
    { key: 'SERVICE_CHARGE_BUY', value: '0', category: 'PRICING' },
    { key: 'SERVICE_CHARGE_SELL', value: '0', category: 'PRICING' },
    { key: 'SERVICE_CHARGE_REMITTANCE', value: '0', category: 'PRICING' },
    { key: 'SERVICE_CHARGE_CARD', value: '0', category: 'PRICING' },
  ];
  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log('System Settings seeded.');

  // 10. Seed Users
  const userSeeds = [
    { email: 'admin@forexmate.com', role: 'SUPER_ADMIN', name: 'System Administrator' },
    { email: 'agent@forexmate.com', role: 'AGENT', name: 'Franchise Partner Agent' },
    { email: 'teller@forexmate.com', role: 'STAFF', name: 'CP Branch Teller' },
    { email: 'compliance@forexmate.com', role: 'COMPLIANCE', name: 'Corporate Compliance Officer' },
    { email: 'dealer@forexmate.com', role: 'DEALER', name: 'Treasury Desk Dealer' },
  ];

  const passHash = await bcrypt.hash('admin123', SALT_ROUNDS); // Use universal password 'admin123' for easy developer testing

  for (const u of userSeeds) {
    const role = dbRoles[u.role];
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { roleId: role.id },
      create: {
        email: u.email,
        password: passHash,
        fullName: u.name,
        roleId: role.id,
      },
    });

    if (u.role === 'STAFF') {
      await prisma.branchStaff.upsert({
        where: { userId: user.id },
        update: { branchId: branch.id },
        create: {
          branchId: branch.id,
          userId: user.id,
          designation: 'TELLER',
          status: 'ACTIVE',
        },
      });
    }
    console.log(`User [${u.email}] linked to role [${u.role}] seeded.`);
  }

  // 11. Seed Default Workflow
  const workflow = await prisma.workflow.upsert({
    where: { name: 'Order Fulfillment Workflow' },
    update: {},
    create: {
      name: 'Order Fulfillment Workflow',
    },
  });

  const workflowSteps = [
    { name: 'KYC Verification', role: 'COMPLIANCE', order: 1 },
    { name: 'Payment Capture', role: 'CUSTOMER', order: 2 },
    { name: 'Inventory Allocation', role: 'STAFF', order: 3 },
    { name: 'Courier Dispatch', role: 'STAFF', order: 4 },
    { name: 'Final Handover', role: 'STAFF', order: 5 },
  ];

  for (const ws of workflowSteps) {
    const role = dbRoles[ws.role];
    await prisma.workflowStep.create({
      data: {
        workflowId: workflow.id,
        stepName: ws.name,
        stepOrder: ws.order,
        roleId: role.id,
      },
    });
  }
  console.log('Fulfillment workflows & step order rules seeded.');

  console.log('--- ENTERPRISE CORE DB SEEDING COMPLETED ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
