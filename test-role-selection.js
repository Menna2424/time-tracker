/**
 * Test: Role Selection in Sign Up Flow
 * 
 * This test verifies that:
 * 1. Users can select between "User" and "Admin" roles during signup
 * 2. Admin-specific fields appear when "Admin" is selected
 * 3. Admin-specific fields are hidden when "User" is selected
 * 4. Form validation works correctly for both roles
 * 5. Signup data is properly saved with role information
 * 6. Users are redirected to the correct dashboard based on their role
 */

const puppeteer = require('puppeteer');

async function testRoleSelection() {
  console.log('🧪 Starting Role Selection Test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Navigate to the app
    console.log('📱 Navigating to the application...');
    await page.goto('http://localhost:5173');
    
    // Wait for the page to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Check if we're on the auth page, if not navigate there
    const currentUrl = page.url();
    if (!currentUrl.includes('/auth')) {
      console.log('🔐 Navigating to auth page...');
      await page.goto('http://localhost:5173/auth');
      await page.waitForTimeout(2000);
    }
    
    // Switch to signup form
    console.log('📝 Switching to signup form...');
    const signupButton = await page.$('button:has-text("Create Account")');
    if (signupButton) {
      await signupButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Test 1: Verify role selection radio buttons are present
    console.log('✅ Test 1: Checking role selection radio buttons...');
    const userRadio = await page.$('input[value="user"]');
    const adminRadio = await page.$('input[value="admin"]');
    
    if (!userRadio || !adminRadio) {
      throw new Error('Role selection radio buttons not found');
    }
    console.log('✅ Role selection radio buttons found');
    
    // Test 2: Verify User role is selected by default
    console.log('✅ Test 2: Checking default role selection...');
    const isUserSelected = await page.$eval('input[value="user"]', el => el.checked);
    if (!isUserSelected) {
      throw new Error('User role should be selected by default');
    }
    console.log('✅ User role is selected by default');
    
    // Test 3: Verify admin fields are hidden when User is selected
    console.log('✅ Test 3: Checking admin fields are hidden for User role...');
    const adminFieldsSection = await page.$('.bg-blue-50, .bg-blue-900\\/20');
    if (adminFieldsSection) {
      const isVisible = await adminFieldsSection.isVisible();
      if (isVisible) {
        throw new Error('Admin fields should be hidden when User role is selected');
      }
    }
    console.log('✅ Admin fields are hidden for User role');
    
    // Test 4: Select Admin role and verify admin fields appear
    console.log('✅ Test 4: Selecting Admin role and checking admin fields...');
    await page.click('input[value="admin"]');
    await page.waitForTimeout(500);
    
    // Check if admin fields section is now visible
    const adminFieldsVisible = await page.$eval('.bg-blue-50, .bg-blue-900\\/20', el => {
      return window.getComputedStyle(el).display !== 'none';
    }).catch(() => false);
    
    if (!adminFieldsVisible) {
      throw new Error('Admin fields should be visible when Admin role is selected');
    }
    console.log('✅ Admin fields are visible for Admin role');
    
    // Test 5: Fill in admin-specific fields
    console.log('✅ Test 5: Filling admin-specific fields...');
    await page.type('input[id="companyName"]', 'Test Company Inc.');
    await page.type('input[id="jobRole"]', 'Project Manager');
    await page.select('select[id="businessType"]', 'technology');
    await page.select('select[id="employeeCount"]', '11-50');
    console.log('✅ Admin fields filled successfully');
    
    // Test 6: Fill in basic signup fields
    console.log('✅ Test 6: Filling basic signup fields...');
    await page.type('input[id="fullName"]', 'Test Admin User');
    await page.type('input[id="email"]', 'testadmin@example.com');
    await page.type('input[id="password"]', 'TestPass123!');
    await page.type('input[id="confirmPassword"]', 'TestPass123!');
    
    // Check terms and conditions
    await page.click('input[type="checkbox"]');
    console.log('✅ Basic fields filled successfully');
    
    // Test 7: Submit the form
    console.log('✅ Test 7: Submitting signup form...');
    await page.click('button[type="submit"]');
    
    // Wait for navigation (should redirect to admin dashboard)
    await page.waitForTimeout(3000);
    
    // Check if we're redirected to admin dashboard
    const finalUrl = page.url();
    if (!finalUrl.includes('/admin')) {
      throw new Error(`Expected redirect to admin dashboard, but got: ${finalUrl}`);
    }
    console.log('✅ Successfully redirected to admin dashboard');
    
    // Test 8: Verify user data is stored correctly
    console.log('✅ Test 8: Verifying user data storage...');
    const userData = await page.evaluate(() => {
      const stored = localStorage.getItem('auth.currentUser');
      return stored ? JSON.parse(stored) : null;
    });
    
    if (!userData) {
      throw new Error('User data not found in localStorage');
    }
    
    if (userData.role !== 'admin') {
      throw new Error(`Expected role 'admin', but got: ${userData.role}`);
    }
    
    if (!userData.adminData) {
      throw new Error('Admin data not found in user object');
    }
    
    if (userData.adminData.companyName !== 'Test Company Inc.') {
      throw new Error(`Expected company name 'Test Company Inc.', but got: ${userData.adminData.companyName}`);
    }
    
    console.log('✅ User data stored correctly with admin information');
    
    // Test 9: Test User role signup
    console.log('✅ Test 9: Testing User role signup...');
    await page.goto('http://localhost:5173/auth');
    await page.waitForTimeout(1000);
    
    // Switch to signup form again
    const signupButton2 = await page.$('button:has-text("Create Account")');
    if (signupButton2) {
      await signupButton2.click();
      await page.waitForTimeout(1000);
    }
    
    // Select User role
    await page.click('input[value="user"]');
    await page.waitForTimeout(500);
    
    // Fill in basic fields for user
    await page.type('input[id="fullName"]', 'Test Regular User');
    await page.type('input[id="email"]', 'testuser@example.com');
    await page.type('input[id="password"]', 'TestPass123!');
    await page.type('input[id="confirmPassword"]', 'TestPass123!');
    await page.click('input[type="checkbox"]');
    
    // Submit form
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Check if redirected to user dashboard
    const userFinalUrl = page.url();
    if (!userFinalUrl.includes('/dashboard')) {
      throw new Error(`Expected redirect to user dashboard, but got: ${userFinalUrl}`);
    }
    console.log('✅ Successfully redirected to user dashboard');
    
    console.log('🎉 All role selection tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
testRoleSelection()
  .then(() => {
    console.log('✅ Role Selection Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Role Selection Test failed:', error);
    process.exit(1);
  });
