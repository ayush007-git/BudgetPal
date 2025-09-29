#!/usr/bin/env node

/**
 * PostgreSQL Setup Script for BudgetPal Backend
 * This script helps set up the PostgreSQL database for the first time
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const setupDatabase = async () => {
  try {
    console.log('🚀 Setting up PostgreSQL database for BudgetPal...\n');

    // Create connection to PostgreSQL server (without specific database)
    const sequelize = new Sequelize(
      'postgres', // Connect to default 'postgres' database first
      process.env.POSTGRES_USER || 'postgres',
      process.env.POSTGRES_PASSWORD || 'password',
      {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: process.env.POSTGRES_PORT || 5432,
        dialect: 'postgres',
        logging: false
      }
    );

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL server');

    // Create database if it doesn't exist
    const dbName = process.env.POSTGRES_DB || 'budgetpal';
    try {
      await sequelize.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database '${dbName}' created successfully`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`ℹ️  Database '${dbName}' already exists`);
      } else {
        throw error;
      }
    }

    // Close connection
    await sequelize.close();

    // Now connect to the specific database
    const dbSequelize = new Sequelize(
      dbName,
      process.env.POSTGRES_USER || 'postgres',
      process.env.POSTGRES_PASSWORD || 'password',
      {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: process.env.POSTGRES_PORT || 5432,
        dialect: 'postgres',
        logging: false
      }
    );

    // Test connection to specific database
    await dbSequelize.authenticate();
    console.log(`✅ Connected to database '${dbName}'`);

    // Import and sync the User model
    const { default: User } = await import('./models/User.js');
    await User.sync({ force: false });
    console.log('✅ User table synchronized');

    await dbSequelize.close();
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Make sure your .env file is configured correctly');
    console.log('2. Run: npm start');
    console.log('3. Test your API endpoints using the test.rest file');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Check your .env file configuration');
    console.log('3. Verify database credentials');
    process.exit(1);
  }
};

// Run setup
setupDatabase();
